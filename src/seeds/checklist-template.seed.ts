import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChecklistTemplate } from './../checklist/entities/checklist-template.entity';
import { ChecklistQuestion } from './../checklist/entities/checklist-question.entity';
import { QuestionType } from './../checklist/entities/checklist-question.entity';

@Injectable()
export class ChecklistTemplateSeed {
  constructor(
    @InjectRepository(ChecklistTemplate)
    private readonly checklistTemplateRepository: Repository<ChecklistTemplate>,
    @InjectRepository(ChecklistQuestion)
    private readonly checklistQuestionRepository: Repository<ChecklistQuestion>,
  ) {}

  async run() {
    // Define the checklist template
    const checklistTemplateData = {
      name: 'Monthly Lift Station Inspection Checklist',
      description: 'Checklist for inspecting lift stations',
    };

    console.log(`Looking for checklist template in the checklist_templates table`);
    // Check if the checklist template already exists
    const existingTemplate = await this.checklistTemplateRepository.findOne({
      where: { name: checklistTemplateData.name },
    });

    if (!existingTemplate) {
      // Create the checklist template
      const checklistTemplate = this.checklistTemplateRepository.create(checklistTemplateData);
      const savedTemplate = await this.checklistTemplateRepository.save(checklistTemplate);

      // Define the checklist questions
      const questions = [
        { question_text: 'Structure', question_type: QuestionType.TEXT, is_required: false },
        { question_text: 'Panel', question_type: QuestionType.TEXT, is_required: false },
        { question_text: 'Pipes', question_type: QuestionType.TEXT, is_required: false },
        { question_text: 'Alarm', question_type: QuestionType.TEXT, is_required: false },
        { question_text: 'Alarm Light', question_type: QuestionType.TEXT, is_required: false },
        { question_text: 'Wires', question_type: QuestionType.TEXT, is_required: false },
        { question_text: 'Breakers', question_type: QuestionType.TEXT, is_required: false },
        { question_text: 'Contactors', question_type: QuestionType.TEXT, is_required: false },
        { question_text: 'Thermals', question_type: QuestionType.TEXT, is_required: false },
        // Float Scores
        { question_text: 'Float 1', question_type: QuestionType.TEXT, is_required: false },
        { question_text: 'Float 2', question_type: QuestionType.TEXT, is_required: false },
        { question_text: 'Float 3', question_type: QuestionType.TEXT, is_required: false },
        { question_text: 'Float 4', question_type: QuestionType.TEXT, is_required: false },
        { question_text: 'Float 5', question_type: QuestionType.TEXT, is_required: false },
        { question_text: 'Float 6', question_type: QuestionType.TEXT, is_required: false },
        { question_text: 'Alarm Float', question_type: QuestionType.TEXT, is_required: false },
        // Overall Score
        { question_text: 'Overall Score', question_type: QuestionType.TEXT, is_required: false },
        // Cleaning Question
        { question_text: 'Station needs cleaning?', question_type: QuestionType.BOOLEAN, is_required: false },
      ];

      // Create and save all the questions associated with the checklist template
      for (const question of questions) {
        const checklistQuestion = this.checklistQuestionRepository.create({
          ...question,
          template: savedTemplate,  // Associate the question with the saved checklist template
        });
        await this.checklistQuestionRepository.save(checklistQuestion);
      }

      console.log('Checklist template and questions have been seeded successfully!');
    } else {
      console.log('Checklist template already exists, skipping seeding.');
    }
  }
}
