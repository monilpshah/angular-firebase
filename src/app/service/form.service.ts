import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FormService {

  constructor(public fireservice:AngularFirestore) { }

  createUser(formdata:any){
    return this.fireservice.collection('users').add(formdata);
  }
}
