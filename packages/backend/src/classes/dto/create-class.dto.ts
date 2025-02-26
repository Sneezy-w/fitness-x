import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsBoolean,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateClassDto {
  @ApiProperty({
    description: 'Name of the class',
    example: 'Yoga',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Description of the class',
    example: 'A relaxing yoga class for all levels',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Duration of the class in minutes',
    example: 60,
    type: Number,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  duration: number;

  @ApiProperty({
    description: 'Maximum capacity of the class',
    example: 20,
    type: Number,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  capacity: number;

  @ApiProperty({
    description: 'Whether the class is active',
    example: true,
    default: true,
    type: Boolean,
  })
  @IsBoolean()
  is_active?: boolean = true;
}
