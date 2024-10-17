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

import { Customer } from './../../customer/entities/customer.entity';
import { Invoice } from './../../invoice/entities/invoice.entity';
import { Photo } from './../../assets/entities/photo.entity';
import { Services } from '../../invoice/entities/services.entity';
import { InspectionChecklist } from './../../checklist/entities/inspection-checklist.entity';

export enum InspectionStatus {
  NOT_DONE = 'Not-Done',
  STARTED_NOT_FINISHED = 'Started Not Finished',
  PAST_DUE = 'Past-Due',
  COMPLETE_BILLED = 'Complete Billed',
  COMPLETE_NOT_BILLED = 'Complete Not-Billed',
  ON_HOLD = 'On-Hold',
  CANCELED = 'Canceled',
}

export enum IntervalType {
  DAILY = 'Daily',
  BI_MONTHLY = 'Bi-Monthly',
  MONTHLY = 'Monthly',
  QUARTERLY = 'Quarterly',
  BI_ANNUAL = 'Bi-Annual',
  ANNUAL = 'Annual',
  ONE_TIME = 'One-Time',
}

@Entity('inspections')
export class Inspection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @Column('boolean', { default: false })
  isReocurring: boolean;

  @Column({
    type: 'enum',
    enum: IntervalType,
    nullable: true,
  })
  inspectionInterval: IntervalType;

  @Column('timestamp', { nullable: true })
  reocurrenceEndDate: Date;

  @OneToMany(() => InspectionChecklist, (checklist) => checklist.inspection, {
    cascade: true,
  })
  checklists: InspectionChecklist[];

  @ManyToOne(() => Invoice, (invoice) => invoice.inspections, {
    nullable: true,
  })
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice;

  @OneToMany(() => Photo, (photo) => photo.inspection, { cascade: true })
  photos: Photo[];

  @ManyToOne(() => Services, { nullable: true })
  @JoinColumn({ name: 'service_fee_id' })
  serviceFee: Services;

  @Column({
    type: 'enum',
    enum: InspectionStatus,
    default: InspectionStatus.NOT_DONE,
  })
  status: InspectionStatus;

  @Column({ nullable: true }) // Allow null if the PDF hasn't been uploaded yet
  pdfFilePath: string;

  @Column('timestamp')
  scheduledDate: Date;

  @Column('timestamp', { nullable: true })
  completedDate: Date;

  @Column('jsonb')
  route: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
