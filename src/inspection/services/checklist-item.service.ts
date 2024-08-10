import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChecklistItem } from './../entities/checklist-item.entity';
import { CreateChecklistItemDTO, UpdateChecklistItemDTO } from './../dto/checklist-item.dto';

@Injectable()
export class ChecklistItemService {
  constructor(
    @InjectRepository(ChecklistItem)
    private readonly checklistItemRepository: Repository<ChecklistItem>,
  ) {}

  async create(createChecklistItemDto: CreateChecklistItemDTO): Promise<ChecklistItem> {
    const checklistItem = this.checklistItemRepository.create(createChecklistItemDto);
    return this.checklistItemRepository.save(checklistItem);
  }

  async findAll(): Promise<ChecklistItem[]> {
    return this.checklistItemRepository.find({ relations: ['checklist'] });
  }

  async findOne(id: string): Promise<ChecklistItem> {
    const checklistItem = await this.checklistItemRepository.findOne({
      where: { id },
      relations: ['checklist'],
    });
    if (!checklistItem) {
      throw new NotFoundException(`ChecklistItem with ID ${id} not found`);
    }
    return checklistItem;
  }

  async update(id: string, updateChecklistItemDto: UpdateChecklistItemDTO): Promise<ChecklistItem> {
    const checklistItem = await this.findOne(id);
    this.checklistItemRepository.merge(checklistItem, updateChecklistItemDto);
    return this.checklistItemRepository.save(checklistItem);
  }

  async remove(id: string): Promise<void> {
    const checklistItem = await this.findOne(id);
    await this.checklistItemRepository.remove(checklistItem);
  }
}
