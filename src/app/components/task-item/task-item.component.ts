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
    this.editForm = this.fb.group({
      title: [this.task.title, Validators.required],
      description: [this.task.description],
      dueDate: [this.task.dueDate ?? null, Validators.required]
    });
  }

  save(): void {
    if (!this.editForm.valid) return;

    const { title, description, dueDate } = this.editForm.value;
    this.taskService
      .updateTask(this.task.id, { title, description, dueDate })
      .then(() => {
        this.snackBar.open('Zadanie zaktualizowane', 'OK', { duration: 2000 });
        this.editMode = false;
      });
  }

  cancel(): void {
    this.editMode = false;
  }

  // Oblicza pozostały czas – jeśli brak dueDate, zwraca pusty string
  getRemaining(): string {
    if (!this.task.dueDate) {
      return '';
    }
    const now = new Date();
    const diff = this.task.dueDate.getTime() - now.getTime();
    if (diff <= 0) {
      return '🚨 po terminie';
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${days}d ${hours}h ${mins}m`;
  }
}
