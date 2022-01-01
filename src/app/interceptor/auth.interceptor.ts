import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../service/authentication.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  //el interceptor funciona como un filter de java, se tiene que registrar en provider en el app.module

  constructor(private authenticationService:AuthenticationService) {}

  intercept(httpRequest: HttpRequest<any>, httpHandler: HttpHandler): Observable<HttpEvent<any>> {
   
    if (httpRequest.url.includes(`${this.authenticationService.host}/user/login`)) {
         return httpHandler.handle(httpRequest);
    }
    if (httpRequest.url.includes(`${this.authenticationService.host}/user/register`)) {
         return httpHandler.handle(httpRequest);
    }
    if (httpRequest.url.includes(`${this.authenticationService.host}/user/resetPassword`)) {
         return httpHandler.handle(httpRequest);
    }

    //antes de llegar a estas rutas agregar el token jwt

    //pasar el token del localStorage a la variable token
    this.authenticationService.loadToken();
    const token = this.authenticationService.getToken();
    //las request son inmutables, asi que se tiene q clonar para agregar un header extra
    const request=httpRequest.clone({setHeaders:{Authorization: `Bearer ${token}`}})
    return httpHandler.handle(request);

  }
}
