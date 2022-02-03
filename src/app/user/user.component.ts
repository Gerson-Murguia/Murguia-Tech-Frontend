import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { User } from '../model/user';
import { UserService } from '../service/user.service';
import { NotificationService } from '../service/notification.service';
import { NotificationType } from '../enum/notification-type.enum';
import { HttpErrorResponse } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { CustomHttpResponse } from '../model/custom-http-response';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  private titleSubject=new BehaviorSubject<string>('Users');
  public titleAction$=this.titleSubject.asObservable();
  public users:User[];
  public refreshing: boolean;
  private subscriptions: Subscription[] = [];
  public selectedUser: User;
  public profileImage:File|null;
  public filename: string;
  public editUser= new User();
  private currentUsername:string;
  constructor(private userService:UserService,private notificationService:NotificationService) { }

  ngOnInit(): void {
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

  public onDeleteUser(id:number):void{
    this.subscriptions.push(
      this.userService.deleteUser(id).subscribe(
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

  public onProfileImageChange(event:Event):void{
    const target=event.target as HTMLInputElement;
    const files=target.files as FileList;
    const file:File=files[0];

    this.filename=file.name;
    this.profileImage=file;
    console.log(file+' '+ this.filename)
  }

  public onResetPassword(email:string){
    this.refreshing=true;
    this.subscriptions.push(
      this.userService.resetPassword(email).subscribe(
        (response:CustomHttpResponse)=>{
          this.sendNotification(NotificationType.SUCCESS,response.message);
          this.refreshing=false;
        },
        (error:HttpErrorResponse)=>{
          this.sendNotification(NotificationType.ERROR,error.error.message);
          this.refreshing=false;

        }
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

  private clickButton(buttonId:string):void{
    document.getElementById(buttonId)?.click();
  }

  private sendNotification(notificationType:NotificationType, message: string) {
    this.notificationService.showNotification(notificationType,message);
  }

}
