import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Member } from '../../members/entities/member.entity';

@Entity()
export class FreeClassAllocation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Member, (member) => member.freeClassAllocations)
  @JoinColumn({ name: 'member_id' })
  member: Member;

  @Column()
  member_id: number;

  @Column()
  quantity: number;

  @CreateDateColumn()
  created_at: Date;
}
