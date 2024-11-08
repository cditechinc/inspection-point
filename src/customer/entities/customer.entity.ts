import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Client } from '../../client/entities/client.entity';
import { Photo } from './../../assets/entities/photo.entity';
import { Asset } from './../../assets/entities/asset.entity';
import { Inspection } from './../../inspection/entities/inspection.entity';
import { Invoice } from './../../invoice/entities/invoice.entity';
import { Task } from './../../task-management/entities/task.entity';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phone: string;

  @Column()
  address: string;

  @Column()
  service_address: string;

  @Column()
  billing_address: string;

  @Column()
  type: string;

  @Column()
  status: string;

  @Column()
  gate_code: string;

  @Column()
  previous_phone_number: string;

  @Column()
  service_contact: string;

  @Column({ nullable: true })
  quickbooksCustomerId: string;

  @Column({ nullable: true })
  previousProvider: string;

  @Column('text', { array: true, nullable: true })
  photos: string[];

  @Column({ nullable: true })
  billingContactEmail: string;

  @ManyToOne(() => Client, (client) => client.customers, {
    onDelete: 'CASCADE',
  })
  client: Client;

  @OneToMany(() => Photo, (photo) => photo.customer)
  photosRelation: Photo[];

  @OneToMany(() => Asset, (asset) => asset.customer)
  assets: Asset[];

  @OneToMany(() => Inspection, (inspection) => inspection.customer)
  inspections: Inspection[];

  @OneToMany(() => Invoice, (invoice) => invoice.customer)
  invoices: Invoice[];

  @OneToMany(() => Task, (task) => task.customer)
  tasks: Task[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
