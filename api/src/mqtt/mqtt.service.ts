import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as mqtt from 'mqtt';
import { HealthStatus, LockStatus, MQTTResponse } from './models/mqtt-response';
import { BehaviorSubject, Observable } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MqttService implements OnModuleInit {
  private readonly COMMAND_TOPIC = 'smartlock/command';
  private readonly STATE_TOPIC = 'smartlock/state';
  private readonly HEARTBEAT_TOPIC = 'smartlock/heartbeat';

  private readonly logger = new Logger(MqttService.name);
  private client: mqtt.MqttClient = null;

  private lockStatus = new BehaviorSubject<LockStatus>(null);
  private healthStatus = new BehaviorSubject<HealthStatus>(null);

  constructor(private configService: ConfigService) {}

  onModuleInit(): void {
    const nodeEnv = this.configService.get('NODE_ENV');
    const isProd = nodeEnv === 'production';
    const mqttBrokerUrl = `mqtt://${isProd ? 'mosquitto' : '192.168.87.61'}:8883`;

    this.client = mqtt.connect(mqttBrokerUrl, {
      username: this.configService.get('MQTT_USERNAME'),
      password: this.configService.get('MQTT_PASSWORD'),
    });

    this.client.on('connect', () => {
      this.logger.log('Connected to MQTT Broker at ' + mqttBrokerUrl);
      this.subscribeToTopics();
    });

    this.client.on('message', (topic, message) => {
      if (topic === this.STATE_TOPIC) {
        try {
          this.lockStatus.next(JSON.parse(message.toString()));
        } catch (error) {
          this.logger.error(
            `Failed to parse message: ${message.toString()} from topic: ${topic}`,
          );
        }
      }

      if (topic === this.HEARTBEAT_TOPIC) {
        try {
          const msg = JSON.parse(message.toString()) as MQTTResponse;
          const healthStatus: HealthStatus = {
            ...msg,
            lastUpdate: new Date(),
          };
          this.healthStatus.next(healthStatus);
        } catch (error) {
          this.logger.error(
            `Failed to parse message: ${message.toString()} from topic: ${topic}`,
          );
        }
      }
    });

    this.client.on('error', (error) => {
      this.logger.error('Error connecting to MQTT Broker:', error);
    });
  }

  public getLockStatus(): Observable<LockStatus> {
    return this.lockStatus.asObservable();
  }

  public getHealthStatus(): Observable<HealthStatus> {
    return this.healthStatus.asObservable();
  }

  public publish(): void {
    this.client.publish(
      this.COMMAND_TOPIC,
      JSON.stringify({ command: 'unlock' }),
    );
    this.logger.log(`Sent command to ${this.COMMAND_TOPIC} to unlock door`);
  }

  private subscribeToTopics(): void {
    this.client.subscribe(
      [this.STATE_TOPIC, this.HEARTBEAT_TOPIC],
      (err, granted) => {
        if (err) {
          this.logger.error('Subscription error:', err);
        } else {
          this.logger.log(
            `Subscribed to topics: ${granted.map((g) => g.topic).join(', ')}`,
          );
        }
      },
    );
  }
}
