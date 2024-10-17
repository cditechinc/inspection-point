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
        { question_text: 'Structure', question_type: QuestionType.TEXT, is_required: false },
        { question_text: 'Panel', question_type: QuestionType.TEXT, is_required: false },
        { question_text: 'Pipes', question_type: QuestionType.TEXT, is_required: false },
        { question_text: 'Alarm', question_type: QuestionType.TEXT, is_required: false },
        { question_text: 'Alarm_Light', question_type: QuestionType.TEXT, is_required: false },
        { question_text: 'Wires', question_type: QuestionType.TEXT, is_required: false },
        { question_text: 'Breakers', question_type: QuestionType.TEXT, is_required: false },
        { question_text: 'Contactors', question_type: QuestionType.TEXT, is_required: false },
        { question_text: 'Thermals', question_type: QuestionType.TEXT, is_required: false },
        // Float Scores
        { question_text: 'Float_1', question_type: QuestionType.TEXT, is_required: false },
        { question_text: 'Float_2', question_type: QuestionType.TEXT, is_required: false },
        { question_text: 'Float_3', question_type: QuestionType.TEXT, is_required: false },
        { question_text: 'Float_4', question_type: QuestionType.TEXT, is_required: false },
        { question_text: 'Float_5', question_type: QuestionType.TEXT, is_required: false },
        { question_text: 'Float_6', question_type: QuestionType.TEXT, is_required: false },
        { question_text: 'Alarm_Float', question_type: QuestionType.TEXT, is_required: false },
        // Overall Score
        { question_text: 'Overall_Score', question_type: QuestionType.TEXT, is_required: false },
        // Cleaning Question
        { question_text: 'Station_needs_cleaning?', question_type: QuestionType.BOOLEAN, is_required: false },
        // Pump-related questions
        { question_text: 'Pump_1#_Runs?', question_type: QuestionType.BOOLEAN, is_required: true },
        { question_text: 'Pump_1#_Amps', question_type: QuestionType.TEXT, is_required: true },
        { question_text: 'Pump_1#_Contactors', question_type: QuestionType.TEXT, is_required: true },
        { question_text: 'Pump_2#_Runs?', question_type: QuestionType.BOOLEAN, is_required: true },
        { question_text: 'Pump_2#_Amps', question_type: QuestionType.TEXT, is_required: true },
        { question_text: 'Pump_2#_Contactors', question_type: QuestionType.TEXT, is_required: true },
        { question_text: 'Pump_3#_Runs?', question_type: QuestionType.BOOLEAN, is_required: true },
        { question_text: 'Pump_3#_Amps', question_type: QuestionType.TEXT, is_required: true },
        { question_text: 'Pump_3#_Contactors', question_type: QuestionType.TEXT, is_required: true },
        { question_text: 'Pump_4#_Runs?', question_type: QuestionType.BOOLEAN, is_required: true },
        { question_text: 'Pump_4#_Amps', question_type: QuestionType.TEXT, is_required: true },
        { question_text: 'Pump_4#_Contactors', question_type: QuestionType.TEXT, is_required: true },
        { question_text: 'Pump_5#_Runs?', question_type: QuestionType.BOOLEAN, is_required: true },
        { question_text: 'Pump_5#_Amps', question_type: QuestionType.TEXT, is_required: true },
        { question_text: 'Pump_5#_Contactors', question_type: QuestionType.TEXT, is_required: true },
        { question_text: 'Pump_6#_Runs?', question_type: QuestionType.BOOLEAN, is_required: true },
        { question_text: 'Pump_6#_Amps', question_type: QuestionType.TEXT, is_required: true },
        { question_text: 'Pump_6#_Contactors', question_type: QuestionType.TEXT, is_required: true },
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

