import { Component, inject, OnInit } from '@angular/core';
import { map, Observable, take } from 'rxjs';
import { HealthStatus, LockStatus } from '../../models/esp32-response';
import { LockStatusService } from '../../services/lock-status.service';
import { AsyncPipe, NgIf, TitleCasePipe } from '@angular/common';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgIf, AsyncPipe, TimeAgoPipe, TitleCasePipe, MatIconButton, MatIcon, MatButton],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  public healthStatus: Observable<HealthStatus>;
  public lockStatus: Observable<LockStatus>;
  public isUnlocked: Observable<boolean>;

  private readonly lockStatusService: LockStatusService = inject(LockStatusService);
  private readonly authService = inject(AuthService);

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  ngOnInit(): void {
    this.healthStatus = this.lockStatusService.getHealthStatus();
    this.lockStatus = this.lockStatusService.getLockStatus();
    this.isUnlocked = this.lockStatus.pipe(map(lockStatus => lockStatus.value === 'unlocked'));
  }

  public unlockDoor(event: MouseEvent): void {
    this.isUnlocked.pipe(take(1)).subscribe(isUnlocked => {
      event.preventDefault();
      event.stopPropagation();

      if (isUnlocked) {
        return;
      }

      this.lockStatusService.unlockDoor();
    });
  }
}
