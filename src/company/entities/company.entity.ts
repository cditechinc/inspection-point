import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Client } from '../../client/entities/client.entity';
import { Package } from './../../packages/entities/package.entity';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Client, (client) => client.company)
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column()
  company_name: string;

  @Column({ nullable: true })
  company_type: string;

  @Column({ nullable: true })
  industry: string;

  @Column({ nullable: true })
  company_logo: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  billing_address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  zipcode: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  phone2: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  payment_method: string;

  @ManyToOne(() => Package, (pkg) => pkg.companies, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'package_id' })
  package: Package;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
