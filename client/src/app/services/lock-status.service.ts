import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { HealthStatus, LockStatus } from '../models/esp32-response';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LockStatusService {
  private readonly BACKEND_URL = environment.serviceUrls.backendUrl;

  private socket: Socket;

  private lockStatus = new BehaviorSubject<LockStatus>(null);

  private healthStatus = new BehaviorSubject<HealthStatus>(null);

  constructor(private httpClient: HttpClient) {
    this.socket = io(this.BACKEND_URL);

    this.socket.on('connect', () => {
      console.log('Connected to NestJS websocket');
    });

    this.socket.on('connect_error', error => {
      console.error('Failed to connect to NestJS websocket', error);
    });

    this.socket.on('lockStatus', (lockStatus: LockStatus) => {
      this.lockStatus.next(lockStatus);
    });

    this.socket.on('healthStatus', (healthStatus: HealthStatus) => {
      this.healthStatus.next({
        ...healthStatus,
        lastUpdate: new Date(),
      });
    });

    this.socket.on('disconnect', reason => {
      console.log('Client disconnected with reason: ', reason);
    });
  }

  public getLockStatus(): Observable<LockStatus> {
    return this.lockStatus.asObservable();
  }

  public getHealthStatus(): Observable<HealthStatus> {
    return this.healthStatus.asObservable();
  }

  public unlockDoor(): void {
    this.httpClient.get(`${this.BACKEND_URL}/api/esp32/unlock`).subscribe();
  }
}
