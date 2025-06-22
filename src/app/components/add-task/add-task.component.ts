import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TaskService, Task } from '../../services/task.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-add-task',
  standalone: false,
  templateUrl: './add-task.component.html',
  styleUrls: ['./add-task.component.scss'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ height: 0, opacity: 0 }),
        animate('300ms ease-out', style({ height: '*', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ height: 0, opacity: 0 }))
      ])
    ])
  ]
})
export class AddTaskComponent {
  taskForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private snackBar: MatSnackBar
  ) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      dueDateDate: [null, Validators.required],  // date
      dueDateTime: [null, Validators.required]   // hour
    });
  }

  addTask(): void {
    if (this.taskForm.invalid) {
      return;
    }
    const raw = this.taskForm.value;
    // combine date and time into a single JS Date
    const dateOnly: Date = raw.dueDateDate;
    const [hour, minute] = (raw.dueDateTime as string).split(':').map((n: string) => parseInt(n, 10));
    const dueDate = new Date(dateOnly);
    dueDate.setHours(hour, minute, 0, 0);

    const payload: Omit<Task, 'id'> & { dueDate?: Date } = {
      title: raw.title,
      description: raw.description,
      dueDate
    };

    this.taskService.addTask(payload).then(() => {
      this.snackBar.open('Dodano zadanie', 'OK', { duration: 2000 });
      this.taskForm.reset({ title: '', description: '', dueDateDate: null, dueDateTime: null });
    });
  }
}
