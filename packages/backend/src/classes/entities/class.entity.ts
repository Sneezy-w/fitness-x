import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Schedule } from '../../schedules/entities/schedule.entity';

@Entity('classes')
export class Class {
  @PrimaryGeneratedColumn()
  @ApiProperty({
    description: 'The unique identifier of the class',
    type: Number,
  })
  id: number;

  @Column()
  @ApiProperty({ description: 'Name of the class', type: String })
  name: string;

  @Column()
  @ApiProperty({ description: 'Description of the class', type: String })
  description: string;

  @Column()
  @ApiProperty({
    description: 'Duration of the class in minutes',
    type: Number,
  })
  duration: number;

  @Column()
  @ApiProperty({ description: 'Maximum capacity of the class', type: Number })
  capacity: number;

  @Column({ default: true })
  @ApiProperty({ description: 'Whether the class is active', type: Boolean })
  is_active: boolean;

  @OneToMany(() => Schedule, (schedule) => schedule.class)
  schedules: Schedule[];

  @CreateDateColumn()
  @ApiProperty({ description: 'When the class was created', type: Date })
  created_at: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'When the class was last updated', type: Date })
  updated_at: Date;
}
