import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MembershipSubscriptionsService } from './membership-subscriptions.service';
import { CreateMembershipSubscriptionDto } from './dto/create-membership-subscription.dto';
import { UpdateMembershipSubscriptionDto } from './dto/update-membership-subscription.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@ApiTags('membership-subscriptions')
@Controller('membership-subscriptions')
export class MembershipSubscriptionsController {
  constructor(
    private readonly subscriptionsService: MembershipSubscriptionsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new membership subscription (admin only)',
  })
  @ApiResponse({
    status: 201,
    description: 'Subscription created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({
    status: 404,
    description: 'Member or membership type not found',
  })
  create(@Body() createSubscriptionDto: CreateMembershipSubscriptionDto) {
    return this.subscriptionsService.create(createSubscriptionDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all subscriptions (admin only)' })
  @ApiResponse({ status: 200, description: 'List of all subscriptions' })
  findAll() {
    return this.subscriptionsService.findAll();
  }

  @Get('member/:memberId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all subscriptions for a member' })
  @ApiResponse({ status: 200, description: 'List of member subscriptions' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  findByMemberId(@Param('memberId') memberId: string) {
    return this.subscriptionsService.findByMemberId(+memberId);
  }

  @Get('member/:memberId/current')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the current active subscription for a member' })
  @ApiResponse({ status: 200, description: 'Current subscription details' })
  @ApiResponse({ status: 404, description: 'No active subscription found' })
  findCurrentSubscription(@Param('memberId') memberId: string) {
    return this.subscriptionsService.findCurrentSubscription(+memberId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a subscription by ID' })
  @ApiResponse({ status: 200, description: 'Subscription details' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  findOne(@Param('id') id: string) {
    return this.subscriptionsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a subscription (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Subscription updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  update(
    @Param('id') id: string,
    @Body() updateSubscriptionDto: UpdateMembershipSubscriptionDto,
  ) {
    return this.subscriptionsService.update(+id, updateSubscriptionDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a subscription (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Subscription deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  remove(@Param('id') id: string) {
    return this.subscriptionsService.remove(+id);
  }

  @Patch(':id/decrement-classes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Decrement remaining classes for a subscription' })
  @ApiResponse({
    status: 200,
    description: 'Remaining classes decremented successfully',
  })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  @ApiResponse({
    status: 400,
    description: 'No remaining classes in subscription',
  })
  decrementRemainingClasses(@Param('id') id: string) {
    return this.subscriptionsService.decrementRemainingClasses(+id);
  }
}
