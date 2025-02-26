import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Class } from '../../classes/entities/class.entity';
import { Trainer } from '../../trainers/entities/trainer.entity';
import { Booking } from '../../bookings/entities/booking.entity';

@Entity()
export class Schedule {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Class, (classEntity) => classEntity.schedules)
  @JoinColumn({ name: 'class_id' })
  class: Class;

  @Column()
  class_id: number;

  @ManyToOne(() => Trainer, (trainer) => trainer.schedules)
  @JoinColumn({ name: 'trainer_id' })
  trainer: Trainer;

  @Column()
  trainer_id: number;

  @Column()
  start_time: Date;

  @Column()
  end_time: Date;

  @Column({ default: false })
  is_cancelled: boolean;

  @OneToMany(() => Booking, (booking) => booking.schedule)
  bookings: Booking[];
}
