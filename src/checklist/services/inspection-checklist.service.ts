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
  
    // If checklist exists, update it; else, create a new one
    let inspectionChecklist: InspectionChecklist;
    if (dto.id) {
      inspectionChecklist = await this.inspectionChecklistRepository.findOne({
        where: { id: dto.id },
        relations: ['answers', 'answers.question'],
      });
      if (!inspectionChecklist) {
        throw new NotFoundException(`Inspection Checklist with ID ${dto.id} not found`);
      }
    } else {
      inspectionChecklist = this.inspectionChecklistRepository.create({
        inspection,
        template,
      });
      inspectionChecklist = await this.inspectionChecklistRepository.save(inspectionChecklist);
    }
  
    // Fetch all questions in one query
    const questionIds = dto.answers.map(answer => answer.questionId);
    const questions = await this.questionRepository.find({
      where: { id: In(questionIds) },
    });
  
    const questionMap = new Map<string, ChecklistQuestion>();
    questions.forEach(question => {
      questionMap.set(question.id, question);
    });
  
    // Prepare all answers to be saved
    const answersToSave: InspectionChecklistAnswer[] = dto.answers.map(answerDto => {
      const question = questionMap.get(answerDto.questionId);
      if (!question) {
        throw new NotFoundException(`Question with ID ${answerDto.questionId} not found`);
      }
  
      // Check if answer already exists
      let answer = inspectionChecklist.answers?.find(
        a => a.question.id === question.id,
      );
  
      if (answer) {
        // Update existing answer
        answer.answer = answerDto.answer;
      } else {
        // Create new answer
        answer = this.answerRepository.create({
          inspectionChecklist,
          question,
          answer: answerDto.answer,
        });
        // Initialize answers array if undefined
        inspectionChecklist.answers = inspectionChecklist.answers || [];
        inspectionChecklist.answers.push(answer);
      }
  
      return answer;
    });
  
    // Save all answers in one batch
    await this.answerRepository.save(answersToSave);
  
    // Update the inspection checklist
    return this.inspectionChecklistRepository.save(inspectionChecklist);
  }
  

  async getInspectionChecklist(id: string): Promise<any> {
    const checklist = await this.inspectionChecklistRepository
      .createQueryBuilder('ic')
      .leftJoinAndSelect('ic.inspection', 'inspection')
      .leftJoinAndSelect('ic.template', 'template')
      .leftJoinAndSelect('template.questions', 'questions')
      .leftJoinAndSelect('ic.answers', 'answers')
      .leftJoinAndSelect('answers.question', 'answerQuestion')
      .where('ic.id = :id', { id })
      .getOne();
  
    if (!checklist) {
      throw new NotFoundException(`Inspection Checklist with ID ${id} not found`);
    }
  
    // Map questions to their answers
    const questionsWithAnswers = checklist.template.questions.map(question => {
      const answer = checklist.answers.find(
        answer => answer.question.id === question.id,
      );
      return {
        questionId: question.id,
        questionText: question.question_text,
        questionType: question.question_type,
        options: question.options,
        isRequired: question.is_required,
        answer: answer ? answer.answer : null,
      };
    });
  
    return {
      inspectionChecklistId: checklist.id,
      inspectionId: checklist.inspection.id,
      templateId: checklist.template.id,
      completedAt: checklist.completed_at,
      questions: questionsWithAnswers,
    };
  }
  
}