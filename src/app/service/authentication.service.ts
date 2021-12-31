import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse , HttpResponse } from '@angular/common/http';
import { environment} from '../../environments/environment';
import { Observable } from 'rxjs';
import { User } from '../model/user';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private host:String=environment.apiUrl;
  
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

   
}
