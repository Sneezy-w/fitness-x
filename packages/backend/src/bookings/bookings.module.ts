import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { Booking } from './entities/booking.entity';
import { MembersModule } from '../members/members.module';
import { SchedulesModule } from '../schedules/schedules.module';
import { MembershipSubscriptionsModule } from '../membership-subscriptions/membership-subscriptions.module';
import { FreeClassAllocationsModule } from '../free-class-allocations/free-class-allocations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking]),
    MembersModule,
    SchedulesModule,
    MembershipSubscriptionsModule,
    FreeClassAllocationsModule,
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
