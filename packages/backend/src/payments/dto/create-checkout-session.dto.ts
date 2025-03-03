import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateCheckoutSessionDto {
  @ApiProperty({
    description: 'ID of the membership type to subscribe to',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  membershipTypeId: number;
}
