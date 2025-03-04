import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { Auth0AuthGuard } from '../auth/guards/auth0-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@ApiTags('statistics')
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('dashboard')
  @UseGuards(Auth0AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get dashboard statistics for admin' })
  @ApiResponse({ status: 200, description: 'Dashboard statistics' })
  async getDashboardStats() {
    const memberStats = await this.statisticsService.getMemberStatistics();
    const attendanceStats =
      await this.statisticsService.getAttendanceStatistics();
    const bookingStats = await this.statisticsService.getBookingStatistics();
    const trainerStats = await this.statisticsService.getTrainerStatistics();

    return {
      memberStats,
      attendanceStats,
      bookingStats,
      trainerStats,
    };
  }
}
