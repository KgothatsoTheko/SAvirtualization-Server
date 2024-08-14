import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { SharedService } from 'src/app/services/shared.service';


@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss']
})
export class CardsComponent{

  currentUser:any
  profile:string | undefined
  barcode1:string | undefined
  barcode2:string | undefined

  panelOpenState = false;
  date:any = new Date().getDate() + '/' + new Date().getMonth() + '/' + new Date().getFullYear()
  value:any = new Date().getTime()
  width:any = 0.4
  height:any = 20
  value2:any = 1207175222083
  width2:any = 1.32
  height2:any = 40

  constructor(private shared: SharedService, private api: ApiService, private snackbar: MatSnackBar, private router: Router) {
    const user = this.shared.get('currentUser', 'session')
    this.currentUser = user.data
    console.log(this.currentUser);

    this.api.genericGet(`/get-file/${this.currentUser.file.id}`).subscribe(
      (response:Blob) => {
          this.createImageFromBlob(response, 'profile');
      },
      (error:any) => {
        this.snackbar.open(`Session Expired`, 'Ok', { duration: 2000 });
        sessionStorage.clear()
        this.router.navigate(['/login'])
      }
    )

    this.generateBarcode1();
    this.generateBarcode2();

    
  }

  private createImageFromBlob(image: Blob, type: string) {
    let reader = new FileReader();
    reader.addEventListener('load', () => {
      switch (type) {
        case 'profile':
          this.profile = reader.result as string;
          break;
        case 'barcode1':
          this.barcode1 = reader.result as string;
          break;
        case 'barcode2':
          this.barcode2 = reader.result as string;
          break;
      }
    }, false);

    if (image) {
      reader.readAsDataURL(image);
    }
  }

  generateBarcode1() {
    this.api.genericBarcode(`/generate-barcode/${this.currentUser.idNumber}`).subscribe(
      (response: Blob) => {
        this.createImageFromBlob(response, 'barcode1');
      },
      (error: any) => {
        this.snackbar.open(`Failed to generate barcode`, 'Ok', { duration: 2000 });
      }
    );
  }

  generateBarcode2() {
    const body = { text: this.currentUser.idNumber };  // Customize the text as needed
    this.api.generateBarcode2(body).subscribe(
      (response: Blob) => {
        this.createImageFromBlob(response, 'barcode2');
      },
      (error: any) => {
        this.snackbar.open(`Failed to generate barcode`, 'Ok', { duration: 2000 });
      }
    );
  }
  
}
