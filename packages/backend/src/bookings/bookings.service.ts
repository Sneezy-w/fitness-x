import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { MembersService } from '../members/members.service';
import { SchedulesService } from '../schedules/schedules.service';
import { MembershipSubscriptionsService } from '../membership-subscriptions/membership-subscriptions.service';
import { FreeClassAllocationsService } from '../free-class-allocations/free-class-allocations.service';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    private membersService: MembersService,
    private schedulesService: SchedulesService,
    private membershipSubscriptionsService: MembershipSubscriptionsService,
    private freeClassAllocationsService: FreeClassAllocationsService,
  ) {}

  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    // Verify that the member exists
    const member = await this.membersService.findOne(
      createBookingDto.member_id,
    );
    if (!member.is_active) {
      throw new BadRequestException('Member is not active');
    }

    // Verify that the schedule exists and is not cancelled
    const schedule = await this.schedulesService.findOne(
      createBookingDto.schedule_id,
    );
    if (schedule.is_cancelled) {
      throw new BadRequestException('This class has been cancelled');
    }

    // Check if the schedule date is in the past
    if (new Date() > new Date(`${schedule.date}T${schedule.start_time}`)) {
      throw new BadRequestException(
        'Cannot book a class that has already started',
      );
    }

    // Check if the class is already full
    const bookingsCount = await this.bookingRepository.count({
      where: { schedule_id: schedule.id },
    });
    if (bookingsCount >= schedule.capacity) {
      throw new BadRequestException('This class is already full');
    }

    // Check if the member already has a booking for this schedule
    const existingBooking = await this.bookingRepository.findOne({
      where: {
        member_id: createBookingDto.member_id,
        schedule_id: createBookingDto.schedule_id,
      },
    });
    if (existingBooking) {
      throw new BadRequestException(
        'Member already has a booking for this class',
      );
    }

    // Determine how to pay for the class (subscription or free class)
    let usedFreeClass = createBookingDto.used_free_class || false;

    // Check if member has an active subscription with remaining classes
    const activeSubscription =
      await this.membershipSubscriptionsService.findCurrentSubscription(
        member.id,
      );

    // If no active subscription, check if free classes are available
    if (!activeSubscription || activeSubscription.remaining_classes <= 0) {
      const remainingFreeClasses =
        await this.freeClassAllocationsService.getRemainingFreeClasses(
          member.id,
        );
      if (remainingFreeClasses <= 0) {
        throw new BadRequestException(
          'No active subscription or free classes available',
        );
      }
      usedFreeClass = true;
    }

    // Create the booking
    const booking = this.bookingRepository.create({
      ...createBookingDto,
      used_free_class: usedFreeClass,
    });

    // Decrement classes from subscription or free class allocation
    if (usedFreeClass) {
      await this.freeClassAllocationsService.decrementFreeClasses(member.id);
    } else if (activeSubscription) {
      await this.membershipSubscriptionsService.decrementRemainingClasses(
        activeSubscription.id,
      );
    }

    return this.bookingRepository.save(booking);
  }

  async findAll(): Promise<Booking[]> {
    return this.bookingRepository.find({
      relations: ['member', 'schedule', 'schedule.class', 'schedule.trainer'],
    });
  }

  async findByMemberId(memberId: number): Promise<Booking[]> {
    return this.bookingRepository.find({
      where: { member_id: memberId },
      relations: ['member', 'schedule', 'schedule.class', 'schedule.trainer'],
      order: {
        schedule: {
          start_time: 'DESC',
        },
      },
    });
  }

  async findMemberUpcomingBookings(memberId: number): Promise<Booking[]> {
    const now = new Date();
    return this.bookingRepository
      .createQueryBuilder('booking')
      .innerJoinAndSelect('booking.schedule', 'schedule')
      .innerJoinAndSelect('schedule.class', 'class')
      .innerJoinAndSelect('schedule.trainer', 'trainer')
      .innerJoinAndSelect('booking.member', 'member')
      .where('booking.member_id = :memberId', { memberId })
      .andWhere('schedule.start_time > :now', { now })
      .andWhere('schedule.is_cancelled = false')
      .orderBy('schedule.start_time', 'ASC')
      .getMany();
  }

  async findByScheduleId(scheduleId: number): Promise<Booking[]> {
    return this.bookingRepository.find({
      where: { schedule_id: scheduleId },
      relations: ['member', 'schedule', 'schedule.class', 'schedule.trainer'],
    });
  }

  async findOne(id: number): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['member', 'schedule', 'schedule.class', 'schedule.trainer'],
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    return booking;
  }

  async update(
    id: number,
    updateBookingDto: UpdateBookingDto,
  ): Promise<Booking> {
    const booking = await this.findOne(id);

    // If member_id is being updated, verify that the member exists and is active
    if (updateBookingDto.member_id) {
      const member = await this.membersService.findOne(
        updateBookingDto.member_id,
      );
      if (!member.is_active) {
        throw new BadRequestException('Member is not active');
      }
    }

    // If schedule_id is being updated, verify that the schedule exists and is not cancelled
    if (updateBookingDto.schedule_id) {
      const schedule = await this.schedulesService.findOne(
        updateBookingDto.schedule_id,
      );
      if (schedule.is_cancelled) {
        throw new BadRequestException('This class has been cancelled');
      }

      // Check if the class is already full
      const bookingsCount = await this.bookingRepository.count({
        where: {
          schedule_id: schedule.id,
          id: Not(id),
        },
      });
      if (bookingsCount >= schedule.capacity) {
        throw new BadRequestException('This class is already full');
      }

      // Check if the member already has a booking for this schedule
      const existingBooking = await this.bookingRepository.findOne({
        where: {
          member_id: booking.member_id,
          schedule_id: updateBookingDto.schedule_id,
          id: Not(id),
        },
      });
      if (existingBooking) {
        throw new BadRequestException(
          'Member already has a booking for this class',
        );
      }
    }

    // Update the booking with the provided data
    Object.assign(booking, updateBookingDto);
    return this.bookingRepository.save(booking);
  }

  async markAttended(id: number): Promise<Booking> {
    const booking = await this.findOne(id);
    booking.is_attended = true;
    return this.bookingRepository.save(booking);
  }

  async remove(id: number): Promise<void> {
    const booking = await this.findOne(id);

    // Check if the class has already started or ended
    const now = new Date();
    if (
      now > new Date(`${booking.schedule.date}T${booking.schedule.start_time}`)
    ) {
      throw new BadRequestException(
        'Cannot cancel a booking for a class that has already started',
      );
    }

    // If this was using a free class, give it back
    if (booking.used_free_class) {
      await this.freeClassAllocationsService.create({
        member_id: booking.member_id,
        quantity: 1,
      });
    } else {
      // If there's an active subscription, increment the remaining classes
      const activeSubscription =
        await this.membershipSubscriptionsService.findCurrentSubscription(
          booking.member_id,
        );
      if (activeSubscription) {
        // Increment the remaining classes
        activeSubscription.remaining_classes += 1;
        await this.membershipSubscriptionsService.update(
          activeSubscription.id,
          { remaining_classes: activeSubscription.remaining_classes },
        );
      }
    }

    await this.bookingRepository.remove(booking);
  }
}
