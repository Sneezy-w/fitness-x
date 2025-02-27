import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Member } from './entities/member.entity';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member)
    private membersRepository: Repository<Member>,
  ) {}

  async create(createMemberDto: CreateMemberDto): Promise<Member> {
    // Check if a member with the given email already exists
    const existingMember = await this.membersRepository.findOne({
      where: { email: createMemberDto.email },
    });

    if (existingMember) {
      throw new ConflictException('Email already exists');
    }

    // Hash the password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createMemberDto.password, salt);

    // Create a new member with the hashed password
    const member = this.membersRepository.create({
      ...createMemberDto,
      password: hashedPassword,
    });

    // Save and return the member without password
    return this.membersRepository.save(member);
  }

  async findAll(): Promise<Member[]> {
    const members = await this.membersRepository
      .createQueryBuilder('member')
      .leftJoinAndSelect(
        'member.subscriptions',
        'subscription',
        'subscription.end_date >= :now AND subscription.start_date <= :now',
        { now: new Date() },
      )
      .getMany();

    return members;
  }

  async findOne(id: number): Promise<Member> {
    const member = await this.membersRepository.findOne({
      where: { id },
    });

    if (!member) {
      throw new NotFoundException(`Member with ID ${id} not found`);
    }

    return member;
  }

  async findByEmail(email: string): Promise<Member> {
    const member = await this.membersRepository.findOne({
      where: { email },
    });

    if (!member) {
      throw new NotFoundException(`Member with email ${email} not found`);
    }

    return member;
  }

  async update(id: number, updateMemberDto: UpdateMemberDto): Promise<Member> {
    const member = await this.findOne(id);

    // Hash the password if it's being updated
    if (updateMemberDto.password) {
      const salt = await bcrypt.genSalt();
      updateMemberDto.password = await bcrypt.hash(
        updateMemberDto.password,
        salt,
      );
    }

    // Update the member with the provided data
    Object.assign(member, updateMemberDto);
    return this.membersRepository.save(member);
  }

  async deactivate(id: number): Promise<void> {
    const result = await this.membersRepository.update(id, {
      is_active: false,
    });

    if (result.affected === 0) {
      throw new NotFoundException(`Member with ID ${id} not found`);
    }
  }

  async activate(id: number): Promise<void> {
    const result = await this.membersRepository.update(id, {
      is_active: true,
    });

    if (result.affected === 0) {
      throw new NotFoundException(`Member with ID ${id} not found`);
    }
  }

  async validateMember(
    email: string,
    password: string,
  ): Promise<Member | null> {
    try {
      const member = await this.findByEmail(email);
      if (await bcrypt.compare(password, member.password)) {
        return member;
      }
      return null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
