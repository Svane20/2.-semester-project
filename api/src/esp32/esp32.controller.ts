import { Controller, Get, UseGuards } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MqttService } from '../mqtt/mqtt.service';
import { HealthStatus, LockStatus } from '../mqtt/models/mqtt-response';

@ApiTags('esp32')
@UseGuards(JwtAuthGuard)
@Controller('api/esp32')
export class Esp32Controller {
  constructor(private readonly mqttService: MqttService) {}

  @Get('status')
  public async getLockStatus(): Promise<LockStatus> {
    return await firstValueFrom(this.mqttService.getLockStatus());
  }

  @Get('health')
  public getHealthStatus(): Promise<HealthStatus> {
    return firstValueFrom(this.mqttService.getHealthStatus());
  }

  @Get('unlock')
  public unlockDoor(): void {
    this.mqttService.publish();
  }
}
