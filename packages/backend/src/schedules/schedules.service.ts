import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { Schedule } from './entities/schedule.entity';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { ClassesService } from '../classes/classes.service';
import { TrainersService } from '../trainers/trainers.service';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,
    private classesService: ClassesService,
    private trainersService: TrainersService,
  ) {}

  async create(createScheduleDto: CreateScheduleDto): Promise<Schedule> {
    // Verify that the class exists
    await this.classesService.findOne(createScheduleDto.class_id);

    // Verify that the trainer exists and is approved
    const trainer = await this.trainersService.findOne(
      createScheduleDto.trainer_id,
    );
    if (!trainer.is_approved) {
      throw new BadRequestException('Trainer is not approved');
    }

    // Convert string dates to Date objects
    const startTime = new Date(createScheduleDto.start_time);
    const endTime = new Date(createScheduleDto.end_time);

    // Validate that end time is after start time
    if (endTime <= startTime) {
      throw new BadRequestException('End time must be after start time');
    }

    // Check for overlapping schedules for the trainer
    const trainerSchedules = await this.findOverlappingTrainerSchedules(
      trainer.id,
      startTime,
      endTime,
    );
    if (trainerSchedules.length > 0) {
      throw new BadRequestException(
        'Trainer already has a schedule at this time',
      );
    }

    // Create the schedule
    const schedule = this.scheduleRepository.create({
      ...createScheduleDto,
      start_time: startTime,
      end_time: endTime,
    });

    return this.scheduleRepository.save(schedule);
  }

  async findAll(): Promise<Schedule[]> {
    return this.scheduleRepository.find({
      relations: ['class', 'trainer'],
      order: { start_time: 'ASC' },
    });
  }

  async findUpcoming(): Promise<Schedule[]> {
    const now = new Date();
    return this.scheduleRepository.find({
      where: {
        start_time: MoreThanOrEqual(now),
        is_cancelled: false,
      },
      relations: ['class', 'trainer'],
      order: { start_time: 'ASC' },
    });
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Schedule[]> {
    return this.scheduleRepository.find({
      where: {
        start_time: Between(startDate, endDate),
        is_cancelled: false,
      },
      relations: ['class', 'trainer'],
      order: { start_time: 'ASC' },
    });
  }

  async findByClassId(classId: number): Promise<Schedule[]> {
    return this.scheduleRepository.find({
      where: { class_id: classId, is_cancelled: false },
      relations: ['class', 'trainer'],
      order: { start_time: 'ASC' },
    });
  }

  async findByTrainerId(trainerId: number): Promise<Schedule[]> {
    return this.scheduleRepository.find({
      where: { trainer_id: trainerId, is_cancelled: false },
      relations: ['class', 'trainer'],
      order: { start_time: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Schedule> {
    const schedule = await this.scheduleRepository.findOne({
      where: { id },
      relations: ['class', 'trainer', 'bookings', 'bookings.member'],
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }

    return schedule;
  }

  async update(
    id: number,
    updateScheduleDto: UpdateScheduleDto,
  ): Promise<Schedule> {
    const schedule = await this.findOne(id);

    // If class_id is being updated, verify that the class exists
    if (updateScheduleDto.class_id) {
      await this.classesService.findOne(updateScheduleDto.class_id);
    }

    // If trainer_id is being updated, verify that the trainer exists and is approved
    if (updateScheduleDto.trainer_id) {
      const trainer = await this.trainersService.findOne(
        updateScheduleDto.trainer_id,
      );
      if (!trainer.is_approved) {
        throw new BadRequestException('Trainer is not approved');
      }
    }

    // Update the schedule with the provided data
    Object.assign(schedule, updateScheduleDto);

    // If dates are being updated, convert them to Date objects
    if (updateScheduleDto.start_time) {
      schedule.start_time = new Date(updateScheduleDto.start_time);
    }

    if (updateScheduleDto.end_time) {
      schedule.end_time = new Date(updateScheduleDto.end_time);
    }

    // Validate that end time is after start time
    if (schedule.end_time <= schedule.start_time) {
      throw new BadRequestException('End time must be after start time');
    }

    // Check for overlapping schedules for the trainer if trainer or time changes
    if (
      updateScheduleDto.trainer_id ||
      updateScheduleDto.start_time ||
      updateScheduleDto.end_time
    ) {
      const trainerId = updateScheduleDto.trainer_id || schedule.trainer_id;
      const trainerSchedules = await this.findOverlappingTrainerSchedules(
        trainerId,
        schedule.start_time,
        schedule.end_time,
        id,
      );

      if (trainerSchedules.length > 0) {
        throw new BadRequestException(
          'Trainer already has a schedule at this time',
        );
      }
    }

    return this.scheduleRepository.save(schedule);
  }

  async cancel(id: number): Promise<Schedule> {
    const schedule = await this.findOne(id);
    schedule.is_cancelled = true;
    return this.scheduleRepository.save(schedule);
  }

  async remove(id: number): Promise<void> {
    const result = await this.scheduleRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }
  }

  private async findOverlappingTrainerSchedules(
    trainerId: number,
    startTime: Date,
    endTime: Date,
    excludeScheduleId?: number,
  ): Promise<Schedule[]> {
    const query = this.scheduleRepository
      .createQueryBuilder('schedule')
      .where('schedule.trainer_id = :trainerId', { trainerId })
      .andWhere('schedule.is_cancelled = false')
      .andWhere(
        '(schedule.start_time < :endTime AND schedule.end_time > :startTime)',
        { startTime, endTime },
      );

    if (excludeScheduleId) {
      query.andWhere('schedule.id != :excludeScheduleId', {
        excludeScheduleId,
      });
    }

    return query.getMany();
  }
}
