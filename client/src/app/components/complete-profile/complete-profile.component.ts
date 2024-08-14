import { DatePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-complete-profile',
  templateUrl: './complete-profile.component.html',
  styleUrls: ['./complete-profile.component.scss'],
  providers: [DatePipe]
})
export class CompleteProfileComponent{

  startDate = new FormControl('', Validators.required)
  endDate = new FormControl('',Validators.required)
  checked = false
  codes:string[] = ['A', 'A1', 'B', 'C1', 'C', 'EB', 'EC1', 'EC']
  numbers:string[] = ['0','1', '2', '3', '4', '5', '6']
  PrDP:string[] = ['Goods', 'Passengers', 'Dangerous']
  showSignature = false
  showingMenu = true
  element: string = "No Signature"
  fileName:any | string="No Portrait"
  upload:any
  fileChoosen:any
  uploadFileClicked = false;
  hideSignatureClicked = false;
  card1: any
  card3: any 
  valid1 = true
  valid2 = true
  currentUser:any


  constructor(private shared: SharedService, 
    private datePipe: DatePipe, 
    private api: ApiService, 
    private cd: ChangeDetectorRef, 
    private snackbar: MatSnackBar,
    private router: Router) {

    this.currentUser = this.shared.get('newUser', 'session')
  }

  // Upload portrait
  uploadFile() {
    if(this.uploadFileClicked) return
    this.uploadFileClicked = true;

    this.upload = document.getElementById('upload') as HTMLInputElement;
    this.fileChoosen = document.getElementById('file-choosen');

    if (this.upload && this.fileChoosen) {
      this.upload.addEventListener('change', (event: Event) => {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
          this.fileChoosen.textContent = input.files[0].name;
          this.fileName = input.files[0].name
          this.shared.set('portrait', JSON.stringify({ name: input.files[0].name, size: input.files[0].size, type: input.files[0].type }), 'session')
          this.card1 = document.getElementById('card1')!.style.backgroundColor = 'green'
          const formData = new FormData();
          formData.append('file', input.files[0], input.files[0].name)
          this.api.genericPost(`/upload/${this.currentUser.idNumber}`,formData).subscribe(
            (response:any) => {
              console.log("upload success")
            },
            (error:any) => {
              this.snackbar.open(`error: ${error.error}`, 'Ok', { duration: 2000 });
            }
          )
          this.valid1 = false
        }
      }
      );
    } else {
      console.log("something went wrong...");
      
    }
  }

  profileForm = new FormGroup({
    licenseNumber: new FormControl('', Validators.required),
    valid: new FormControl('', Validators.required),
    issued: new FormControl('ZA', Validators.required),
    code: new FormControl('', Validators.required),
    vehicleRestriction: new FormControl('', Validators.required),
    firstIssued: new FormControl('', Validators.required),
  })

  check() {
    this.checked = !this.checked;
  }

  goBack() {
    this.shared.goBack()
  }

  complete() {
    const startDate1 = this.startDate.value
    const endDate1 = this.endDate.value
    const firstIssued1 = this.profileForm.controls['firstIssued'].value
    if (startDate1 && endDate1 && firstIssued1) {
      const formattedStartDate = this.datePipe.transform(this.startDate.value, 'dd/MM/yyyy');
      const formattedEndDate = this.datePipe.transform(this.endDate.value, 'dd/MM/yyyy');
      const formattedfirstIssued = this.datePipe.transform(this.profileForm.controls['firstIssued'].value, 'dd/MM/yyyy');
      this.profileForm.get('valid')?.setValue(`${formattedStartDate} - ${formattedEndDate}`);
      this.profileForm.get('firstIssued')?.setValue(`${formattedfirstIssued}`);
    }

    if (this.checked) {
      const form = this.profileForm.value
      this.api.genericPost(`/update-user/${this.currentUser.idNumber}`,{license: form}).subscribe(
        (response:any) => {
          console.log("Updated User");
        },
        (error: any) => {
          this.snackbar.open(`error: ${error.error}`, 'Ok', { duration: 2000 });
        }
      )
    }

    if(!this.valid1 && !this.valid2 ) {
      this.router.navigate(['/landing'])
      sessionStorage.clear()
      this.snackbar.open(`Registeration Complete, Awaiting Verification`, 'Ok', { duration: 2000 });
    }

  }

  hideSignature() {
    if(this.hideSignatureClicked) return
    this.hideSignatureClicked = true
    this.showSignature = true
    this.showingMenu = false
    this.element = "Signature Taken ✅"
    this.valid2 = false
    this.card3 = document.getElementById('card3');
    this.card3.style.backgroundColor = 'green'
  }
  handleEvent(event:any) {
    this.showSignature = false
    this.showingMenu = event
  }

  handleEvent2(event:any) {
    if (event) {
      this.shared.set('imageData',JSON.stringify(event), 'session')
      const imageData = this.shared.get('imageData', 'session')
      this.api.genericPost(`/upload-image/${this.currentUser.idNumber}`,{imageData:imageData}).subscribe(
        (response:any) => {
          console.log("uploaded signature")
        },
        (error:any) => {
          this.snackbar.open(`error: ${error.error}`, 'Ok', { duration: 2000 });
        }
      )
    } else {
      console.log("something went wrong...");
    }
  }
}

