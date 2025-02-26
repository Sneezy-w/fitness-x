import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchedulesService } from './schedules.service';
import { SchedulesController } from './schedules.controller';
import { Schedule } from './entities/schedule.entity';
import { ClassesModule } from '../classes/classes.module';
import { TrainersModule } from '../trainers/trainers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Schedule]),
    ClassesModule,
    TrainersModule,
  ],
  controllers: [SchedulesController],
  providers: [SchedulesService],
  exports: [SchedulesService],
})
export class SchedulesModule {}
