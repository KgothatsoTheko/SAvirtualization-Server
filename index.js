const express = require('express')
const app = express()

const cors = require('cors')
app.use(cors())

const dotenv = require('dotenv').config()

app.use(express.json())

const mongoose = require('mongoose')
mongoose.connect(process.env.MONGO_URL)
    .then(
        console.log("Connect to MongoDB...")
    )
    .catch(error => {
    console.log('Error, Something went wrong:', error)
})

const PORT = 6611
app.listen(process.env.SERVER_PORT || PORT, () => {
    console.log(`Server running on port ${process.env.SERVER_PORT}`);
})

