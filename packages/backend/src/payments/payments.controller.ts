import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Headers,
  Req,
  RawBodyRequest,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { Request } from 'express';
// import {
//   CurrentUser,
//   UserFromJwt,
// } from '../auth/decorators/current-user.decorator';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';

class CreatePaymentIntentDto {
  amount: number;
  member_id: number;
  description: string;
}

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-intent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a payment intent with Stripe' })
  @ApiResponse({
    status: 200,
    description: 'Payment intent created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiBody({ type: CreatePaymentIntentDto })
  createPaymentIntent(@Body() createPaymentIntentDto: CreatePaymentIntentDto) {
    return this.paymentsService.createPaymentIntent(
      createPaymentIntentDto.amount,
      createPaymentIntentDto.member_id,
      createPaymentIntentDto.description,
    );
  }

  @Post('create-checkout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a Stripe checkout session for subscription',
  })
  @ApiResponse({
    status: 200,
    description: 'Checkout session created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiBody({ type: CreateCheckoutSessionDto })
  createCheckoutSession(
    @Body() createCheckoutSessionDto: CreateCheckoutSessionDto,
    @Req() request: Request,
  ) {
    const currentUser = request.user as Express.MemberTrainerUser;
    return this.paymentsService.createCheckoutSession(
      createCheckoutSessionDto.membershipTypeId,
      currentUser.id,
    );
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Stripe webhook events' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async handleWebhook(
    @Req() request: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    await this.paymentsService.handleWebhookEvent(
      request.rawBody as Buffer,
      signature,
    );
    return { received: true };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Manually record a payment (admin only)' })
  @ApiResponse({ status: 201, description: 'Payment recorded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  recordPayment(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.recordPayment(createPaymentDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all payment records (admin only)' })
  @ApiResponse({ status: 200, description: 'List of all payments' })
  findAllPayments() {
    return this.paymentsService.findAllPayments();
  }

  @Get('member/:memberId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment records for a specific member' })
  @ApiResponse({ status: 200, description: 'List of member payments' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  @ApiParam({ name: 'memberId', description: 'ID of the member', type: Number })
  findPaymentsByMemberId(@Param('memberId') memberId: string) {
    return this.paymentsService.findPaymentsByMemberId(+memberId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a payment record by ID' })
  @ApiResponse({ status: 200, description: 'Payment details' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @ApiParam({ name: 'id', description: 'ID of the payment', type: Number })
  findPaymentById(@Param('id') id: string) {
    return this.paymentsService.findPaymentById(+id);
  }
}
