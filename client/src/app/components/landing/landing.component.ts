import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {

  currentYear:number = new Date().getFullYear()

  constructor(private router: Router){}

  goToAbout() {
  const about = document.getElementById('about-us')
    about?.scrollIntoView({behavior: 'smooth'})
  }

  goToContact() {
  const contact = document.getElementById('contact')
    contact?.scrollIntoView({behavior: 'smooth'})
  }

  goToServices() {
  const services = document.getElementById('services') 
    services?.scrollIntoView({behavior: 'smooth'})
  }

  goToRegistration() {
    this.router.navigate(['registration'])
  }

  goToLogin() {
    this.router.navigate(['login'])
  }


}
