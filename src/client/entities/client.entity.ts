import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Customer } from '../../customer/entities/customer.entity';
import { Asset } from './../../assets/entities/asset.entity';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  billing_address: string;

  @Column({ nullable: true })
  industry: string;

  @Column({ nullable: true })
  payment_method: string;

  @Column({
    type: 'varchar',
    default: 'Active',
    enum: ['Active', 'Disabled', 'Fraud', 'Inactive'],
  })
  account_status: string;

  @Column({ nullable: true })
  custom_portal_url: string;

  @Column({ default: false })
  tax_exempt: boolean;

  @Column({ default: false })
  protected: boolean;

  @Column({ default: false })
  email_verified: boolean;

  @Column({ type: 'date', nullable: true })
  next_bill_date: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => User, user => user.client)
  users: User[];

  @OneToMany(() => Customer, customer => customer.client)
  customers: Customer[];

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @OneToMany(() => Asset, asset => asset.client)
  assets: Asset[];
}
