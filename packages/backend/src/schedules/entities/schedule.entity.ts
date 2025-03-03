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
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Schedule {
  @PrimaryGeneratedColumn()
  @ApiProperty({
    description: 'The unique identifier of the schedule',
    type: Number,
  })
  id: number;

  @ManyToOne(() => Class, (classEntity) => classEntity.schedules)
  @JoinColumn({ name: 'class_id' })
  @ApiProperty({
    description: 'The class associated with the schedule',
    type: Class,
  })
  class: Class;

  @Column()
  @ApiProperty({
    description: 'The ID of the class associated with the schedule',
    type: Number,
  })
  class_id: number;

  @ManyToOne(() => Trainer, (trainer) => trainer.schedules)
  @JoinColumn({ name: 'trainer_id' })
  @ApiProperty({
    description: 'The trainer associated with the schedule',
    type: Trainer,
  })
  trainer: Trainer;

  @Column()
  @ApiProperty({
    description: 'The ID of the trainer associated with the schedule',
    type: Number,
  })
  trainer_id: number;

  @Column({ type: 'date' })
  @ApiProperty({ description: 'The date of the schedule', type: String })
  date: string;

  @Column({ type: 'time' })
  @ApiProperty({
    description: 'The start time of the schedule',
    example: '10:00',
  })
  start_time: string;

  @Column({ type: 'time' })
  @ApiProperty({
    description: 'The end time of the schedule',
    example: '11:00',
  })
  end_time: string;

  @Column()
  @ApiProperty({ description: 'Maximum capacity of the class', type: Number })
  capacity: number;

  @Column({ default: false })
  @ApiProperty({
    description: 'Whether the schedule is cancelled',
    type: Boolean,
  })
  is_cancelled: boolean;

  @Column({ default: false })
  @ApiProperty({
    description: 'Whether the schedule has attendance marked',
    type: Boolean,
  })
  attendance_marked: boolean;

  @OneToMany(() => Booking, (booking) => booking.schedule)
  @ApiProperty({
    description: 'The bookings associated with the schedule',
    type: [Booking],
  })
  bookings: Booking[];
}
