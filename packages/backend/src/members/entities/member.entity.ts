import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Booking } from '../../bookings/entities/booking.entity';
import { MembershipSubscription } from '../../membership-subscriptions/entities/membership-subscription.entity';
import { FreeClassAllocation } from '../../free-class-allocations/entities/free-class-allocation.entity';
import { PaymentHistory } from '../../payments/entities/payment-history.entity';

@Entity('members')
export class Member {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column()
  full_name: string;

  @Column({ nullable: true })
  phone: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({ nullable: true })
  stripe_customer_id: string;

  @Column({ default: true })
  is_active: boolean;

  @OneToMany(() => Booking, (booking) => booking.member)
  bookings: Booking[];

  @OneToMany(
    () => MembershipSubscription,
    (subscription) => subscription.member,
  )
  subscriptions: MembershipSubscription[];

  @OneToMany(() => FreeClassAllocation, (allocation) => allocation.member)
  freeClassAllocations: FreeClassAllocation[];

  @OneToMany(() => PaymentHistory, (payment) => payment.member)
  paymentHistory: PaymentHistory[];
}
