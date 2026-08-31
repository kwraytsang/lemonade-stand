import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BeveragesModule } from './modules/beverages/beverages.module';
import { HealthModule } from './modules/health/health.module';
import { OrdersModule } from './modules/orders/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DATABASE_HOST', 'localhost'),
        port: config.get<number>('DATABASE_PORT', 5432),
        username: config.get('DATABASE_USER', 'lemonade'),
        password: config.get('DATABASE_PASSWORD', 'lemonade'),
        database: config.get('DATABASE_NAME', 'lemonade'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    HealthModule,
    BeveragesModule,
    OrdersModule,
  ],
})
export class AppModule {}
