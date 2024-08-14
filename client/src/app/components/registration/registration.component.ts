import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent {
  dateOfBirth!:string;
  idNumber:any;
  Date:any;
  year!: any;
  month!: string;
  day!: string;
  age!:any
  gender:any;
  citizen:any;
  hidePassword = true;
  registrationForm!: FormGroup

  constructor(private shared: SharedService, private snackbar: MatSnackBar, private router: Router, private api: ApiService){
    this.registrationForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      fullForeName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      idNumber: new FormControl('', [Validators.required, Validators.maxLength(13), Validators.minLength(13)]),
      dateOfBirth: new FormControl('',Validators.required),
      citizenship: new FormControl('',Validators.required),
      gender: new FormControl('',Validators.required),
      password: new FormControl('',Validators.required),
      confirmPassword: new FormControl('', [Validators.required]),
    })
    this.Date = new Date().getFullYear()
  }

  goBack() {
    this.shared.goBack()
  }

  

  ngOnInit() {
    this.year = 'YY';
    this.month = 'MM';
    this.day = 'DD';
    this.registrationForm.reset()
    sessionStorage.clear()
  }
  
  

  IdValid() {

    this.dateOfBirth = this.registrationForm.controls['idNumber'].value.toString(); 
    let date = ''
   if(this.dateOfBirth.slice(0,1) === '0') {
    date = '20'
   } else {
    date = '19'
   }
   this.year = date + this.dateOfBirth.slice(0, 2);
   this.month = this.dateOfBirth.slice(2, 4);
   this.day = this.dateOfBirth.slice(4, 6);
  
   this.citizenship()
   this.genders()
  
   this.registrationForm.patchValue({
     dateOfBirth: this.year + this.month + this.day,
     gender: this.gender,
     citizenship: this.citizen
   });
  }
  
  
  genders(){
    this.gender;
    if (parseInt(this.dateOfBirth.charAt(6), 10) >= 5) {
      this.gender = "Male";
    } else {
      this.gender = 'Female';
    }
  }
  
  citizenship(){
    let C = this.dateOfBirth.slice(10, 11);
    this.citizen;
    if (C === "0") {
      this.citizen = "RSA";
    } else {
      this.citizen = "not South African";
    }
  }

  show() {
    this.hidePassword = !this.hidePassword;
  }

  register() {

    if (this.registrationForm.get('password')?.value !== this.registrationForm.get('confirmPassword')?.value) {
      this.registrationForm.get('confirmPassword')?.setErrors({ 'pattern': true });
      this.snackbar.open(`Password doesn't match`, 'Ok', {duration: 2000})
      return;
    }
    if(this.registrationForm.invalid) {
      this.snackbar.open(`Please fill in all fields`, 'Ok', {duration: 2000})
      return;
    } else {
      const registerData = this.registrationForm.value
      this.api.genericPost('/register', registerData).subscribe(
        (response: any) => {
          this.shared.set('newUser', JSON.stringify(response), 'session')
          this.router.navigate(['/complete-profile']); // Navigate to the complete profile page after successful login
          this.snackbar.open(`Registeration Successful`, 'Ok', { duration: 2000 });
        },
        (error) => {
          this.snackbar.open(`Register Failed: ${error.error}`, 'Ok', { duration: 2000 });
        }
      );
    }
    
  }


}
