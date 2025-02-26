import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { MembershipSubscription } from './entities/membership-subscription.entity';
import { CreateMembershipSubscriptionDto } from './dto/create-membership-subscription.dto';
import { UpdateMembershipSubscriptionDto } from './dto/update-membership-subscription.dto';
import { MembersService } from '../members/members.service';
import { MembershipTypesService } from '../membership-types/membership-types.service';

@Injectable()
export class MembershipSubscriptionsService {
  constructor(
    @InjectRepository(MembershipSubscription)
    private subscriptionRepository: Repository<MembershipSubscription>,
    private membersService: MembersService,
    private membershipTypesService: MembershipTypesService,
  ) {}

  async create(
    createSubscriptionDto: CreateMembershipSubscriptionDto,
  ): Promise<MembershipSubscription> {
    // Verify that the member exists
    await this.membersService.findOne(createSubscriptionDto.member_id);

    // Verify that the membership type exists
    await this.membershipTypesService.findOne(
      createSubscriptionDto.membership_type_id,
    );

    const subscription = this.subscriptionRepository.create(
      createSubscriptionDto,
    );
    return this.subscriptionRepository.save(subscription);
  }

  async findAll(): Promise<MembershipSubscription[]> {
    return this.subscriptionRepository.find({
      relations: ['member', 'membershipType'],
    });
  }

  async findByMemberId(memberId: number): Promise<MembershipSubscription[]> {
    return this.subscriptionRepository.find({
      where: { member_id: memberId },
      relations: ['member', 'membershipType'],
    });
  }

  async findCurrentSubscription(
    memberId: number,
  ): Promise<MembershipSubscription | null> {
    const today = new Date();

    return this.subscriptionRepository.findOne({
      where: {
        member_id: memberId,
        start_date: LessThanOrEqual(today),
        end_date: MoreThanOrEqual(today),
      },
      relations: ['member', 'membershipType'],
    });
  }

  async findOne(id: number): Promise<MembershipSubscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id },
      relations: ['member', 'membershipType'],
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }

    return subscription;
  }

  async update(
    id: number,
    updateSubscriptionDto: UpdateMembershipSubscriptionDto,
  ): Promise<MembershipSubscription> {
    const subscription = await this.findOne(id);

    // If member_id is being updated, verify that the member exists
    if (updateSubscriptionDto.member_id) {
      await this.membersService.findOne(updateSubscriptionDto.member_id);
    }

    // If membership_type_id is being updated, verify that the membership type exists
    if (updateSubscriptionDto.membership_type_id) {
      await this.membershipTypesService.findOne(
        updateSubscriptionDto.membership_type_id,
      );
    }

    Object.assign(subscription, updateSubscriptionDto);
    return this.subscriptionRepository.save(subscription);
  }

  async remove(id: number): Promise<void> {
    const result = await this.subscriptionRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }
  }

  async decrementRemainingClasses(id: number): Promise<MembershipSubscription> {
    const subscription = await this.findOne(id);

    if (subscription.remaining_classes <= 0) {
      throw new Error('No remaining classes in subscription');
    }

    subscription.remaining_classes -= 1;
    return this.subscriptionRepository.save(subscription);
  }
}
