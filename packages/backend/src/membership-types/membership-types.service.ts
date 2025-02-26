import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MembershipType } from './entities/membership-type.entity';
import { CreateMembershipTypeDto } from './dto/create-membership-type.dto';
import { UpdateMembershipTypeDto } from './dto/update-membership-type.dto';

@Injectable()
export class MembershipTypesService {
  constructor(
    @InjectRepository(MembershipType)
    private membershipTypeRepository: Repository<MembershipType>,
  ) {}

  async create(
    createMembershipTypeDto: CreateMembershipTypeDto,
  ): Promise<MembershipType> {
    // Check if a membership type with the given name already exists
    const existingMembershipType = await this.membershipTypeRepository.findOne({
      where: { name: createMembershipTypeDto.name },
    });

    if (existingMembershipType) {
      throw new ConflictException(
        'Membership type with this name already exists',
      );
    }

    const membershipType = this.membershipTypeRepository.create(
      createMembershipTypeDto,
    );
    return this.membershipTypeRepository.save(membershipType);
  }

  async findAll(): Promise<MembershipType[]> {
    return this.membershipTypeRepository.find({
      where: { is_active: true },
    });
  }

  async findAllIncludingDeleted(): Promise<MembershipType[]> {
    return this.membershipTypeRepository.find();
  }

  async findOne(id: number): Promise<MembershipType> {
    const membershipType = await this.membershipTypeRepository.findOne({
      where: { id },
    });

    if (!membershipType) {
      throw new NotFoundException(`Membership type with ID ${id} not found`);
    }

    return membershipType;
  }

  async update(
    id: number,
    updateMembershipTypeDto: UpdateMembershipTypeDto,
  ): Promise<MembershipType> {
    const membershipType = await this.findOne(id);

    // If name is being updated, check if it's already taken
    if (
      updateMembershipTypeDto.name &&
      updateMembershipTypeDto.name !== membershipType.name
    ) {
      const existingWithName = await this.membershipTypeRepository.findOne({
        where: { name: updateMembershipTypeDto.name },
      });

      if (existingWithName) {
        throw new ConflictException(
          'Membership type with this name already exists',
        );
      }
    }

    // Update the membership type with the provided data
    Object.assign(membershipType, updateMembershipTypeDto);
    return this.membershipTypeRepository.save(membershipType);
  }

  async softDelete(id: number): Promise<void> {
    const membershipType = await this.findOne(id);
    membershipType.is_active = false;
    membershipType.deleted_at = new Date();
    await this.membershipTypeRepository.save(membershipType);
  }

  async restore(id: number): Promise<MembershipType> {
    const membershipType = await this.findOne(id);
    membershipType.is_active = true;
    membershipType.deleted_at = null as unknown as Date;
    return this.membershipTypeRepository.save(membershipType);
  }
}
