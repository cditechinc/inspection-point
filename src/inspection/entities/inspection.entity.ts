import { Asset } from './../../assets/entities/asset.entity';
import { Client } from './../../client/entities/client.entity';
import { User } from './../../user/entities/user.entity';
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
import { Checklist } from './checklist.entity';
import { InspectionScore } from './inspection-score.entity';
import { Customer } from './../../customer/entities/customer.entity';

export enum InspectionStatus {
  NOT_DONE = 'Not-Done',
  STARTED_NOT_FINISHED = 'Started Not Finished',
  PAST_DUE = 'Past-Due',
  COMPLETE_BILLED = 'Complete Billed',
  COMPLETE_NOT_BILLED = 'Complete Not-Billed',
  ON_HOLD = 'On-Hold',
  CANCELED = 'Canceled',
}
@Entity('inspections')
export class Inspection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 255 })
    name: string;

  @ManyToOne(() => Client, (client) => client.inspections, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @ManyToOne(() => Customer, (customer) => customer.inspections, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ManyToOne(() => Asset, (asset) => asset.inspections, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'asset_id' })
  asset: Asset;

  @ManyToOne(() => User, (user) => user.assignedInspections, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'assigned_to' })
  assignedTo: User;

  @OneToMany(() => Checklist, (checklist) => checklist.inspection)
  checklists: Checklist[];

  @OneToMany(
    () => InspectionScore,
    (inspectionScore) => inspectionScore.inspection,
  )
  scores: InspectionScore[];

  // @Column('uuid', { nullable: true })
  // assignedTo: string;

  @Column({
    type: 'enum',
    enum: InspectionStatus,
    default: InspectionStatus.NOT_DONE,
  })
  status: InspectionStatus;

  @Column('timestamp')
  scheduledDate: Date;

  @Column('timestamp', { nullable: true })
  completedDate: Date;

  @Column('jsonb')
  route: any;

  @Column('text', { nullable: true })
  comments: string;

  @Column('decimal', { precision: 10, scale: 2 })
  serviceFee: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
