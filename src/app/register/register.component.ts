import { Component, OnInit, OnDestroy } from '@angular/core';
import { User } from '../model/user';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthenticationService } from '../service/authentication.service';
import { NotificationService } from '../service/notification.service';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationType } from '../enum/notification-type.enum';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

 
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



  public onRegister(user:User):void{
    this.showLoading=true;
    this.subscriptions.push(this.authenticationService.register(user)
      .subscribe(
        (response:User) => {
          this.showLoading=false;
          this.notificationService.showNotification(NotificationType.SUCCESS,`Se creo una nueva cuenta para: ${response.username} . La contraseña se ha enviado, por favor, revista tu email para logearte.`);
        },
        (errorResponse:HttpErrorResponse)=>{
          console.log(errorResponse);
          this.sendNotification(NotificationType.ERROR,errorResponse.error.message);
          this.showLoading=false;
        }

      )
    );
  }
  sendNotification(notificationType: NotificationType, message: any):void {
    if (message) {
      this.notificationService.showNotification(notificationType,message);
    }else{
      this.notificationService.showNotification(notificationType,'Ocurrio un error. Por favor, intentelo de nuevo');
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub=>sub.unsubscribe())
  }


}
