import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { User } from '../model/user';
import { AuthenticationService } from '../service/authentication.service';
import { NotificationService } from '../service/notification.service';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit,OnDestroy {
  
  public showLoading: boolean;
  private subscriptions: Subscription[]=[];
  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private notificationService:NotificationService) { }

  ngOnInit(): void {
    if (this.authenticationService.isLoggedIn()) {
      this.router.navigateByUrl('/user/administracion');
    }else{
      this.router.navigateByUrl('/register');
    }
    
  }



  public onLogin(user:User):void{
    this.showLoading=true;
    console.log(user);
    this.subscriptions.push(this.authenticationService.login(user)
      .subscribe(
        (response:HttpResponse<User>|HttpErrorResponse) => {
          const token=response.headers.get('Jwt-Token');

        }
      )
    );
  }

  ngOnDestroy(): void {

  }
}
