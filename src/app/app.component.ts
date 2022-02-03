import { Component, OnInit } from '@angular/core';
import { from, Observable, Subject } from 'rxjs';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {


  constructor(){}

  ngOnInit(): void {
    
    
    
    
    
    
    /*
    const subject = new Subject();// creamos nuestro subject

    // Subscripción 1 al Subject que es un Observable
    subject.subscribe((data) => {
      console.log(data); // 0.799234057357979
    });

    // Subscripción 2 al Subject que es un Observable
    subject.subscribe((data) => {
      console.log(data); // 0.799234057357979
    });
      subject.next(Math.random());

    */

    /*OPERATOR TAKE
    const timer=interval(1000).pipe(take(4));
    const rango=range(1,10);

    const result=concat(timer,rango);
    
    result.subscribe(
      x=> console.log(x)
    );*/
  }
}


