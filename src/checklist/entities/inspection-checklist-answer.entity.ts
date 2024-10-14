import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { InspectionChecklist } from './inspection-checklist.entity';
  import { ChecklistQuestion } from './checklist-question.entity';
  
  @Entity('inspection_checklist_answers')
  export class InspectionChecklistAnswer {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @ManyToOne(() => InspectionChecklist, (checklist) => checklist.answers, {
      onDelete: 'CASCADE',
    })
    inspectionChecklist: InspectionChecklist;
  
    @ManyToOne(() => ChecklistQuestion)
    question: ChecklistQuestion;
  
    @Column('text', { nullable: true })
    answer: string;
  
    @CreateDateColumn()
    created_at: Date;
  
    @UpdateDateColumn()
    updated_at: Date;
  }