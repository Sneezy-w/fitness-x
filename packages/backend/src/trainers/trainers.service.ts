import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Trainer } from './entities/trainer.entity';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { UpdateTrainerDto } from './dto/update-trainer.dto';

@Injectable()
export class TrainersService {
  constructor(
    @InjectRepository(Trainer)
    private trainersRepository: Repository<Trainer>,
  ) {}

  async create(createTrainerDto: CreateTrainerDto): Promise<Trainer> {
    // Check if a trainer with the given email already exists
    const existingTrainer = await this.trainersRepository.findOne({
      where: { email: createTrainerDto.email },
    });

    if (existingTrainer) {
      throw new ConflictException('Email already exists');
    }

    // Hash the password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createTrainerDto.password, salt);

    // Create a new trainer with the hashed password
    const trainer = this.trainersRepository.create({
      ...createTrainerDto,
      password: hashedPassword,
    });

    // Save and return the trainer without password
    return this.trainersRepository.save(trainer);
  }

  async findAll(): Promise<Trainer[]> {
    return this.trainersRepository.find();
  }

  async findOne(id: number): Promise<Trainer> {
    const trainer = await this.trainersRepository.findOne({
      where: { id },
    });

    if (!trainer) {
      throw new NotFoundException(`Trainer with ID ${id} not found`);
    }

    return trainer;
  }

  async findByEmail(email: string): Promise<Trainer> {
    const trainer = await this.trainersRepository.findOne({
      where: { email },
    });

    if (!trainer) {
      throw new NotFoundException(`Trainer with email ${email} not found`);
    }

    return trainer;
  }

  async update(
    id: number,
    updateTrainerDto: UpdateTrainerDto,
  ): Promise<Trainer> {
    const trainer = await this.findOne(id);

    // Hash the password if it's being updated
    if (updateTrainerDto.password) {
      const salt = await bcrypt.genSalt();
      updateTrainerDto.password = await bcrypt.hash(
        updateTrainerDto.password,
        salt,
      );
    }

    // Update the trainer with the provided data
    Object.assign(trainer, updateTrainerDto);
    return this.trainersRepository.save(trainer);
  }

  async approveTrainer(id: number): Promise<Trainer> {
    const trainer = await this.findOne(id);
    trainer.is_approved = true;
    return this.trainersRepository.save(trainer);
  }

  async remove(id: number): Promise<void> {
    const result = await this.trainersRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Trainer with ID ${id} not found`);
    }
  }

  async validateTrainer(
    email: string,
    password: string,
  ): Promise<Trainer | null> {
    try {
      const trainer = await this.findByEmail(email);
      if (
        trainer.is_approved &&
        (await bcrypt.compare(password, trainer.password))
      ) {
        return trainer;
      }
      return null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
