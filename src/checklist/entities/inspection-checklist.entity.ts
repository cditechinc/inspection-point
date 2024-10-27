import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
  } from 'typeorm';
  import { Inspection } from './../../inspection/entities/inspection.entity';
  import { ChecklistTemplate } from './checklist-template.entity';
  import { InspectionChecklistAnswer } from './inspection-checklist-answer.entity';
  
  @Entity('inspection_checklists')
  export class InspectionChecklist {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @ManyToOne(() => Inspection, (inspection) => inspection.checklists, {
      onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'inspection_id' })
    inspection: Inspection;
  
    @ManyToOne(() => ChecklistTemplate)
    @JoinColumn({ name: 'template_id' })
    template: ChecklistTemplate;
  
    @OneToMany(() => InspectionChecklistAnswer, (answer) => answer.inspectionChecklist, {
      cascade: true,
    })
    answers: InspectionChecklistAnswer[];
  
    @Column({ nullable: true })
    completed_at: Date;
  
    @CreateDateColumn()
    created_at: Date;
  
    @UpdateDateColumn()
    updated_at: Date;
  }