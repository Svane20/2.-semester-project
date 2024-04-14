import { Module } from '@nestjs/common';
import { MqttService } from './mqtt.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [MqttService],
  controllers: [],
  exports: [MqttService],
})
export class MqttModule {}
