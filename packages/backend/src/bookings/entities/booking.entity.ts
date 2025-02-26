import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Member } from '../../members/entities/member.entity';
import { Schedule } from '../../schedules/entities/schedule.entity';

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Member, (member) => member.bookings)
  @JoinColumn({ name: 'member_id' })
  member: Member;

  @Column()
  member_id: number;

  @ManyToOne(() => Schedule, (schedule) => schedule.bookings)
  @JoinColumn({ name: 'schedule_id' })
  schedule: Schedule;

  @Column()
  schedule_id: number;

  @CreateDateColumn()
  booked_at: Date;

  @Column({ default: false })
  is_attended: boolean;

  @Column({ default: false })
  used_free_class: boolean;
}
