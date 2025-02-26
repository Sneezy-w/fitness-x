import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Class } from './entities/class.entity';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(Class)
    private classesRepository: Repository<Class>,
  ) {}

  async create(createClassDto: CreateClassDto): Promise<Class> {
    const newClass = this.classesRepository.create(createClassDto);
    return this.classesRepository.save(newClass);
  }

  async findAll(): Promise<Class[]> {
    return this.classesRepository.find({
      where: { is_active: true },
      order: { name: 'ASC' },
    });
  }

  async findAllIncludingInactive(): Promise<Class[]> {
    return this.classesRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Class> {
    const classEntity = await this.classesRepository.findOne({
      where: { id },
      relations: ['schedules'],
    });

    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    return classEntity;
  }

  async update(id: number, updateClassDto: UpdateClassDto): Promise<Class> {
    const classToUpdate = await this.findOne(id);

    // Merge the updated fields
    this.classesRepository.merge(classToUpdate, updateClassDto);

    return this.classesRepository.save(classToUpdate);
  }

  async remove(id: number): Promise<void> {
    const classToDelete = await this.findOne(id);
    await this.classesRepository.remove(classToDelete);
  }

  async deactivate(id: number): Promise<Class> {
    const classToDeactivate = await this.findOne(id);
    classToDeactivate.is_active = false;
    return this.classesRepository.save(classToDeactivate);
  }

  async activate(id: number): Promise<Class> {
    const classToActivate = await this.findOne(id);
    classToActivate.is_active = true;
    return this.classesRepository.save(classToActivate);
  }
}
