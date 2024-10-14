import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { ChecklistTemplate } from './checklist-template.entity';
  
  export enum QuestionType {
    TEXT = 'text',
    NUMBER = 'number',
    BOOLEAN = 'boolean',
    MULTIPLE_CHOICE = 'multiple_choice',
  }
  
  @Entity('checklist_questions')
  export class ChecklistQuestion {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @ManyToOne(() => ChecklistTemplate, (template) => template.questions, {
      onDelete: 'CASCADE',
    })
    template: ChecklistTemplate;
  
    @Column('text')
    question_text: string;
  
    @Column({
      type: 'enum',
      enum: QuestionType,
    })
    question_type: QuestionType;
  
    @Column('jsonb', { nullable: true })
    options: any; // For multiple-choice options
  
    @Column({ default: false })
    is_required: boolean;
  
    @CreateDateColumn()
    created_at: Date;
  
    @UpdateDateColumn()
    updated_at: Date;
  }