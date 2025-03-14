import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembershipSubscription } from './entities/membership-subscription.entity';
import { MembershipSubscriptionsController } from './membership-subscriptions.controller';
import { MembershipSubscriptionsService } from './membership-subscriptions.service';
import { MembersModule } from '../members/members.module';
import { MembershipTypesModule } from '../membership-types/membership-types.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MembershipSubscription]),
    MembersModule,
    MembershipTypesModule,
    forwardRef(() => PaymentsModule),
  ],
  controllers: [MembershipSubscriptionsController],
  providers: [MembershipSubscriptionsService],
  exports: [MembershipSubscriptionsService],
})
export class MembershipSubscriptionsModule {}
