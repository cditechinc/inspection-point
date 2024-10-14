import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { InspectionChecklist } from '../entities/inspection-checklist.entity';
import { SubmitInspectionChecklistDTO } from '../dto/submit-inspection-checklist.dto';
import { Inspection } from '../../inspection/entities/inspection.entity';
import { ChecklistTemplate } from '../entities/checklist-template.entity';
import { ChecklistQuestion } from '../entities/checklist-question.entity';
import { InspectionChecklistAnswer } from '../entities/inspection-checklist-answer.entity';

@Injectable()
export class InspectionChecklistService {
  constructor(
    @InjectRepository(InspectionChecklist)
    private readonly inspectionChecklistRepository: Repository<InspectionChecklist>,
    @InjectRepository(InspectionChecklistAnswer)
    private readonly answerRepository: Repository<InspectionChecklistAnswer>,
    @InjectRepository(Inspection)
    private readonly inspectionRepository: Repository<Inspection>,
    @InjectRepository(ChecklistTemplate)
    private readonly templateRepository: Repository<ChecklistTemplate>,
    @InjectRepository(ChecklistQuestion)
    private readonly questionRepository: Repository<ChecklistQuestion>,
  ) {}

  async createInspectionChecklist(
    dto: SubmitInspectionChecklistDTO,
  ): Promise<InspectionChecklist> {
    const inspection = await this.inspectionRepository.findOneBy({ id: dto.inspectionId });
    if (!inspection) {
      throw new NotFoundException(`Inspection with ID ${dto.inspectionId} not found`);
    }

    const template = await this.templateRepository.findOneBy({ id: dto.templateId });
    if (!template) {
      throw new NotFoundException(`Template with ID ${dto.templateId} not found`);
    }

    const inspectionChecklist = this.inspectionChecklistRepository.create({
      inspection,
      template,
    });

    const savedChecklist = await this.inspectionChecklistRepository.save(inspectionChecklist);

    // Save answers
    for (const answerDto of dto.answers) {
      const question = await this.questionRepository.findOneBy({ id: answerDto.questionId });
      if (!question) {
        throw new NotFoundException(`Question with ID ${answerDto.questionId} not found`);
      }

      const answer = this.answerRepository.create({
        inspectionChecklist: savedChecklist,
        question,
        answer: answerDto.answer,
      });

      await this.answerRepository.save(answer);
    }

    return savedChecklist;
  }

  async getInspectionChecklist(id: string): Promise<InspectionChecklist> {
    const checklist = await this.inspectionChecklistRepository.findOne({
      where: { id },
      relations: ['inspection', 'template', 'answers', 'answers.question'],
    });
    if (!checklist) {
      throw new NotFoundException(`Inspection Checklist with ID ${id} not found`);
    }
    return checklist;
  }
}