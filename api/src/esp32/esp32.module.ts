import { Module } from '@nestjs/common';
import { Esp32Controller } from './esp32.controller';
import { MqttModule } from '../mqtt/mqtt.module';
import { LockStatusGateway } from './lock-status.gateway';

@Module({
  imports: [MqttModule],
  providers: [LockStatusGateway],
  controllers: [Esp32Controller],
})
export class Esp32Module {}
