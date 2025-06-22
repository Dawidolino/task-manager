import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentChangeAction } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate?: Date;
}


@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(private firestore: AngularFirestore) { }

  // get tasks from firestore

  getTasks(): Observable<Task[]> {
    return this.firestore
      .collection<Omit<Task, 'id'>>('tasks')
      .snapshotChanges()
      .pipe(
        map(actions =>
          actions.map(a => {
            const data = a.payload.doc.data() as any;
            const id = a.payload.doc.id;
            const rawDue = data.dueDate;
            const dueDate: Date | undefined = rawDue
              ? (rawDue.toDate ? rawDue.toDate() : new Date(rawDue))
              : undefined;
            return {
              id,
              title: data.title,
              description: data.description,
              dueDate
            };
          })
        )
      );
  }


  // add
  addTask(task: Omit<Task, 'id'> & { dueDate?: Date }): Promise<void> {
    const id = this.firestore.createId();
    return this.firestore.collection('tasks').doc(id).set(task);
  }
  // edit
  updateTask(id: string, changes: Partial<Omit<Task, 'id'>>): Promise<void> {
    return this.firestore.collection('tasks').doc(id).update(changes);
  }
  // delete
  deleteTask(id: string): Promise<void> {
    return this.firestore.collection('tasks').doc(id).delete();
  }
}
