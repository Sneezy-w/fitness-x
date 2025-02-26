import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PaymentHistory } from './entities/payment-history.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { MembersService } from '../members/members.service';
import { StripePaymentIntent } from './interfaces/stripe-payment-intent.interface';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(PaymentHistory)
    private paymentHistoryRepository: Repository<PaymentHistory>,
    private configService: ConfigService,
    private membersService: MembersService,
  ) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY', ''),
      {
        apiVersion: '2025-02-24.acacia',
      },
    );
  }

  async createPaymentIntent(
    amount: number,
    memberId: number,
    description: string,
  ): Promise<StripePaymentIntent> {
    // Verify member exists and get Stripe customer ID
    const member = await this.membersService.findOne(memberId);

    // Validate amount
    if (amount <= 0) {
      throw new BadRequestException('Payment amount must be positive');
    }

    // If member has no Stripe customer ID, create one
    if (!member.stripe_customer_id) {
      const customer = await this.stripe.customers.create({
        email: member.email,
        name: member.full_name,
        metadata: {
          member_id: member.id.toString(),
        },
      });

      // Update member with new Stripe customer ID
      await this.membersService.update(memberId, {
        stripe_customer_id: customer.id,
      });

      member.stripe_customer_id = customer.id;
    }

    // Create payment intent
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe requires amount in cents
      currency: 'usd',
      customer: member.stripe_customer_id,
      description,
      metadata: {
        member_id: member.id.toString(),
      },
    });

    return {
      id: paymentIntent.id,
      amount: paymentIntent.amount / 100, // Convert back to dollars
      amount_received: paymentIntent.amount_received / 100,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      client_secret: paymentIntent.client_secret as string,
      customer: paymentIntent.customer as string,
      metadata: paymentIntent.metadata,
    };
  }

  async handleWebhookEvent(payload: Buffer, signature: string): Promise<void> {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.configService.get<string>('STRIPE_WEBHOOK_SECRET', ''),
      );

      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;

        // Create payment record
        if (paymentIntent.metadata?.member_id) {
          await this.recordPayment({
            member_id: Number(paymentIntent.metadata.member_id),
            amount: paymentIntent.amount / 100, // Convert to dollars
            stripe_payment_id: paymentIntent.id,
          });
        }
      }
    } catch (error: any) {
      console.error(error);
      throw new BadRequestException(`Webhook error`);
    }
  }

  async recordPayment(
    createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentHistory> {
    // Verify member exists
    await this.membersService.findOne(createPaymentDto.member_id);

    // Create payment record
    const payment = this.paymentHistoryRepository.create(createPaymentDto);
    return this.paymentHistoryRepository.save(payment);
  }

  async findAllPayments(): Promise<PaymentHistory[]> {
    return this.paymentHistoryRepository.find({
      relations: ['member'],
      order: { payment_date: 'DESC' },
    });
  }

  async findPaymentsByMemberId(memberId: number): Promise<PaymentHistory[]> {
    // Verify member exists
    await this.membersService.findOne(memberId);

    return this.paymentHistoryRepository.find({
      where: { member_id: memberId },
      relations: ['member'],
      order: { payment_date: 'DESC' },
    });
  }

  async findPaymentById(id: number): Promise<PaymentHistory> {
    const payment = await this.paymentHistoryRepository.findOne({
      where: { id },
      relations: ['member'],
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }
}
