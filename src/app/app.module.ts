import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthInterceptor } from './interceptor/auth.interceptor';
import { AuthenticationGuard } from './guard/authentication.guard';
import { NotifierModule } from 'angular-notifier';
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NotifierModule
  ],
  providers: [AuthenticationGuard,{provide:HTTP_INTERCEPTORS, useClass:AuthInterceptor,multi:true}],
  bootstrap: [AppComponent]
})
export class AppModule { 

  constructor(){
    
  }
}
