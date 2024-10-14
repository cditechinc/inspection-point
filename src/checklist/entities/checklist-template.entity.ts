import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { ChecklistQuestion } from './checklist-question.entity';
  
  @Entity('checklist_templates') 
  export class ChecklistTemplate {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ length: 255 })
    name: string;
  
    @Column('text', { nullable: true })
    description: string;
  
    @OneToMany(() => ChecklistQuestion, (question) => question.template, {
      cascade: true,
    })
    questions: ChecklistQuestion[];
  
    @CreateDateColumn()
    created_at: Date;
  
    @UpdateDateColumn()
    updated_at: Date;
  }