import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FreeClassAllocation } from './entities/free-class-allocation.entity';
import { CreateFreeClassAllocationDto } from './dto/create-free-class-allocation.dto';
import { MembersService } from '../members/members.service';

@Injectable()
export class FreeClassAllocationsService {
  constructor(
    @InjectRepository(FreeClassAllocation)
    private freeClassAllocationRepository: Repository<FreeClassAllocation>,
    private membersService: MembersService,
  ) {}

  async create(
    createFreeClassAllocationDto: CreateFreeClassAllocationDto,
  ): Promise<FreeClassAllocation> {
    // Verify that the member exists
    await this.membersService.findOne(createFreeClassAllocationDto.member_id);

    const allocation = this.freeClassAllocationRepository.create(
      createFreeClassAllocationDto,
    );
    return this.freeClassAllocationRepository.save(allocation);
  }

  async findAll(): Promise<FreeClassAllocation[]> {
    return this.freeClassAllocationRepository.find({
      relations: ['member'],
    });
  }

  async findByMemberId(memberId: number): Promise<FreeClassAllocation[]> {
    return this.freeClassAllocationRepository.find({
      where: { member_id: memberId },
      relations: ['member'],
    });
  }

  async findOne(id: number): Promise<FreeClassAllocation> {
    const allocation = await this.freeClassAllocationRepository.findOne({
      where: { id },
      relations: ['member'],
    });

    if (!allocation) {
      throw new NotFoundException(
        `Free class allocation with ID ${id} not found`,
      );
    }

    return allocation;
  }

  async remove(id: number): Promise<void> {
    const result = await this.freeClassAllocationRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(
        `Free class allocation with ID ${id} not found`,
      );
    }
  }

  async getRemainingFreeClasses(memberId: number): Promise<number> {
    const allocations = await this.findByMemberId(memberId);
    return allocations.reduce(
      (total, allocation) => total + allocation.quantity,
      0,
    );
  }

  async decrementFreeClasses(memberId: number): Promise<number> {
    const allocations = await this.findByMemberId(memberId);
    const remainingClasses = await this.getRemainingFreeClasses(memberId);

    if (allocations.length === 0 || remainingClasses <= 0) {
      throw new Error('No free classes available');
    }

    // Find the first allocation with available classes
    const allocation = allocations.find((a) => a.quantity > 0);

    if (!allocation) {
      throw new Error('No free classes available');
    }

    // Decrement the quantity
    allocation.quantity -= 1;
    await this.freeClassAllocationRepository.save(allocation);

    // If the allocation is now empty, remove it
    if (allocation.quantity === 0) {
      await this.freeClassAllocationRepository.remove(allocation);
    }

    return this.getRemainingFreeClasses(memberId);
  }
}
