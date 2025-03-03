import {
  IsNotEmpty,
  IsNumber,
  IsDateString,
  IsString,
  IsBoolean,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMembershipSubscriptionDto {
  @ApiProperty({ description: 'ID of the member', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  member_id: number;

  @ApiProperty({ description: 'ID of the membership type', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  membership_type_id: number;

  @ApiProperty({
    description: 'Start date of the subscription',
    example: '2023-01-01',
  })
  @IsDateString()
  @IsNotEmpty()
  start_date: string;

  @ApiProperty({
    description: 'End date of the subscription',
    example: '2023-02-01',
  })
  @IsDateString()
  @IsNotEmpty()
  end_date: string;

  @ApiProperty({ description: 'Stripe subscription ID', example: 'sub_12345' })
  @IsString()
  @IsNotEmpty()
  stripe_subscription_id: string;

  @ApiProperty({
    description: 'Remaining classes in the subscription',
    example: 20,
  })
  @IsNumber()
  @IsNotEmpty()
  remaining_classes: number;

  // @ApiProperty({
  //   description: 'Status of the subscription',
  //   example: 'active',
  // })
  // @IsString()
  // @IsNotEmpty()
  @IsEnum(['active', 'expired', 'canceled'])
  @IsOptional()
  status: 'active' | 'expired' | 'canceled';

  @IsBoolean()
  @IsOptional()
  auto_renew: boolean;
}
