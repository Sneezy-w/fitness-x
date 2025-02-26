import { PartialType } from '@nestjs/swagger';
import { CreateMembershipTypeDto } from './create-membership-type.dto';

export class UpdateMembershipTypeDto extends PartialType(
  CreateMembershipTypeDto,
) {}
