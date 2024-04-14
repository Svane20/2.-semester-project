import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Subscription, take } from 'rxjs';
import { MqttService } from '../mqtt/mqtt.service';
import { Server } from 'socket.io';
import { Logger, OnModuleDestroy } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: [process.env.PC_IP, 'http://localhost:4200', 'http://localhost'],
  },
})
export class LockStatusGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, OnModuleDestroy {
  @WebSocketServer() server: Server;

  private readonly logger = new Logger(LockStatusGateway.name);

  private lockStatusSubscription: Subscription;
  private healthStatusSubscription: Subscription;

  constructor(private readonly mqttService: MqttService) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  afterInit(server: Server): any {
    this.lockStatusSubscription = this.mqttService.getLockStatus().subscribe(lockStatus => {
      if (lockStatus?.value) {
        server.emit('lockStatus', lockStatus);
      }
    });

    this.healthStatusSubscription = this.mqttService.getHealthStatus().subscribe(healthStatus => {
      if (healthStatus?.value) {
        server.emit('healthStatus', healthStatus);
      }
    });
  }

  handleConnection(client: any): any {
    this.logger.log(`Client connected: ${client.id}`);

    // Emit the current lock status when client connected
    this.mqttService
      .getLockStatus()
      .pipe(take(1))
      .subscribe(lockStatus => this.server.emit('lockStatus', lockStatus));
  }

  handleDisconnect(client: any): any {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  onModuleDestroy(): void {
    this.lockStatusSubscription.unsubscribe();
    this.healthStatusSubscription.unsubscribe();
  }
}
