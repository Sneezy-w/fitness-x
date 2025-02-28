import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { Request } from 'express';
@ApiTags('bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({ status: 201, description: 'Booking created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Member or schedule not found' })
  create(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(createBookingDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all bookings (admin only)' })
  @ApiResponse({ status: 200, description: 'List of all bookings' })
  findAll() {
    return this.bookingsService.findAll();
  }

  @Get(':memberId/member')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all bookings for a member' })
  @ApiResponse({ status: 200, description: 'List of member bookings' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  findByMemberId(@Param('memberId') memberId: string) {
    return this.bookingsService.findByMemberId(+memberId);
  }

  // @Get('member/upcoming/:memberId')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.TRAINER)
  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'Get upcoming bookings for a member' })
  // @ApiResponse({ status: 200, description: 'List of upcoming member bookings' })
  // @ApiResponse({ status: 404, description: 'Member not found' })
  // findMemberUpcomingBookings(@Param('memberId') memberId: string) {
  //   return this.bookingsService.findMemberUpcomingBookings(+memberId);
  // }

  @Get('member/upcoming')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MEMBER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get upcoming bookings for a member' })
  @ApiResponse({ status: 200, description: 'List of upcoming member bookings' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  findMemberUpcomingBookingsByToken(@Req() request: Request) {
    //console.log('request', request);
    const currentUser = request.user as Express.MemberTrainerUser;
    //console.log('currentUser', currentUser);
    if (!currentUser) {
      throw new UnauthorizedException('User not found');
    }
    return this.bookingsService.findMemberUpcomingBookings(currentUser.id);
  }

  @Get('schedule/:scheduleId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all bookings for a schedule' })
  @ApiResponse({ status: 200, description: 'List of schedule bookings' })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  findByScheduleId(@Param('scheduleId') scheduleId: string) {
    return this.bookingsService.findByScheduleId(+scheduleId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a booking by ID' })
  @ApiResponse({ status: 200, description: 'Booking details' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a booking (admin only)' })
  @ApiResponse({ status: 200, description: 'Booking updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingsService.update(+id, updateBookingDto);
  }

  @Patch(':id/mark-attended')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.TRAINER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark a booking as attended (admin or trainer)' })
  @ApiResponse({ status: 200, description: 'Booking marked as attended' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  markAttended(@Param('id') id: string) {
    return this.bookingsService.markAttended(+id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancel a booking' })
  @ApiResponse({ status: 204, description: 'Booking cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  remove(@Param('id') id: string) {
    return this.bookingsService.remove(+id);
  }
}
