import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertModule } from './alerts/alert.module';
import { Alert } from './alerts/entities/alert.entity';
import { MailModule } from './mail/mail.module';
import { Price } from './prices/entities/price.entity';
import { PriceModule } from './prices/price.module';
import { SwapModule } from './swaps/swap.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forFeature([Price, Alert]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),

    ScheduleModule.forRoot(),
    AlertModule,
    PriceModule,
    MailModule,
    SwapModule,
  ],
})
export class AppModule {}
