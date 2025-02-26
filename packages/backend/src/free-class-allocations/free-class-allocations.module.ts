import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FreeClassAllocationsService } from './free-class-allocations.service';
import { FreeClassAllocationsController } from './free-class-allocations.controller';
import { FreeClassAllocation } from './entities/free-class-allocation.entity';
import { MembersModule } from '../members/members.module';

@Module({
  imports: [TypeOrmModule.forFeature([FreeClassAllocation]), MembersModule],
  controllers: [FreeClassAllocationsController],
  providers: [FreeClassAllocationsService],
  exports: [FreeClassAllocationsService],
})
export class FreeClassAllocationsModule {}
