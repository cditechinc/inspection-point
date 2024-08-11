import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Checklist } from './../entities/checklist.entity';
import { ChecklistDTO, UpdateChecklistDTO } from './../dto/checklist.dto';
import { ChecklistItem } from '../entities/checklist-item.entity';

@Injectable()
export class ChecklistService {
  constructor(
    @InjectRepository(Checklist)
    private readonly checklistRepository: Repository<Checklist>,
    @InjectRepository(ChecklistItem)
    private readonly checklistItemRepository: Repository<ChecklistItem>,
  ) {}

  async createChecklist(createChecklistDto: ChecklistDTO): Promise<Checklist> {
    const checklistItems = await this.checklistItemRepository.findBy({
      id: In(createChecklistDto.checklistItemIds),
    });

    if (checklistItems.length !== createChecklistDto.checklistItemIds.length) {
      throw new NotFoundException('Some ChecklistItems were not found');
    }

    const checklist = this.checklistRepository.create({
      name: createChecklistDto.name,
      overallScore: createChecklistDto.overallScore,
      items: checklistItems, // Associate the items with the checklist
    });

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
