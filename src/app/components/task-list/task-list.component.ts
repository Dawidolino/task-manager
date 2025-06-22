import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { TaskService, Task } from '../../services/task.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-task-list',
  standalone: false,
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit {
  tasks$!: Observable<Task[]>;

  constructor(
    private taskService: TaskService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.tasks$ = this.taskService.getTasks();
  }

  onDelete(id: string): void {
    this.taskService.deleteTask(id).then(() => {
      this.snackBar.open('Zadanie usunięte', 'OK', { duration: 2000 });
    });
  }
}
