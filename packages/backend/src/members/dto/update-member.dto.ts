import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateMemberDto } from './create-member.dto';
import { IsString } from 'class-validator';

export class UpdateMemberDto extends PartialType(CreateMemberDto) {
  @ApiProperty({
    description: 'Stripe customer ID',
    example: 'cus_1234567890',
  })
  @IsString()
  stripe_customer_id: string;
}
