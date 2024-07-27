const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendMail = require('./sendMail.js');
const { Readable } = require('stream');
const { MongoClient, GridFSBucket } = require('mongodb');
const multer = require('multer');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv')
dotenv.config();
const cookieParser = require('cookie-parser')

const app = express();

// Initialize multer for file handling
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// MongoDB connection and GridFSBucket initialization
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("Connected to MongoDB..."))
    .catch(error => console.log('Error, Something went wrong:', error));

let bucket;
mongoose.connection.on('connected', async () => {
    const client = new MongoClient(process.env.MONGO_URL);
    try {
        await client.connect();
        bucket = new GridFSBucket(client.db(), {
            bucketName: 'uploads'
        });
        console.log('GridFSBucket initialized');
    } catch (err) {
        console.error('Error initializing GridFSBucket', err);
    }
});

app.use(cors());
app.use(express.json());
app.use(cookieParser())

// DB schema
const File = new mongoose.Schema({
    filename: { type: String, required: true },
    id: { type: String, required: true },
    contentType: { type: String, required: true },
    fileId: { type: String, required: true },
    length: { type: Number, required: true }
});

const License = new mongoose.Schema({
    licenseNumber: { type: String },
    valid: { type: String },
    issued: { type: String },
    code: { type: String },
    vehicleRestriction: { type: Number },
    firstIssued: { type: String },
});

const userSchema = new mongoose.Schema({
    fullForeName: { type: String },
    lastName: { type: String },
    idNumber: { type: String, required: true },
    dateOfBirth: { type: String },
    citizenship: { type: String },
    gender: { type: String },
    license: License,
    email: { type: String, required: false, unique: true },
    password: { type: String, required: false },
    file: File,
});

const RefreshToken = new mongoose.Schema({
    token: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    expiresAt: { type: Date, required: true }
});

const User = mongoose.model("User", userSchema);

const RefreshTokenModel = mongoose.model("RefreshToken", RefreshToken);

const authenticateToken = (req, res, next) => {
    const token = req.cookies.access_token;

    if (!token) {
        return res.status(401).send("Access Token required");
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).send("Invalid Access Token");
        }

        req.user = user;
        next();
    });
};

// Endpoints
app.get('/', (req, res) => {
    res.status(200).send(`<style>*{
        text-align: center;</style>
        <h3> Welcome To SAvirtualization🎴</h3>
        <marquee style="background-color: ghostwhite;"><h2>Change what you can, the world is already changing, don't stay behind.</h2></marquee>
       `);
});
app.post('/register', async (req, res) => {
    try {
        const existingPerson = await User.findOne({ idNumber: req.body.idNumber });
        if (existingPerson) {
            return res.status(400).send("User already registered with this ID number, Sign In!");
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(req.body.password, salt);

        const payload = { ...req.body, password: hashPassword };
        delete payload.confirmPassword
        const newPerson = new User(payload);
        const result = await newPerson.save();

        const mailOptions = {
            from: {
                name: "Kgothatso Theko",
                address: "kgothatsotheko7@gmail.com"
            },
            to: payload.email,
            subject: "RSA Virtualization Profile Created",
            text: "Account successfully created",
            html: `<h3>Welcome ${payload.fullForeName},</h3>
              <blockquote>Your profile has successfully been created. Awaiting verification and validating your information with South African Government Department of Home Affairs (DHA) and Transport.</blockquote><br/>
              <footer> KTK Virtualization™️. All rights reserved.</footer>`,
        };
        sendMail(mailOptions);
        res.status(201).send(result);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});
app.post('/login', async (req, res) => {
    try {
        const existingPerson = await User.findOne({ idNumber: req.body.idNumber });
        if (!existingPerson) {
            return res.status(404).send("User is not found");
        }

        const passwordCheck = await bcrypt.compare(req.body.password, existingPerson.password);
        if (!passwordCheck) {
            return res.status(401).send('Password is Incorrect');
        }

        const accessToken = jwt.sign({
            id: existingPerson._id,
        }, process.env.JWT_SECRET, { expiresIn: "10m" });

        const refreshToken = jwt.sign({
            id: existingPerson._id,
        }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

        const newRefreshToken = new RefreshTokenModel({
            token: refreshToken,
            userId: existingPerson._id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });

        await newRefreshToken.save();

        res.cookie("access_token", accessToken, { httpOnly: true, secure: true, sameSite: "Strict" });
        res.cookie("refresh_token", refreshToken, { httpOnly: true, secure: true, sameSite: "Strict" });

        res.status(200).json({
            status: 200,
            message: "Login Success",
            data: existingPerson
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

app.post('/token', async (req, res) => {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
        return res.status(401).send("Refresh Token not provided");
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const existingToken = await RefreshTokenModel.findOne({ token: refreshToken, userId: decoded.id });

        if (!existingToken) {
            return res.status(401).send("Invalid Refresh Token");
        }

        const newAccessToken = jwt.sign({
            id: decoded.id,
        }, process.env.JWT_SECRET, { expiresIn: "10m" });

        res.cookie("access_token", newAccessToken, { httpOnly: true, secure: true, sameSite: "Strict" });

        res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
        console.error(error);
        res.status(401).send("Invalid Refresh Token");
    }
});

// FIle upload
app.post('/upload/:idNumber', authenticateToken, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send("No file uploaded");
        }

        const existingPerson = await User.findOne({ idNumber: req.params.idNumber });
        if (!existingPerson) {
            return res.status(404).send("User not found");
        }

        const { originalname, mimetype, buffer } = req.file;

        const uploadStream = bucket.openUploadStream(originalname, {
            contentType: mimetype,
            metadata: { user: req.params.idNumber }
        });

        const readBuffer = new Readable();
        readBuffer.push(buffer);
        readBuffer.push(null);

        readBuffer.pipe(uploadStream)
            .on('error', (err) => res.status(500).send("Error uploading file"))
            .on('finish', async () => {
                const newFile = {
                    filename: originalname,
                    id: uploadStream.id.toString(),
                    contentType: mimetype,
                    length: buffer.length,
                    fileId: new Date().getTime().toString(),
                };

                existingPerson.file = newFile;
                await existingPerson.save();

                res.status(201).send({
                    message: "File uploaded successfully",
                    file: newFile
                });
            });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});
// Get File
app.get('/get-file/:id', authenticateToken, (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send("Invalid file ID");
    }

    const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(id));

    downloadStream.on('error', (err) => {
        if (err.code === 'ENOENT') {
            return res.status(404).send("File not found");
        }
        return res.status(500).send("Internal Server Error");
    });

    downloadStream.on('file', (file) => {
        res.set('Content-Type', file.contentType);
    });

    downloadStream.pipe(res);
});


const PORT = process.env.SERVER_PORT || 2522;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
