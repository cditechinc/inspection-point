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

@Entity('checklists')
export class Checklist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Inspection, (inspection) => inspection.checklists, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'inspection_id' })
  inspection: Inspection;

  // Fields moved from InspectionScore
  @Column('varchar', { length: 10, name: 'structure_score', nullable: true })
  structureScore: string;

  @Column('varchar', { length: 10, name: 'panel_score', nullable: true })
  panelScore: string;

  @Column('varchar', { length: 10, name: 'pipes_score', nullable: true })
  pipesScore: string;

  @Column('varchar', { length: 10, name: 'alarm_score', nullable: true })
  alarmScore: string;

  @Column('varchar', { length: 10, name: 'alarm_light_score', nullable: true })
  alarmLightScore: string;

  @Column('varchar', { length: 10, name: 'wires_score', nullable: true })
  wiresScore: string;

  @Column('varchar', { length: 10, name: 'breakers_score', nullable: true })
  breakersScore: string;

  @Column('varchar', { length: 10, name: 'contactors_score', nullable: true })
  contactorsScore: string;

  @Column('varchar', { length: 10, name: 'thermals_score', nullable: true })
  thermalsScore: string;

  @Column('jsonb', { name: 'float_scores', nullable: true })
  floatScores: object;

  @Column('jsonb', { name: 'pump_scores', nullable: true })
  pumpScores: object;

  @Column('varchar', { length: 10, name: 'overall_score', nullable: true })
  overallScore: string;

  @Column('boolean', { name: 'cleaning', default: false })
  cleaning: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
