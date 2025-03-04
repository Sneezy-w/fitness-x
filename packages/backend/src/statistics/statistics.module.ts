import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { Member } from '../members/entities/member.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { Schedule } from '../schedules/entities/schedule.entity';
import { Trainer } from '../trainers/entities/trainer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Member, Booking, Schedule, Trainer])],
  controllers: [StatisticsController],
  providers: [StatisticsService],
  exports: [StatisticsService],
})
export class StatisticsModule {}
