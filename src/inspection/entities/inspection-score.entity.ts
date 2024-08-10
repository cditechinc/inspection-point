import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
  } from 'typeorm';
  import { Inspection } from './inspection.entity';
  
  @Entity('inspection_scores')
  export class InspectionScore {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @ManyToOne(() => Inspection, (inspection) => inspection.scores, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'inspection_id' })
    inspection: Inspection;
  
    @Column('varchar', { length: 10 })
    structure_score: string;
  
    @Column('varchar', { length: 10 })
    panel_score: string;
  
    @Column('varchar', { length: 10 })
    pipes_score: string;
  
    @Column('varchar', { length: 10 })
    alarm_score: string;
  
    @Column('varchar', { length: 10 })
    alarm_light_score: string;
  
    @Column('varchar', { length: 10 })
    wires_score: string;
  
    @Column('varchar', { length: 10 })
    breakers_score: string;
  
    @Column('varchar', { length: 10 })
    contactors_score: string;
  
    @Column('varchar', { length: 10 })
    thermals_score: string;
  
    @Column('jsonb')
    float_scores: object;
  
    @CreateDateColumn()
    created_at: Date;
  
    @UpdateDateColumn()
    updated_at: Date;
  }