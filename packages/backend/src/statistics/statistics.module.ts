import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { Booking } from '../bookings/entities/booking.entity';
import { Schedule } from '../schedules/entities/schedule.entity';
import { Member } from '../members/entities/member.entity';
import { Class } from '../classes/entities/class.entity';
import { Trainer } from '../trainers/entities/trainer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, Schedule, Member, Class, Trainer]),
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}
