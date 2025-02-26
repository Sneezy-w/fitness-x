import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembershipType } from './entities/membership-type.entity';
import { MembershipTypesController } from './membership-types.controller';
import { MembershipTypesService } from './membership-types.service';

@Module({
  imports: [TypeOrmModule.forFeature([MembershipType])],
  controllers: [MembershipTypesController],
  providers: [MembershipTypesService],
  exports: [MembershipTypesService],
})
export class MembershipTypesModule {}
