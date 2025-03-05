import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Member } from '../members/entities/member.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { Schedule } from '../schedules/entities/schedule.entity';
import { Trainer } from '../trainers/entities/trainer.entity';
import { Class } from '../classes/entities/class.entity';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,
    @InjectRepository(Trainer)
    private trainerRepository: Repository<Trainer>,
    @InjectRepository(Class)
    private classRepository: Repository<Class>,
  ) {}

  async getMemberStatistics() {
    // Get date ranges
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(today.getDate() - 90);

    // Get total members
    const totalMembers = await this.memberRepository.count();

    // Get active members
    const activeMembers = await this.memberRepository.count({
      where: { is_active: true },
    });

    // Get new members in last 30 days
    const newMembersLast30Days = await this.memberRepository.count({
      where: {
        created_at: Between(thirtyDaysAgo, today),
      },
    });

    // Get new members in last 90 days
    const newMembersLast90Days = await this.memberRepository.count({
      where: {
        created_at: Between(ninetyDaysAgo, today),
      },
    });

    return {
      totalMembers,
      activeMembers,
      inactiveMembers: totalMembers - activeMembers,
      newMembersLast30Days,
      newMembersLast90Days,
      activeRate: totalMembers > 0 ? (activeMembers / totalMembers) * 100 : 0,
    };
  }

  async getAttendanceStatistics() {
    // Get date ranges
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const todayStr = today.toISOString().split('T')[0];
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    // Get classes and attendance from the last 30 days
    const pastSchedules = await this.scheduleRepository.find({
      where: {
        date: Between(thirtyDaysAgoStr, todayStr),
        is_cancelled: false,
      },
      relations: ['bookings'],
    });

    const totalBookings = pastSchedules.reduce(
      (sum, schedule) => sum + schedule.bookings.length,
      0,
    );

    const totalAttendance = pastSchedules.reduce(
      (sum, schedule) =>
        sum + schedule.bookings.filter((booking) => booking.is_attended).length,
      0,
    );

    const attendanceRate =
      totalBookings > 0 ? (totalAttendance / totalBookings) * 100 : 0;

    return {
      totalClasses: pastSchedules.length,
      totalBookings,
      totalAttendance,
      attendanceRate,
      missedClasses: totalBookings - totalAttendance,
    };
  }

  async getBookingStatistics() {
    // Get date ranges
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    // Get today's bookings
    const todayBookings = await this.bookingRepository.count({
      where: {
        booked_at: Between(
          new Date(today.setHours(0, 0, 0, 0)),
          new Date(today.setHours(23, 59, 59, 999)),
        ),
      },
    });

    // Get last 7 days bookings
    const last7DaysBookings = await this.bookingRepository.count({
      where: {
        booked_at: Between(sevenDaysAgo, today),
      },
    });

    // Get last 30 days bookings
    const last30DaysBookings = await this.bookingRepository.count({
      where: {
        booked_at: Between(thirtyDaysAgo, today),
      },
    });

    return {
      todayBookings,
      last7DaysBookings,
      last30DaysBookings,
      avgBookingsPerDay: last30DaysBookings / 30,
    };
  }

  async getTrainerStatistics() {
    // Get total trainers
    const totalTrainers = await this.trainerRepository.count();

    // Get approved trainers
    const approvedTrainers = await this.trainerRepository.count({
      where: { is_approved: true },
    });

    return {
      totalTrainers,
      approvedTrainers,
      pendingTrainers: totalTrainers - approvedTrainers,
    };
  }

  async getDashboardStatistics() {
    // Existing implementation...
  }

  async getAttendanceDataForExport(): Promise<string> {
    // Get all bookings with related data
    const bookings = await this.bookingRepository.find({
      relations: ['member', 'schedule', 'schedule.class', 'schedule.trainer'],
      order: {
        booked_at: 'DESC',
      },
    });

    // Create CSV headers
    let csv = 'Date,Time,Class Name,Trainer,Member Name,Member Email,Status\n';

    // Add data rows
    for (const booking of bookings) {
      const date = new Date(booking.schedule.date).toLocaleDateString();
      const time = `${booking.schedule.start_time} - ${booking.schedule.end_time}`;
      const className = booking.schedule.class.name;
      const trainerName = booking.schedule.trainer.full_name;
      const memberName = booking.member.full_name;
      const memberEmail = booking.member.email;
      const status = booking.is_attended ? 'Attended' : 'Not Attended';

      // Escape any commas in string fields
      const escapedRow = [
        date,
        time,
        this.escapeCsvValue(className),
        this.escapeCsvValue(trainerName),
        this.escapeCsvValue(memberName),
        this.escapeCsvValue(memberEmail),
        status,
      ].join(',');

      csv += escapedRow + '\n';
    }

    return csv;
  }

  // Helper function to escape CSV values
  private escapeCsvValue(value: string): string {
    // If value contains commas, quotes, or newlines, wrap it in quotes
    if (
      value &&
      (value.includes(',') || value.includes('"') || value.includes('\n'))
    ) {
      // Double up any quotes within the value
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}
