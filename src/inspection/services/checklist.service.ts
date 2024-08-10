import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Checklist } from './../entities/checklist.entity';
import { ChecklistDTO, UpdateChecklistDTO } from './../dto/checklist.dto';

@Injectable()
export class ChecklistService {
  constructor(
    @InjectRepository(Checklist)
    private readonly checklistRepository: Repository<Checklist>,
  ) {}

  async create(createChecklistDto: ChecklistDTO): Promise<Checklist> {
    const checklist = this.checklistRepository.create(createChecklistDto);
    return this.checklistRepository.save(checklist);
  }

  async findAll(): Promise<Checklist[]> {
    return this.checklistRepository.find({ relations: ['items', 'inspection'] });
  }

  async findOne(id: string): Promise<Checklist> {
    const checklist = await this.checklistRepository.findOne({
      where: { id },
      relations: ['items', 'inspection'],
    });
    if (!checklist) {
      throw new NotFoundException(`Checklist with ID ${id} not found`);
    }
    return checklist;
  }

  async update(id: string, updateChecklistDto: UpdateChecklistDTO): Promise<Checklist> {
    const checklist = await this.findOne(id);
    this.checklistRepository.merge(checklist, updateChecklistDto);
    return this.checklistRepository.save(checklist);
  }

  async remove(id: string): Promise<void> {
    const checklist = await this.findOne(id);
    await this.checklistRepository.remove(checklist);
  }
}
