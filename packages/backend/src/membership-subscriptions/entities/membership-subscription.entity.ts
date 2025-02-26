import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Member } from '../../members/entities/member.entity';
import { MembershipType } from '../../membership-types/entities/membership-type.entity';

@Entity()
export class MembershipSubscription {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Member, (member) => member.subscriptions)
  @JoinColumn({ name: 'member_id' })
  member: Member;

  @Column()
  member_id: number;

  @ManyToOne(
    () => MembershipType,
    (membershipType) => membershipType.subscriptions,
  )
  @JoinColumn({ name: 'membership_type_id' })
  membershipType: MembershipType;

  @Column()
  membership_type_id: number;

  @Column({ type: 'date' })
  start_date: Date;

  @Column({ type: 'date' })
  end_date: Date;

  @Column()
  stripe_subscription_id: string;

  @Column()
  remaining_classes: number;
}
