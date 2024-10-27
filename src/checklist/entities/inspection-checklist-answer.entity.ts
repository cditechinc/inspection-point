import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
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
    @JoinColumn({ name: 'inspection_checklist_id' })
    inspectionChecklist: InspectionChecklist;
  
    @ManyToOne(() => ChecklistQuestion)
    @JoinColumn({ name: 'question_id' })
    question: ChecklistQuestion;
  
    @Column('text', { nullable: true })
    answer: string;
  
    @CreateDateColumn()
    created_at: Date;
  
    @UpdateDateColumn()
    updated_at: Date;
  }