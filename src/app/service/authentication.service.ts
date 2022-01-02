import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse , HttpResponse } from '@angular/common/http';
import { environment} from '../../environments/environment';
import { Observable } from 'rxjs';
import { User } from '../model/user';
import { JwtHelperService } from "@auth0/angular-jwt";

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  public host:string=environment.apiUrl;
  private token:string="";
  private loggedInUsername: string="";
  private helper = new JwtHelperService();

  constructor(private http:HttpClient) {
  
   }

   public login(user:User):Observable<HttpResponse<any> | HttpErrorResponse>{

    return this.http.post<HttpResponse<any>| HttpErrorResponse>(
      `${this.host}/user/login`, user,{observe:'response'});
      //por default da el body, con el observe se pide la response completa, con response,headers,body
   }

  public register(user:User):Observable<User | HttpErrorResponse>{

    return this.http.post<User| HttpErrorResponse>(
      `${this.host}/user/register`, user);
  }

  public logOut():void{
    this.token="";
    this.loggedInUsername="";
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('users');
  }

  public saveToken(token:string):void{
    this.token=token;
    localStorage.setItem('token',token);
  }

  public addUserToLocalCache(user:User):void{
    
    localStorage.setItem('user',JSON.stringify(user));
  }

  
  public getUserToLocalCache():User{
  
    return JSON.parse(localStorage.getItem('user') || '{}');
  }

  public loadToken():void{
  
      this.token=localStorage.getItem('token') || '';
  }

  //getter
  public getToken():string{
  
    return this.token;
  }

  public isLoggedIn():boolean{
    //obtener token del localstorage
    this.loadToken();
    if (this.token!=null&& this.token !='') {
      
      if (this.helper.decodeToken(this.token).sub != null || '') {

        if (!this.helper.isTokenExpired(this.token)) {
          this.loggedInUsername=this.helper.decodeToken(this.token).sub;
          return true;
        }else{
          return false;
        }   
      }else{
        return false;
      }
    }else{
      this.logOut();
      return false;
    }
  }

}
