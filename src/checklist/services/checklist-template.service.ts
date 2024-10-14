import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChecklistTemplate } from '../entities/checklist-template.entity';
import { CreateChecklistTemplateDTO } from '../dto/create-checklist-template.dto';
import { UpdateChecklistTemplateDTO } from '../dto/update-checklist-template.dto';
import { ChecklistQuestion } from '../entities/checklist-question.entity';

@Injectable()
export class ChecklistTemplateService {
  constructor(
    @InjectRepository(ChecklistTemplate)
    private readonly templateRepository: Repository<ChecklistTemplate>,
    @InjectRepository(ChecklistQuestion)
    private readonly questionRepository: Repository<ChecklistQuestion>,
  ) {}

  async createTemplate(dto: CreateChecklistTemplateDTO): Promise<ChecklistTemplate> {
    const template = this.templateRepository.create({
      name: dto.name,
      description: dto.description,
      questions: dto.questions,
    });
    return this.templateRepository.save(template);
  }

  async findAll(): Promise<ChecklistTemplate[]> {
    return this.templateRepository.find({ relations: ['questions'] });
  }

  async findOne(id: string): Promise<ChecklistTemplate> {
    const template = await this.templateRepository.findOne({
      where: { id },
      relations: ['questions'],
    });
    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }
    return template;
  }

  async updateTemplate(id: string, dto: UpdateChecklistTemplateDTO): Promise<ChecklistTemplate> {
    const template = await this.findOne(id);
    this.templateRepository.merge(template, dto);
    return this.templateRepository.save(template);
  }

  async removeTemplate(id: string): Promise<void> {
    const template = await this.findOne(id);
    await this.templateRepository.remove(template);
  }
}