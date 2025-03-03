import { IsNotEmpty, IsOptional, IsString, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTrainerProfileDto {
  @ApiProperty({ description: 'Trainer full name', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @ApiPropertyOptional({
    description: 'Trainer specialization',
    example: 'Yoga',
  })
  @IsString()
  @IsOptional()
  specialization?: string;

  @ApiPropertyOptional({ description: 'Years of experience', example: 5 })
  @IsInt()
  @Min(0)
  @IsOptional()
  experience_years?: number;
}
