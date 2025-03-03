import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PaymentHistory } from './entities/payment-history.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { MembersService } from '../members/members.service';
import { StripePaymentIntent } from './interfaces/stripe-payment-intent.interface';
import { MembershipTypesService } from '../membership-types/membership-types.service';
import { MembershipSubscriptionsService } from '../membership-subscriptions/membership-subscriptions.service';
import { CreateMembershipSubscriptionDto } from '../membership-subscriptions/dto/create-membership-subscription.dto';
import { UpdateMembershipSubscriptionDto } from '../membership-subscriptions/dto/update-membership-subscription.dto';
import { MembershipType } from 'src/membership-types/entities/membership-type.entity';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(PaymentHistory)
    private paymentHistoryRepository: Repository<PaymentHistory>,
    private configService: ConfigService,
    private membersService: MembersService,
    private membershipTypesService: MembershipTypesService,
    @Inject(forwardRef(() => MembershipSubscriptionsService))
    private subscriptionsService: MembershipSubscriptionsService,
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

  async createCheckoutSession(
    membershipTypeId: number,
    memberId: number,
  ): Promise<{ url: string }> {
    // Verify member exists and get Stripe customer ID
    const member = await this.membersService.findOne(memberId);

    // Verify membership type exists
    const membershipType =
      await this.membershipTypesService.findOne(membershipTypeId);

    // Ensure the price is set in the membership type
    if (!membershipType.monthly_price) {
      throw new BadRequestException(
        'Membership type does not have a valid price',
      );
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

    // Create a price for the membership type if it doesn't exist
    const priceId = await this.getOrCreatePrice(membershipType);

    // Create checkout session
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer: member.stripe_customer_id,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        member_id: member.id.toString(),
        membership_type_id: membershipType.id.toString(),
      },
      success_url: `${this.configService.get<string>('CLIENT_URL')}/member/membership?success=true`,
      cancel_url: `${this.configService.get<string>('CLIENT_URL')}/member/membership?canceled=true`,
    });

    return { url: session.url as string };
  }

  private async getOrCreatePrice(
    membershipType: MembershipType,
  ): Promise<string> {
    // Check if we have an existing price for this membership type in Stripe metadata
    const productName = `Membership: ${membershipType.name}`;
    const amount = Math.round(membershipType.monthly_price * 100); // Convert to cents

    // Look for existing product
    const products = await this.stripe.products.list({
      active: true,
    });

    const existingProduct = products.data.find(
      (product) => product.name === productName,
    );

    if (existingProduct) {
      // Get prices for the existing product
      const prices = await this.stripe.prices.list({
        product: existingProduct.id,
        active: true,
      });

      // Find a recurring price with the correct amount
      const existingPrice = prices.data.find(
        (price) =>
          price.unit_amount === amount &&
          price.type === 'recurring' &&
          price.recurring?.interval === 'month',
      );

      if (existingPrice) {
        return existingPrice.id;
      }
    }

    // Create a new product if it doesn't exist
    const product =
      existingProduct ||
      (await this.stripe.products.create({
        name: productName,
        // description:
        //   membershipType.description || `${membershipType.name} Membership`,
        metadata: {
          membership_type_id: membershipType.id.toString(),
        },
      }));

    // Create a new price for the product
    const price = await this.stripe.prices.create({
      product: product.id,
      unit_amount: amount,
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      metadata: {
        membership_type_id: membershipType.id.toString(),
      },
    });

    return price.id;
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      // Cancel subscription in Stripe
      await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    } catch (error) {
      console.error('Error canceling Stripe subscription:', error);
      throw new BadRequestException('Failed to cancel subscription');
    }
  }

  async handleWebhookEvent(payload: Buffer, signature: string): Promise<void> {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.configService.get<string>('STRIPE_WEBHOOK_SECRET', ''),
      );

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object);
          break;
        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(event.data.object);
          break;
        case 'invoice.paid':
          await this.handleInvoicePaid(event.data.object);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;
      }
    } catch (error: any) {
      console.error('Webhook error:', error);
      throw new BadRequestException(`Webhook error`);
    }
  }

  private async handlePaymentIntentSucceeded(
    paymentIntent: Stripe.PaymentIntent,
  ): Promise<void> {
    // Create payment record
    if (paymentIntent.metadata?.member_id) {
      await this.recordPayment({
        member_id: Number(paymentIntent.metadata.member_id),
        amount: paymentIntent.amount / 100, // Convert to dollars
        stripe_payment_id: paymentIntent.id,
      });
    }
  }

  private async handleCheckoutSessionCompleted(
    session: Stripe.Checkout.Session,
  ): Promise<void> {
    if (session.mode !== 'subscription' || !session.subscription) {
      return;
    }

    const memberId = Number(session.metadata?.member_id);
    const membershipTypeId = Number(session.metadata?.membership_type_id);

    if (!memberId || !membershipTypeId) {
      console.error('Missing metadata in checkout session:', session.id);
      return;
    }

    // Get subscription details from Stripe
    const subscription = await this.stripe.subscriptions.retrieve(
      session.subscription as string,
    );

    // Get membership type for class limit
    const membershipType =
      await this.membershipTypesService.findOne(membershipTypeId);

    // Calculate the end date (1 month from now)
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    // Create a new membership subscription
    const subscriptionData: CreateMembershipSubscriptionDto = {
      member_id: memberId,
      membership_type_id: membershipTypeId,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      stripe_subscription_id: subscription.id,
      remaining_classes: membershipType.class_limit || 0,
      status: 'active',
      auto_renew: true,
    };

    await this.subscriptionsService.create(subscriptionData);
  }

  private async handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
    if (!invoice.subscription) {
      return;
    }

    // Get the subscription from Stripe
    const subscription = await this.stripe.subscriptions.retrieve(
      invoice.subscription as string,
    );

    // Find the membership subscription in our database
    const membershipSubscriptions =
      await this.subscriptionsService.findByStripeSubscriptionId(
        subscription.id,
      );

    if (!membershipSubscriptions || membershipSubscriptions.length === 0) {
      console.error(
        'No membership subscription found for Stripe subscription:',
        subscription.id,
      );
      return;
    }

    const membershipSubscription = membershipSubscriptions[0];

    // Skip updating end_date if this is the initial payment
    // The invoice.billing_reason field tells us if this is the initial payment
    if (invoice.billing_reason === 'subscription_create') {
      // This is the first invoice for a new subscription
      // No need to extend the end date since checkout.session.completed already set it

      // Just record the payment
      await this.recordPayment({
        member_id: membershipSubscription.member_id,
        amount: invoice.amount_paid / 100, // Convert to dollars
        stripe_payment_id: invoice.payment_intent as string,
      });
      return;
    }

    // For renewals, continue with the existing logic to extend the subscription
    // Get membership type for class limit
    const membershipType = await this.membershipTypesService.findOne(
      membershipSubscription.membership_type_id,
    );

    // Calculate the new end date (1 month from the current end date)
    const newEndDate = new Date(membershipSubscription.end_date);
    newEndDate.setMonth(newEndDate.getMonth() + 1);

    // Update the existing subscription
    const updateData: UpdateMembershipSubscriptionDto = {
      end_date: newEndDate.toISOString().split('T')[0],
      remaining_classes: membershipType.class_limit || 0,
      status: 'active',
    };

    await this.subscriptionsService.update(
      membershipSubscription.id,
      updateData,
    );

    // Record the payment
    await this.recordPayment({
      member_id: membershipSubscription.member_id,
      amount: invoice.amount_paid / 100, // Convert to dollars
      stripe_payment_id: invoice.payment_intent as string,
    });
  }

  private async handleSubscriptionDeleted(
    subscription: Stripe.Subscription,
  ): Promise<void> {
    // Find the membership subscription in our database
    const membershipSubscriptions =
      await this.subscriptionsService.findByStripeSubscriptionId(
        subscription.id,
      );

    if (!membershipSubscriptions || membershipSubscriptions.length === 0) {
      console.error(
        'No membership subscription found for Stripe subscription:',
        subscription.id,
      );
      return;
    }

    const membershipSubscription = membershipSubscriptions[0];

    // Update the subscription status to canceled
    await this.subscriptionsService.update(membershipSubscription.id, {
      status: 'canceled',
      auto_renew: false,
    });
  }

  private async handleSubscriptionUpdated(
    subscription: Stripe.Subscription,
  ): Promise<void> {
    // Handle subscription updates (such as cancel_at_period_end being set to true)
    if (subscription.cancel_at_period_end) {
      // Find the membership subscription in our database
      const membershipSubscriptions =
        await this.subscriptionsService.findByStripeSubscriptionId(
          subscription.id,
        );

      if (!membershipSubscriptions || membershipSubscriptions.length === 0) {
        console.error(
          'No membership subscription found for Stripe subscription:',
          subscription.id,
        );
        return;
      }

      const membershipSubscription = membershipSubscriptions[0];

      // Update the auto_renew flag
      await this.subscriptionsService.update(membershipSubscription.id, {
        auto_renew: false,
      });
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
