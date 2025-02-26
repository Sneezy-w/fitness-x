import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMembershipTypeDto {
  @ApiProperty({ description: 'Name of the membership type', example: 'Basic' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Monthly price of the membership',
    example: 250.0,
  })
  @IsNumber()
  monthly_price: number;

  @ApiPropertyOptional({
    description: 'Number of classes allowed per month',
    example: 20,
  })
  @IsNumber()
  @IsOptional()
  class_limit?: number;
}
