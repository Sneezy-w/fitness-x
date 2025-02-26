import { PartialType } from '@nestjs/swagger';
import { CreateMembershipSubscriptionDto } from './create-membership-subscription.dto';

export class UpdateMembershipSubscriptionDto extends PartialType(
  CreateMembershipSubscriptionDto,
) {}
