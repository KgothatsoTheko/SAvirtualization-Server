import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent {

  currentUser:any

  constructor(private shared: SharedService, private router: Router) {
    if(this.shared.get('currentUser', 'session')) {
      const user = this.shared.get('currentUser', 'session')
      this.currentUser = user.data
    } else {
      this.router.navigate(['/login'])
    }
    
  }
  

}
