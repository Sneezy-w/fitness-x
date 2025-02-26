import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Schedule } from '../../schedules/entities/schedule.entity';

@Entity()
export class Trainer {
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
  specialization: string;

  @Column({ nullable: true })
  experience_years: number;

  @Column({ default: false })
  is_approved: boolean;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Schedule, (schedule) => schedule.trainer)
  schedules: Schedule[];
}
