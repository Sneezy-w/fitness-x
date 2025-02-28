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
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TrainersService } from './trainers.service';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { UpdateTrainerDto } from './dto/update-trainer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { Auth0AuthGuard } from 'src/auth/guards/auth0-auth.guard';
import { Request } from 'express';

@ApiTags('trainers')
@Controller('trainers')
export class TrainersController {
  constructor(private readonly trainersService: TrainersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new trainer (public registration)' })
  @ApiResponse({ status: 201, description: 'Trainer successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  create(@Body() createTrainerDto: CreateTrainerDto) {
    return this.trainersService.create(createTrainerDto);
  }

  @Get()
  @UseGuards(Auth0AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all trainers (admin only)' })
  @ApiResponse({ status: 200, description: 'List of all trainers' })
  findAll() {
    return this.trainersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a trainer by ID' })
  @ApiResponse({ status: 200, description: 'Trainer details' })
  @ApiResponse({ status: 404, description: 'Trainer not found' })
  findOne(@Param('id') id: string) {
    return this.trainersService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(Auth0AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a trainer' })
  @ApiResponse({ status: 200, description: 'Trainer updated successfully' })
  @ApiResponse({ status: 404, description: 'Trainer not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  update(@Param('id') id: string, @Body() updateTrainerDto: UpdateTrainerDto) {
    return this.trainersService.update(+id, updateTrainerDto);
  }

  @Patch(':id/profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TRAINER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a trainer' })
  @ApiResponse({ status: 200, description: 'Trainer updated successfully' })
  @ApiResponse({ status: 404, description: 'Trainer not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  updateProfile(
    @Param('id') id: string,
    @Body() updateTrainerDto: UpdateTrainerDto,
    @Req() req: Request,
  ) {
    const currentTrainer = req.user as Express.MemberTrainerUser;
    if (currentTrainer?.id !== +id) {
      throw new ForbiddenException(
        'You are not authorized to update this trainer',
      );
    }
    return this.trainersService.update(+id, updateTrainerDto);
  }

  @Patch(':id/approve')
  @UseGuards(Auth0AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve a trainer (admin only)' })
  @ApiResponse({ status: 200, description: 'Trainer approved successfully' })
  @ApiResponse({ status: 404, description: 'Trainer not found' })
  approveTrainer(@Param('id') id: string) {
    return this.trainersService.approveTrainer(+id);
  }

  @Delete(':id')
  @UseGuards(Auth0AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a trainer (admin only)' })
  @ApiResponse({ status: 204, description: 'Trainer deleted successfully' })
  @ApiResponse({ status: 404, description: 'Trainer not found' })
  remove(@Param('id') id: string) {
    return this.trainersService.remove(+id);
  }
}
