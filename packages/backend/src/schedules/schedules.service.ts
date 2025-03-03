import {
  Injectable,
  NotFoundException,
  BadRequestException,
  //UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { Schedule } from './entities/schedule.entity';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { ClassesService } from '../classes/classes.service';
import { TrainersService } from '../trainers/trainers.service';
import { ApiException } from 'src/common/exceptions/api.exception';

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

    // Validate time format
    const start = new Date(
      `${createScheduleDto.date}T${createScheduleDto.start_time}`,
    );
    const end = new Date(
      `${createScheduleDto.date}T${createScheduleDto.end_time}`,
    );

    if (end <= start) {
      throw new BadRequestException('End time must be after start time');
    }

    // Check if the schedule is on the same day
    if (start.toDateString() !== end.toDateString()) {
      throw new BadRequestException('Schedule must be on the same day');
    }

    // Check for overlapping schedules for the trainer
    const trainerSchedules = await this.findOverlappingTrainerSchedules(
      trainer.id,
      createScheduleDto.date,
      createScheduleDto.start_time,
      createScheduleDto.end_time,
    );
    if (trainerSchedules.length > 0) {
      throw new BadRequestException(
        'Trainer already has a schedule at this time',
      );
    }

    // Create the schedule
    const schedule = this.scheduleRepository.create({
      ...createScheduleDto,
      date: createScheduleDto.date,
      start_time: createScheduleDto.start_time,
      end_time: createScheduleDto.end_time,
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
        date: MoreThanOrEqual(now.toISOString().split('T')[0]),
        //start_time: MoreThanOrEqual(now),
        is_cancelled: false,
      },
      relations: ['class', 'trainer', 'bookings'],
      order: { start_time: 'ASC' },
    });
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Schedule[]> {
    return this.scheduleRepository.find({
      where: {
        date: Between(
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0],
        ),
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
      where: { trainer_id: trainerId },
      relations: ['class', 'trainer', 'bookings'],
      order: {
        date: 'DESC',
        start_time: 'ASC',
      },
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

    // No need to convert to Date objects since we're storing as string/time types
    if (updateScheduleDto.start_time && updateScheduleDto.end_time) {
      const startDate = new Date(
        `${schedule.date}T${updateScheduleDto.start_time}`,
      );
      const endDate = new Date(
        `${schedule.date}T${updateScheduleDto.end_time}`,
      );

      if (endDate <= startDate) {
        throw new BadRequestException('End time must be after start time');
      }
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
        schedule.date,
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
    date: string,
    startTime: string,
    endTime: string,
    excludeScheduleId?: number,
  ): Promise<Schedule[]> {
    const query = this.scheduleRepository
      .createQueryBuilder('schedule')
      .where('schedule.trainer_id = :trainerId', { trainerId })
      .andWhere('schedule.is_cancelled = false')
      .andWhere('schedule.date = :date', { date })
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

  async findAvailableWithBookingStatus() {
    // For now, simply return upcoming schedules
    // In a real implementation, we would check if the member has booked each schedule
    const upcomingSchedules = await this.findUpcoming();

    // We'll add a placeholder isBooked field to each schedule
    // In a real implementation, this would be determined by querying bookings
    return upcomingSchedules.map((schedule) => ({
      ...schedule,
      isBooked: false, // Default to false as we can't check without proper repository
    }));
  }

  async findCurrentSchedulesForTrainer(trainerId: number): Promise<Schedule[]> {
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

    return this.scheduleRepository.find({
      where: {
        trainer_id: trainerId,
        date: today,
        is_cancelled: false,
      },
      relations: ['class', 'trainer', 'bookings', 'bookings.member'],
      order: {
        start_time: 'ASC',
      },
    });
  }

  async findUpcomingSchedulesForTrainer(
    trainerId: number,
  ): Promise<Schedule[]> {
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

    return this.scheduleRepository
      .createQueryBuilder('schedule')
      .leftJoinAndSelect('schedule.class', 'class')
      .leftJoinAndSelect('schedule.trainer', 'trainer')
      .leftJoinAndSelect('schedule.bookings', 'bookings')
      .leftJoinAndSelect('bookings.member', 'member')
      .where('schedule.trainer_id = :trainerId', { trainerId })
      .andWhere(
        '(schedule.date > :today OR (schedule.date = :today AND schedule.start_time > :now))',
        {
          today,
          now: new Date().toTimeString().split(' ')[0], // Current time in HH:MM:SS format
        },
      )
      .andWhere('schedule.is_cancelled = false')
      .orderBy('schedule.date', 'ASC')
      .addOrderBy('schedule.start_time', 'ASC')
      .take(20) // Limit to next 20 upcoming classes
      .getMany();
  }

  async calculateTrainerStats(trainerId: number): Promise<{
    total_classes: number;
    total_attendance: number;
    average_attendance_rate: number;
  }> {
    // Get schedules from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];

    const schedules = await this.scheduleRepository.find({
      where: {
        trainer_id: trainerId,
        date: Between(thirtyDaysAgoStr, today),
        is_cancelled: false,
      },
      relations: ['bookings'],
    });

    const total_classes = schedules.length;
    const total_attendance = schedules.reduce(
      (sum, schedule) =>
        sum + schedule.bookings.filter((booking) => booking.is_attended).length,
      0,
    );

    const total_bookings = schedules.reduce(
      (sum, schedule) => sum + schedule.bookings.length,
      0,
    );

    const average_attendance_rate =
      total_bookings > 0
        ? Math.round((total_attendance / total_bookings) * 100)
        : 0;

    return {
      total_classes,
      total_attendance,
      average_attendance_rate,
    };
  }

  async markAttendance(
    scheduleId: number,
    trainerId: number,
  ): Promise<Schedule> {
    const schedule = await this.findOne(scheduleId);

    console.log(schedule);

    // Verify that the trainer owns this schedule
    if (schedule.trainer_id != trainerId) {
      throw new ApiException(
        'You can only mark attendance for your own classes',
      );
    }

    // Check if the class date is in the past
    const classDateTime = new Date(`${schedule.date}T${schedule.end_time}`);
    if (new Date() < classDateTime) {
      throw new ApiException(
        'Cannot mark attendance for a class that has not ended yet',
      );
    }

    schedule.attendance_marked = true;
    return this.scheduleRepository.save(schedule);
  }
}
