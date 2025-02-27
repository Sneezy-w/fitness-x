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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MembershipTypesService } from './membership-types.service';
import { CreateMembershipTypeDto } from './dto/create-membership-type.dto';
import { UpdateMembershipTypeDto } from './dto/update-membership-type.dto';
//import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { Auth0AuthGuard } from 'src/auth/guards/auth0-auth.guard';
import { Public } from 'src/auth/decorators/public.decorator';

@ApiTags('membership-types')
@Controller('membership-types')
export class MembershipTypesController {
  constructor(
    private readonly membershipTypesService: MembershipTypesService,
  ) {}

  @Post()
  @UseGuards(Auth0AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new membership type (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Membership type successfully created',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({
    status: 409,
    description: 'Membership type with this name already exists',
  })
  create(@Body() createMembershipTypeDto: CreateMembershipTypeDto) {
    return this.membershipTypesService.create(createMembershipTypeDto);
  }

  @Get()
  // @UseGuards(Auth0AuthGuard, RolesGuard)
  // @Roles(Role.ADMIN)
  @Public()
  @ApiOperation({ summary: 'Get all active membership types' })
  @ApiResponse({ status: 200, description: 'List of active membership types' })
  findAll() {
    return this.membershipTypesService.findAll();
  }

  @Get('all')
  @UseGuards(Auth0AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all membership types including deleted ones (admin only)',
  })
  @ApiResponse({ status: 200, description: 'List of all membership types' })
  findAllIncludingDeleted() {
    return this.membershipTypesService.findAllIncludingDeleted();
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a membership type by ID' })
  @ApiResponse({ status: 200, description: 'Membership type details' })
  @ApiResponse({ status: 404, description: 'Membership type not found' })
  findOne(@Param('id') id: string) {
    return this.membershipTypesService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(Auth0AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a membership type (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Membership type updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Membership type not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({
    status: 409,
    description: 'Membership type with this name already exists',
  })
  update(
    @Param('id') id: string,
    @Body() updateMembershipTypeDto: UpdateMembershipTypeDto,
  ) {
    return this.membershipTypesService.update(+id, updateMembershipTypeDto);
  }

  @Delete(':id')
  @UseGuards(Auth0AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a membership type (admin only)' })
  @ApiResponse({
    status: 204,
    description: 'Membership type deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Membership type not found' })
  remove(@Param('id') id: string) {
    return this.membershipTypesService.softDelete(+id);
  }

  @Patch(':id/restore')
  @UseGuards(Auth0AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Restore a deleted membership type (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Membership type restored successfully',
  })
  @ApiResponse({ status: 404, description: 'Membership type not found' })
  restore(@Param('id') id: string) {
    return this.membershipTypesService.restore(+id);
  }
}
