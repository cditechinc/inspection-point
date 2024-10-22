import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ChecklistTemplate } from './../checklist/entities/checklist-template.entity';
import { ChecklistQuestion } from './../checklist/entities/checklist-question.entity';
import { QuestionType } from './../checklist/entities/checklist-question.entity';

@Injectable()
export class ChecklistTemplateSeed {
  constructor(
    private readonly checklistTemplateRepository: Repository<ChecklistTemplate>,
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
        // Existing questions
        { question_text: 'structure', question_type: QuestionType.TEXT, is_required: false },
        { question_text: 'panel', question_type: QuestionType.TEXT, is_required: false },
        { question_text: 'pipes', question_type: QuestionType.TEXT, is_required: false },
        { question_text: 'alarm', question_type: QuestionType.TEXT, is_required: false },
        { question_text: 'alarmLight', question_type: QuestionType.TEXT, is_required: false },
        { question_text: 'wires', question_type: QuestionType.TEXT, is_required: false },
        { question_text: 'breakers', question_type: QuestionType.TEXT, is_required: false },
        { question_text: 'contactors', question_type: QuestionType.TEXT, is_required: false },
        { question_text: 'thermals', question_type: QuestionType.TEXT, is_required: false },
        // Float Scores
        { question_text: 'float1', question_type: QuestionType.TEXT, is_required: false },
        { question_text: 'float2', question_type: QuestionType.TEXT, is_required: false },
        { question_text: 'float3', question_type: QuestionType.TEXT, is_required: false },
        { question_text: 'float4', question_type: QuestionType.TEXT, is_required: false },
        { question_text: 'float5', question_type: QuestionType.TEXT, is_required: false },
        { question_text: 'float6', question_type: QuestionType.TEXT, is_required: false },
        { question_text: 'alarmFloat', question_type: QuestionType.TEXT, is_required: false },
        // Overall Score
        { question_text: 'overallScore', question_type: QuestionType.TEXT, is_required: false },
        // Cleaning Question
        { question_text: 'stationNeedsCleaning', question_type: QuestionType.BOOLEAN, is_required: false },
        // Pump-related questions
        { question_text: 'pump1Runs', question_type: QuestionType.BOOLEAN, is_required: true },
        { question_text: 'pump1Amps', question_type: QuestionType.TEXT, is_required: true },
        { question_text: 'pump1Contactors', question_type: QuestionType.TEXT, is_required: true },
        { question_text: 'pump2Runs', question_type: QuestionType.BOOLEAN, is_required: true },
        { question_text: 'pump2Amps', question_type: QuestionType.TEXT, is_required: true },
        { question_text: 'pump2Contactors', question_type: QuestionType.TEXT, is_required: true },
        { question_text: 'pump3Runs', question_type: QuestionType.BOOLEAN, is_required: true },
        { question_text: 'pump3Amps', question_type: QuestionType.TEXT, is_required: true },
        { question_text: 'pump3Contactors', question_type: QuestionType.TEXT, is_required: true },
        { question_text: 'pump4Runs', question_type: QuestionType.BOOLEAN, is_required: true },
        { question_text: 'pump4Amps', question_type: QuestionType.TEXT, is_required: true },
        { question_text: 'pump4Contactors', question_type: QuestionType.TEXT, is_required: true },
        { question_text: 'pump5Runs', question_type: QuestionType.BOOLEAN, is_required: true },
        { question_text: 'pump5Amps', question_type: QuestionType.TEXT, is_required: true },
        { question_text: 'pump5Contactors', question_type: QuestionType.TEXT, is_required: true },
        { question_text: 'pump6Runs', question_type: QuestionType.BOOLEAN, is_required: true },
        { question_text: 'pump6Amps', question_type: QuestionType.TEXT, is_required: true },
        { question_text: 'pump6Contactors', question_type: QuestionType.TEXT, is_required: true },
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

