import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { User } from '../model/user';
import { UserService } from '../service/user.service';
import { NotificationService } from '../service/notification.service';
import { NotificationType } from '../enum/notification-type.enum';
import { HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { CustomHttpResponse } from '../model/custom-http-response';
import { AuthenticationService } from '../service/authentication.service';
import { Router } from '@angular/router';
import { FileUploadStatus } from '../model/file-upload.status';
import { Role } from '../enum/rol.enum';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  private titleSubject=new BehaviorSubject<string>('Lista de Usuarios');
  public titleAction$=this.titleSubject.asObservable();
  public users:User[];
  public user:User;
  public refreshing: boolean;
  private subscriptions: Subscription[] = [];
  public selectedUser: User;
  public profileImage:File|null;
  public filename: string;
  public editUser= new User();
  private currentUsername:string;
  public fileStatus=new FileUploadStatus();


  constructor(private userService:UserService,
    private authenticationService:AuthenticationService,
    private notificationService:NotificationService,
    private router:Router) { }

  ngOnInit(): void {
    this.user=this.authenticationService.getUserFromLocalCache()
    this.getUsers(true);
  }

  public changeTitle(title: string):void {
    this.titleSubject.next(title);
  }

  public getUsers(showNotification:boolean):void {
    this.refreshing=true;
    this.subscriptions.push(this.userService.getUsers().subscribe(
      (response:User[])=>{
        this.userService.addUsersToLocalCache(response);
        this.users=response;
        this.refreshing=false;
        if (showNotification) {
          this.sendNotification(NotificationType.SUCCESS,`${response.length} usuarios cargados satisfactoriamente.`)
        }
      },
      (errorResponse:HttpErrorResponse)=>{
          this.sendNotification(NotificationType.ERROR,`Ocurrio un error, intentelo de nuevo`)
          this.refreshing=false;
      }
    ));
  }

  public onLogOut():void{
    this.authenticationService.logOut();
    this.router.navigate(['/login']);
    this.sendNotification(NotificationType.SUCCESS,'Cierre de sesión exitoso');
  }

  public updateProfileImage():void{
    this.clickButton('profileImageInput');
  }

  public onProfileImageChange(event:Event):void{
    const target=event.target as HTMLInputElement;
    const files=target.files as FileList;
    const file:File=files[0];

    this.filename=file.name;
    this.profileImage=file;
    console.log(file+' '+ this.filename)
  }
  //muestra el progreso del evento de updateprofileimage
  public onUpdateProfileImage():void{
    const formData=new FormData();
    formData.append('username',this.user.username);
    formData.append('profileImage',this.profileImage);
    this.subscriptions.push(
      this.userService.updateProfileImage(formData).subscribe(
        (event:HttpEvent<any>) =>{
          this.reportUploadProgress(event);
        },
        (errorResponse:HttpErrorResponse)=>{
          this.sendNotification(NotificationType.ERROR,errorResponse.error?.message);
        }
      )
    );



  }
  reportUploadProgress(event:HttpEvent<any>):void {
    switch (event.type) {
      //cuando el evento esta en progreso
      case HttpEventType.UploadProgress:
        this.fileStatus.percentage=Math.round(100*event.loaded/event.total);
        this.fileStatus.status='progress';
        break;
        //cuando el evento termina
      case HttpEventType.Response:
        if (event.status===200) {
          this.user.profileImageUrl=`${event.body.profileImageUrl}?time=${new Date().getTime()}`
          this.sendNotification(NotificationType.SUCCESS, `${event.body.firstName} Imagen de perfil actualizada`);          
          this.fileStatus.status='done'
          //refrescar el currentuser para actualizar la imagen
          this.authenticationService.addUserToLocalCache(event.body);   
          this.getUsers(false);
        }else{
          this.sendNotification(NotificationType.ERROR,`No se pudo actualizar la imagen`);
        }
        break;
        default:
          'Terminaron los procesos';
        break;
    }
  }

  public onUpdateCurrentUser(user:User):void{
    this.refreshing=true;
    this.currentUsername=this.authenticationService.getUserFromLocalCache().username;
    const formData=this.userService.createUserFormData(this.currentUsername,user,this.profileImage);

    this.subscriptions.push(
      this.userService.updateUser(formData).subscribe(
        (response:User)=>{
          this.authenticationService.addUserToLocalCache(response);
          this.getUsers(false);
          this.filename=null;
          this.profileImage=null;
           this.refreshing=false;
          this.sendNotification(NotificationType.SUCCESS,`${response.firstName} ${response.lastName} editado exitosamente`);
          //refrescar cambios
        
        },
        (errorResponse:HttpErrorResponse)=>{
          this.sendNotification(NotificationType.ERROR,errorResponse.error.message);
          this.profileImage=null;
          this.refreshing=false;
          console.log('Error onUpdateCurrentUser')
        }
      )
    );
  }

  public onSelectUser(selectedUser:User):void{
    this.selectedUser=selectedUser;
    this.clickButton('openUserInfo');
  }
  public saveNewUser():void{
    this.clickButton('new-user-save');
  }

  public onAddNewUser(userForm:NgForm):void{
    
    //se rellena el formData
    const formData=this.userService.createUserFormData(null,userForm.value,this.profileImage!);

    this.subscriptions.push(
      this.userService.addUser(formData).subscribe(
        (response:User)=>{
          this.clickButton('new-user-close');
          this.getUsers(false);
          this.filename=null;
          this.profileImage=null;
          userForm.reset();
          this.sendNotification(NotificationType.SUCCESS,`${response.firstName} ${response.lastName} añadido exitosamente`);
        },
        (errorResponse:HttpErrorResponse)=>{
          this.sendNotification(NotificationType.ERROR,errorResponse.error.message);
          this.profileImage=null;
        }
      )
    );
    
  }

  public onDeleteUser(username:string):void{
    this.subscriptions.push(
      this.userService.deleteUser(username).subscribe(
        (response:CustomHttpResponse)=>{
          this.sendNotification(NotificationType.SUCCESS,  response.message);
          this.getUsers(false);
          
        },
        (errorResponse:HttpErrorResponse)=>{
          this.sendNotification(NotificationType.ERROR,  errorResponse.error?.message)
        }
      )
    );
  }
  public onEditUser(editUser:User):void{
    this.editUser=editUser;
    //username antes del cambio
    this.currentUsername=editUser.username;

    this.clickButton('openUserEdit');
  }

  public onUpdateUser(){
    //se rellena el formData
    const formData=this.userService.createUserFormData(this.currentUsername,this.editUser,this.profileImage);

    this.subscriptions.push(
      this.userService.updateUser(formData).subscribe(
        (response:User)=>{
          this.clickButton('edit-user-close');
          this.getUsers(false);
          this.filename=null;
          this.profileImage=null;
          this.sendNotification(NotificationType.SUCCESS,`${response.firstName} ${response.lastName} editado exitosamente`);
        },
        (errorResponse:HttpErrorResponse)=>{
          this.sendNotification(NotificationType.ERROR,errorResponse.error.message);
          this.profileImage=null;
        }
      )
    );
  }



  public onResetPassword(emailForm:NgForm){
    this.refreshing=true;
    const email=emailForm.value['resetPasswordEmail'];
    this.subscriptions.push(
      this.userService.resetPassword(email).subscribe(
        (response:CustomHttpResponse)=>{
          this.sendNotification(NotificationType.SUCCESS,response.message);
          this.refreshing=false;
        },
        (error:HttpErrorResponse)=>{
          this.sendNotification(NotificationType.WARNING,error.error.message);
          this.refreshing=false;

        },
        ()=>{emailForm.reset()}
      )
    );
  }

  public searchUsers(searchTerm:string):void{
    console.log(searchTerm);
    const results:User[]=[];
    for(const user of this.userService.getUsersFromLocalCache()){
      //busca si el substring se encuentra en el string
      if (user.firstName.toLowerCase().indexOf(searchTerm.toLowerCase())!==-1
      || user.lastName.toLowerCase().indexOf(searchTerm.toLowerCase())!==-1
      || user.username.toLowerCase().indexOf(searchTerm.toLowerCase())!==-1 
      || user.userId.toLowerCase().indexOf(searchTerm.toLowerCase())!==-1
      || user.email.toLowerCase().indexOf(searchTerm.toLowerCase())!==-1) {
        results.push(user);
      }
    }
    this.users=results;
    if(results.length==0 || !searchTerm){
      //si no hay usuarios encontrados se recupera los usuarios del cache
      this.users=this.userService.getUsersFromLocalCache();
    }
  }

  public get isAdmin(): boolean {
    return this.getUserRole()==Role.ADMIN || this.getUserRole()==Role.SUPER_ADMIN;  
  }

  public get isManager(): boolean {
    return this.getUserRole()==Role.MANAGER; 
  }

  public get isAdminOrManager(): boolean {
    return this.isAdmin||this.isManager; 
  }

  public getUserRole(): string {
    return this.authenticationService.getUserFromLocalCache().roles;
  }


  private clickButton(buttonId:string):void{
    document.getElementById(buttonId)?.click();
  }

  private sendNotification(notificationType:NotificationType, message: string) {
    this.notificationService.showNotification(notificationType,message);
  }

}
