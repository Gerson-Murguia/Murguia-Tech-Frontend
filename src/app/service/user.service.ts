import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse , HttpEvent, HttpResponse } from '@angular/common/http';
import { environment} from '../../environments/environment';
import { Observable } from 'rxjs';
import { User } from '../model/user';
import { JwtHelperService } from "@auth0/angular-jwt";
import { CustomHttpResponse } from '../model/custom-http-response';
@Injectable({
  providedIn: 'root'
})
export class UserService {

  private host=environment.apiUrl;
  constructor(private http:HttpClient) { }

  public getUsers(): Observable<User[]>{
    return this.http.get<User[]>(`${this.host}/user/list`);
  }

  public addUser(formData: FormData): Observable<User>{
    return this.http.post<User>(`${this.host}/user/add`,formData);
  }

  public updateUser(formData: FormData): Observable<User>{
    return this.http.post<User>(`${this.host}/user/update`,formData);
  }

  //retorna un httpResponse personalizado
  public resetPassword(email:string): Observable<CustomHttpResponse>{
    return this.http.get<any>(`${this.host}/user/resetPassword/${email}`);
  }

  //trackea el progreso del update de la imagen
  public updateProfileImage(formData: FormData): Observable<HttpEvent<User>>{
    return this.http.post<User>(`${this.host}/user/updateProfileImage`,formData,{reportProgress:true,observe:'events'});
  }

  public deleteUser(userId:number): Observable<CustomHttpResponse>{
    return this.http.delete<any>(`${this.host}/user/delete/${userId}`);
  }

  public addUsersToLocalCache(users:User[]): void{
   
   localStorage.setItem('users',JSON.stringify(users));
  }

  public getUsersFromLocalCache(): User[] | null{
   
    if (localStorage.getItem('users')) {
      return JSON.parse(localStorage.getItem('users')|| '{}');
    }
    return null;
  }

  //utility method
  public createUserFormData(loggedInUsername:string,user:User,profileImage:File): FormData{
    const formData = new FormData();
    formData.append('currentUsername',loggedInUsername);
    formData.append('firstName',user.firstName);
    formData.append('lastName',user.lastName);
    formData.append('username',user.username);
    formData.append('email',user.email);
    formData.append('role',user.roles);
    formData.append('profileImage',profileImage);
    formData.append('isActive',JSON.stringify(user.active));
    formData.append('isNotLocked',JSON.stringify(user.notLocked));

    return formData;
  }

  public getUser(username:string): Observable<User>{
    return this.http.get<User>(`${this.host}/user/find/${username}`);
  }

}
