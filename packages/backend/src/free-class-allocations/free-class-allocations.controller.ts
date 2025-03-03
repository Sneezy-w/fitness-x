import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FreeClassAllocationsService } from './free-class-allocations.service';
import { CreateFreeClassAllocationDto } from './dto/create-free-class-allocation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { Request } from 'express';

@ApiTags('free-class-allocations')
@Controller('free-class-allocations')
export class FreeClassAllocationsController {
  constructor(
    private readonly freeClassAllocationsService: FreeClassAllocationsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new free class allocation (admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Free class allocation created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  create(@Body() createFreeClassAllocationDto: CreateFreeClassAllocationDto) {
    return this.freeClassAllocationsService.create(
      createFreeClassAllocationDto,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all free class allocations (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of all free class allocations',
  })
  findAll() {
    return this.freeClassAllocationsService.findAll();
  }

  @Get('member/:memberId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all free class allocations for a member' })
  @ApiResponse({
    status: 200,
    description: 'List of member free class allocations',
  })
  @ApiResponse({ status: 404, description: 'Member not found' })
  findByMemberId(@Param('memberId') memberId: string) {
    return this.freeClassAllocationsService.findByMemberId(+memberId);
  }

  @Get('member/:memberId/remaining')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get remaining free classes for a member' })
  @ApiResponse({ status: 200, description: 'Number of remaining free classes' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  getRemainingFreeClasses(@Param('memberId') memberId: string) {
    return this.freeClassAllocationsService.getRemainingFreeClasses(+memberId);
  }

  @Get('member/current/remaining')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get remaining free classes for the current authenticated member',
  })
  @ApiResponse({ status: 200, description: 'Number of remaining free classes' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  getRemainingFreeClassesForCurrentMember(@Req() request: Request) {
    const currentUser = request.user as Express.MemberTrainerUser;
    return this.freeClassAllocationsService.getRemainingFreeClasses(
      currentUser.id,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a free class allocation by ID' })
  @ApiResponse({ status: 200, description: 'Free class allocation details' })
  @ApiResponse({ status: 404, description: 'Free class allocation not found' })
  findOne(@Param('id') id: string) {
    return this.freeClassAllocationsService.findOne(+id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a free class allocation (admin only)' })
  @ApiResponse({
    status: 204,
    description: 'Free class allocation deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Free class allocation not found' })
  remove(@Param('id') id: string) {
    return this.freeClassAllocationsService.remove(+id);
  }

  @Post('member/:memberId/decrement')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Decrement free classes for a member' })
  @ApiResponse({
    status: 200,
    description: 'Free classes decremented successfully',
  })
  @ApiResponse({ status: 404, description: 'Member not found' })
  @ApiResponse({ status: 400, description: 'No free classes available' })
  decrementFreeClasses(@Param('memberId') memberId: string) {
    return this.freeClassAllocationsService.decrementFreeClasses(+memberId);
  }
}
