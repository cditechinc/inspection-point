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
  
    @Column('varchar', { length: 10, name: 'structure_score' })
    structureScore: string;
  
    @Column('varchar', { length: 10, name: 'panel_score' })
    panelScore: string;
  
    @Column('varchar', { length: 10, name: 'pipes_score' })
    pipesScore: string;
  
    @Column('varchar', { length: 10, name: 'alarm_score' })
    alarmScore: string;
  
    @Column('varchar', { length: 10, name: 'alarm_light_score' })
    alarmLightScore: string;
  
    @Column('varchar', { length: 10, name: 'wires_score' })
    wiresScore: string;
  
    @Column('varchar', { length: 10, name: 'breakers_score' })
    breakersScore: string;
  
    @Column('varchar', { length: 10, name: 'contactors_score' })
    contactorsScore: string;
  
    @Column('varchar', { length: 10, name: 'thermals_score' })
    thermalsScore: string;
  
    @Column('jsonb', { name: 'float_scores' })
    floatScores: object;
  
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
  }