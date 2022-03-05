import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthenticationGuard } from './guard/authentication.guard';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { UserComponent } from './user/user.component';

const routes: Routes = [
{path:'login', component: LoginComponent},
{path:'registro', component:RegisterComponent},
{path:'', redirectTo:'/login', pathMatch:'full'},
{path:'user/administracion', component:UserComponent,canActivate: [AuthenticationGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
