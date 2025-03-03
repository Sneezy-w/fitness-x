import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PaymentHistory } from './entities/payment-history.entity';
import { MembersModule } from '../members/members.module';
import { MembershipTypesModule } from '../membership-types/membership-types.module';
import { MembershipSubscriptionsModule } from '../membership-subscriptions/membership-subscriptions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentHistory]),
    ConfigModule,
    MembersModule,
    MembershipTypesModule,
    forwardRef(() => MembershipSubscriptionsModule),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
