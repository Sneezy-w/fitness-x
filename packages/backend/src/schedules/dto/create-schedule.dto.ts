import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsDateString, IsBoolean } from 'class-validator';

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
    description: 'Start time of the class',
    example: '2023-07-15T10:00:00.000Z',
    type: String,
  })
  @IsDateString()
  @IsNotEmpty()
  start_time: string;

  @ApiProperty({
    description: 'End time of the class',
    example: '2023-07-15T11:00:00.000Z',
    type: String,
  })
  @IsDateString()
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
}
