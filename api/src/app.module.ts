import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Esp32Module } from './esp32/esp32.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/user.entity';
import { UserModule } from './user/user.module';
import { MqttModule } from './mqtt/mqtt.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.MYSQL_HOST || 'localhost',
      port: 3306,
      username: 'admin_user',
      password: 'admin_password',
      database: 'users',
      entities: [User],
      synchronize: true,
      retryAttempts: 50,
    }),
    ConfigModule.forRoot(),
    Esp32Module,
    MqttModule,
    AuthModule,
    UserModule,
  ],
})
export class AppModule {}
