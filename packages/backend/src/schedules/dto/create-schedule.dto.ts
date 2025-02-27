import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsDateString,
  IsBoolean,
  Matches,
  Min,
} from 'class-validator';

export class CreateScheduleDto {
  @ApiProperty({
    description: 'The ID of the class',
    example: 1,
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  class_id: number;

  @ApiProperty({
    description: 'The ID of the trainer',
    example: 1,
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  trainer_id: number;

  @ApiProperty({
    description: 'The date of the schedule (YYYY-MM-DD)',
    example: '2023-07-15',
  })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({
    description: 'Start time (HH:mm)',
    example: '10:00',
  })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  @IsNotEmpty()
  start_time: string;

  @ApiProperty({
    description: 'End time (HH:mm)',
    example: '11:00',
  })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  @IsNotEmpty()
  end_time: string;

  @ApiProperty({
    description: 'Whether the schedule is cancelled',
    example: false,
    default: false,
    type: Boolean,
  })
  @IsBoolean()
  is_cancelled?: boolean = false;

  @ApiProperty({
    description: 'Maximum capacity of the class',
    example: 20,
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  capacity: number;
}
