import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { User } from '../model/user';
import { AuthenticationService } from '../service/authentication.service';
import { NotificationService } from '../service/notification.service';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { NotificationType } from '../enum/notification-type.enum';

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
    }
  }



  public onLogin(user:User):void{
    this.showLoading=true;
    this.subscriptions.push(this.authenticationService.login(user)
      .subscribe(
        (response:HttpResponse<User>) => {
          const token=response.headers.get('Jwt-Token');
          console.log(token)
          //guardado en variable y local storage
          this.authenticationService.saveToken(token!);
          this.authenticationService.addUserToLocalCache(response.body!);
          this.router.navigateByUrl('/user/administracion');
          this.showLoading=false;
        },
        (errorResponse:HttpErrorResponse)=>{
          console.log(errorResponse);
          this.sendNotificationError(NotificationType.ERROR,errorResponse.error.message);
          this.showLoading=false;
        }

      )
    );
  }
  sendNotificationError(ERROR: NotificationType, message: any):void {
    if (message) {
      this.notificationService.showNotification(ERROR,message);
    }else{
      this.notificationService.showNotification(ERROR,'Ocurrio un error. Por favor, intentelo de nuevo');
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub=>sub.unsubscribe())
  }

}
