import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateMemberProfileDto {
  @ApiProperty({ description: 'Member full name', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @ApiPropertyOptional({
    description: 'Member phone number',
    example: '1234567890',
  })
  @IsString()
  @IsOptional()
  phone?: string;
}
