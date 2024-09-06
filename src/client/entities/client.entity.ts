import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Customer } from '../../customer/entities/customer.entity';
import { Asset } from './../../assets/entities/asset.entity';
import { Photo } from './../../assets/entities/photo.entity';
import { Inspection } from './../../inspection/entities/inspection.entity';
import { Invoice } from './../../invoice/entities/invoice.entity';
import { UserGroup } from './../../user-groups/entities/user-group.entity';


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
  company_name: string;

  @Column({ nullable: true })
  company_type: string;

  @Column({ nullable: true })
  industry: string;

  @Column({ nullable: true })
  company_logo: string;

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

  @Column({ nullable: true })
  quickbooksAccessToken: string;

  @Column({ nullable: true })
  quickbooksRefreshToken: string;

  @Column({ nullable: true })
  quickbooksRealmId: string;

  @Column({ nullable: true })
  quickbooksTokenExpiresIn: Date;
  
  @Column({ nullable: true })
  quickbooksState: string;
  
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => User, user => user.client)
  users: User[];

  @OneToMany(() => Customer, customer => customer.client)
  customers: Customer[];

  @OneToMany(() => UserGroup, (userGroup) => userGroup.client)
  userGroups: UserGroup[];

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @OneToMany(() => Asset, asset => asset.client)
  assets: Asset[];

  @OneToMany(() => Photo, photo => photo.client)
  photos: Photo[];

  @OneToMany(() => Inspection, (inspection) => inspection.client)
  inspections: Inspection[];

  @OneToMany(() => Invoice, invoice => invoice.client)
  invoices: Invoice[];
}
