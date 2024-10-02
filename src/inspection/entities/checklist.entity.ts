import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
    JoinTable,
  } from 'typeorm';
  import { Inspection } from './inspection.entity';
  import { ChecklistItem } from './checklist-item.entity';
  
  @Entity('checklists')
  export class Checklist {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @ManyToOne(() => Inspection, (inspection) => inspection.checklists, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'inspection_id' })
    inspection: Inspection;
  
    @OneToMany(() => ChecklistItem, (checklistItem) => checklistItem.checklist, { cascade: true })
    @JoinTable()
    items: ChecklistItem[];
  
    @Column('varchar', { length: 255 })
    name: string;
  
    @CreateDateColumn()
    created_at: Date;
  
    @UpdateDateColumn()
    updated_at: Date;
  }