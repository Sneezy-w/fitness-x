import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({
    description: 'The ID of the member',
    example: 1,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  member_id: number;

  @ApiProperty({
    description: 'The ID of the schedule',
    example: 1,
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  schedule_id: number;

  @ApiProperty({
    description: 'Whether the booking is marked as attended',
    example: false,
    default: false,
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  is_attended?: boolean = false;

  @ApiProperty({
    description: 'Whether the booking used a free class',
    example: false,
    default: false,
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  used_free_class?: boolean = false;
}
