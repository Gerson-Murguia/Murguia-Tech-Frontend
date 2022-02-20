export class User{
    public userId:string;
    public firstName:string;
    public lastName:string;
    public username:string;
    public email:string;
    public profileImageUrl:string;
    public lastLoginDate:Date;
    public lastLoginDateDisplay:Date;
    public joinDate:Date;
    public roles:string;
    public authorities:[];
    public active:boolean;
    public notLocked:boolean;    

    constructor(){
        this.userId='';
        this.firstName ='';
        this.lastName='';
        this.username ='';
        this.email ='';
        this.lastLoginDate=null;
        this.lastLoginDateDisplay=null;
        this.joinDate=null;
        this.profileImageUrl='';
        this.active =false;
        this.notLocked =false;
        this.roles='';
        this.authorities=[];
    }
}