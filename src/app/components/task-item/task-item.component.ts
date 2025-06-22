import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TaskService, Task } from '../../services/task.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-task-item',
  standalone: false,
  templateUrl: './task-item.component.html',
  styleUrls: ['./task-item.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class TaskItemComponent {
  @Input() task!: Task;
  @Output() delete = new EventEmitter<string>();

  editMode = false;
  editForm!: FormGroup;

  constructor(
    private taskService: TaskService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) { }

  onDelete(): void {
    this.delete.emit(this.task.id);
  }

  toggleEdit(): void {
    this.editMode = true;

    // prepare hour in HH:mm format
    const d = this.task.dueDate ?? new Date();
    const hh = d.getHours().toString().padStart(2, '0');
    const mm = d.getMinutes().toString().padStart(2, '0');

    this.editForm = this.fb.group({
      title: [this.task.title, Validators.required],
      description: [this.task.description],
      dueDateDate: [this.task.dueDate ?? null, Validators.required],
      dueDateTime: [`${hh}:${mm}`, Validators.required]
    });
  }

  save(): void {
    if (this.editForm.invalid) return;

    const { title, description, dueDateDate, dueDateTime } = this.editForm.value;
    // combine date and time into a single JS Date
    const newDate = new Date(dueDateDate);
    const [hour, minute] = dueDateTime.split(':').map((n: string) => parseInt(n, 10));
    newDate.setHours(hour, minute, 0, 0);

    this.taskService
      .updateTask(this.task.id, { title, description, dueDate: newDate })
      .then(() => {
        // local update to see the changes immediately
        this.task.title = title;
        this.task.description = description;
        this.task.dueDate = newDate;

        this.snackBar.open('Zadanie zaktualizowane', 'OK', { duration: 2000 });
        this.editMode = false;
      });
  }

  cancel(): void {
    this.editMode = false;
  }

  getRemaining(): string {
    if (!this.task.dueDate) return '';
    const now = new Date();
    const diff = this.task.dueDate.getTime() - now.getTime();
    if (diff <= 0) return '🚨 po terminie';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${days}d ${hours}h ${mins}m`;
  }
}
