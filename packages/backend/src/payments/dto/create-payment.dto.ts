import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({
    description: 'ID of the member',
    example: 1,
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  member_id: number;

  @ApiProperty({
    description: 'Amount of the payment',
    example: 250.0,
    type: Number,
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    description: 'Stripe payment ID',
    example: 'pi_123456789',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  stripe_payment_id: string;
}
