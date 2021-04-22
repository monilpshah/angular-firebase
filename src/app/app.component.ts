import { CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component } from '@angular/core';
import { Task } from './task/task';
import { MatDialog } from '@angular/material/dialog';
import { TaskDialogComponent, TaskDialogResult } from './task-dialog/task-dialog.component';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import {Form, FormControl, Validators} from '@angular/forms';
import { FormService } from './service/form.service';
import { formDetails } from './formDetails';


const getObservable = (collection: AngularFirestoreCollection<Task>) => {
  const subject = new BehaviorSubject<Task[]>([]);
  collection.valueChanges({ idField: 'id' }).subscribe((val: Task[]) => {
    subject.next(val);
  });
  return subject;
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  // title = 'task-management';
  
  constructor(private dialog:MatDialog, private store:AngularFirestore, private _formService:FormService){}

  todo = getObservable(this.store.collection('todo'));
  inProgress = getObservable(this.store.collection('inProgress'));
  done = getObservable(this.store.collection('done'));

  editTask(list: 'done' | 'todo' | 'inProgress', task: Task): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '270px',
      data : {
        task,
        enableDelete : true
      }
    });
    dialogRef.afterClosed().subscribe((result : TaskDialogResult) => {
      if(result.delete){
        this.store.collection(list).doc(task.id).delete();
      }
      else{
        this.store.collection(list).doc(task.id).update(task);
      }
    });
  }

  drop(event: CdkDragDrop<Task[]|null>): void {
    if (event.previousContainer === event.container) {
      return;
    }
    if (!event.previousContainer.data || !event.container.data) {
      return;
    }
    const item = event.previousContainer.data[event.previousIndex];
    this.store.firestore.runTransaction(() => {
      return Promise.all([
        this.store.collection(event.previousContainer.id).doc(item.id).delete(),
        this.store.collection(event.container.id).add(item)
      ]);
    });
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
  }

  newTask() :void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width:'270px',
      data : {
        task : {}
      }
    });
    dialogRef.afterClosed().subscribe((result : TaskDialogResult) => this.store.collection('todo').add(result.task));
  }

  // FORM EMAIL VALIDATION
  email = new FormControl('', [Validators.required, Validators.email]);

  getErrorMessage() {
    if (this.email.hasError('required')) {
      return 'You must enter a value';
    }

    return this.email.hasError('email') ? 'Not a valid email' : '';
  }

  // Form Code Starts
  uname: string | undefined;
  uemail: string | undefined;
  umsg: string | undefined;
  

  formSubmit(){
    let record:any = {};
    record['uname'] = this.uname;
    record['uemail']= this.uemail;
    record['umsg']=this.umsg;
    this._formService.createUser(record).then (res => {
      console.log(res);
      alert("Record Added to database...");
      this.ngOnInit();
    });
  }
  ngOnInit() {
    // throw new Error('Method not implemented.');
  }
}
