import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { MembershipSubscription } from '../../membership-subscriptions/entities/membership-subscription.entity';

@Entity()
export class MembershipType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  monthly_price: number;

  @Column({ nullable: true })
  class_limit: number;

  @Column({ default: true })
  is_active: boolean;

  @Column({ nullable: true })
  deleted_at: Date;

  @OneToMany(
    () => MembershipSubscription,
    (subscription) => subscription.membershipType,
  )
  subscriptions: MembershipSubscription[];
}
