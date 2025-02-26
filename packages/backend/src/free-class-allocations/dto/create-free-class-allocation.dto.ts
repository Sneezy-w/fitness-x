import { IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFreeClassAllocationDto {
  @ApiProperty({ description: 'ID of the member', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  member_id: number;

  @ApiProperty({
    description: 'Number of free classes to allocate',
    example: 5,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  quantity: number;
}
