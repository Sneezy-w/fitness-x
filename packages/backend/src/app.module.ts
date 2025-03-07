import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MembersModule } from './members/members.module';
import { TrainersModule } from './trainers/trainers.module';
import { AuthModule } from './auth/auth.module';
import { ClassesModule } from './classes/classes.module';
import { SchedulesModule } from './schedules/schedules.module';
import { BookingsModule } from './bookings/bookings.module';
import { MembershipTypesModule } from './membership-types/membership-types.module';
import { MembershipSubscriptionsModule } from './membership-subscriptions/membership-subscriptions.module';
import { FreeClassAllocationsModule } from './free-class-allocations/free-class-allocations.module';
import { PaymentsModule } from './payments/payments.module';
import { StatisticsModule } from './statistics/statistics.module';

type DBSecret = {
  host: string;
  port: number;
  username: string;
  password: string;
  dbname: string;
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        //console.log(configService.get('DB_HOST', 'localhost'));
        const db_secret = configService.get<string>('DB_SECRET', '{}');
        const db_secret_json = JSON.parse(db_secret) as DBSecret;
        const db_host =
          db_secret_json.host || configService.get('DB_HOST', 'localhost');
        const db_port =
          db_secret_json.port || configService.get<number>('DB_PORT', 3306);
        const db_username =
          db_secret_json.username || configService.get('DB_USERNAME', 'root');
        const db_password =
          db_secret_json.password || configService.get('DB_PASSWORD', '');
        const db_dbname =
          db_secret_json.dbname ||
          configService.get('DB_DATABASE', 'fitness_x');
        return {
          type: 'mysql',
          host: db_host,
          port: db_port,
          username: db_username,
          password: db_password,
          database: db_dbname,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: configService.get('DB_SYNCHRONIZE', 'false') === 'true',
          ssl: {
            rejectUnauthorized:
              configService.get('DB_REJECT_UNAUTHORIZED', 'false') === 'true',
          },
        };
      },
    }),
    MembersModule,
    TrainersModule,
    AuthModule,
    ClassesModule,
    SchedulesModule,
    BookingsModule,
    MembershipTypesModule,
    MembershipSubscriptionsModule,
    FreeClassAllocationsModule,
    PaymentsModule,
    StatisticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
