import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
//import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { Auth0AuthGuard } from 'src/auth/guards/auth0-auth.guard';
@ApiTags('schedules')
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  @UseGuards(Auth0AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new schedule (admin only)' })
  @ApiResponse({ status: 201, description: 'Schedule created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Class or trainer not found' })
  create(@Body() createScheduleDto: CreateScheduleDto) {
    return this.schedulesService.create(createScheduleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all schedules' })
  @ApiResponse({ status: 200, description: 'List of all schedules' })
  findAll() {
    return this.schedulesService.findAll();
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get all upcoming schedules' })
  @ApiResponse({ status: 200, description: 'List of upcoming schedules' })
  findUpcoming() {
    return this.schedulesService.findUpcoming();
  }

  @Get('date-range')
  @ApiOperation({ summary: 'Get schedules within a date range' })
  @ApiResponse({
    status: 200,
    description: 'List of schedules within date range',
  })
  @ApiQuery({ name: 'startDate', example: '2023-07-15T00:00:00.000Z' })
  @ApiQuery({ name: 'endDate', example: '2023-07-15T23:59:59.999Z' })
  findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.schedulesService.findByDateRange(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('class/:classId')
  @ApiOperation({ summary: 'Get schedules for a specific class' })
  @ApiResponse({ status: 200, description: 'List of schedules for the class' })
  @ApiResponse({ status: 404, description: 'Class not found' })
  findByClassId(@Param('classId') classId: string) {
    return this.schedulesService.findByClassId(+classId);
  }

  @Get('trainer/:trainerId')
  @ApiOperation({ summary: 'Get schedules for a specific trainer' })
  @ApiResponse({
    status: 200,
    description: 'List of schedules for the trainer',
  })
  @ApiResponse({ status: 404, description: 'Trainer not found' })
  findByTrainerId(@Param('trainerId') trainerId: string) {
    return this.schedulesService.findByTrainerId(+trainerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a schedule by ID' })
  @ApiResponse({ status: 200, description: 'Schedule details' })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  findOne(@Param('id') id: string) {
    return this.schedulesService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(Auth0AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a schedule (admin only)' })
  @ApiResponse({ status: 200, description: 'Schedule updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  update(
    @Param('id') id: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ) {
    return this.schedulesService.update(+id, updateScheduleDto);
  }

  @Patch(':id/cancel')
  @UseGuards(Auth0AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel a schedule (admin only)' })
  @ApiResponse({ status: 200, description: 'Schedule cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  cancel(@Param('id') id: string) {
    return this.schedulesService.cancel(+id);
  }

  @Delete(':id')
  @UseGuards(Auth0AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a schedule (admin only)' })
  @ApiResponse({ status: 204, description: 'Schedule deleted successfully' })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  remove(@Param('id') id: string) {
    return this.schedulesService.remove(+id);
  }
}
