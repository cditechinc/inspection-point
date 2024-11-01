import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { Company } from '../../company/entities/company.entity';
  
  @Entity('packages')
  export class Package {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ unique: true })
    name: string;
  
    @Column('decimal', { precision: 10, scale: 2 })
    monthly_price: number;
  
    @Column('decimal', { precision: 10, scale: 2 })
    yearly_price: number;
  
    @Column({ type: 'integer', nullable: true })
    customer_limit: number;
  
    @Column({ type: 'integer', nullable: true })
    asset_limit: number;
  
    @Column({ type: 'integer', nullable: true })
    user_limit: number;
  
    @Column({ type: 'integer', nullable: true })
    inspection_limit: number;
  
    @Column({ type: 'integer', nullable: true })
    photo_storage_limit: number;
  
    @Column({ type: 'integer', nullable: true })
    video_storage_limit: number;
  
    @Column({ type: 'integer', nullable: true })
    pdf_storage_limit: number;
  
    @Column({ type: 'integer', nullable: true })
    sms_limit: number;
  
    @Column({ default: false })
    customer_portal: boolean;
  
    @OneToMany(() => Company, (company) => company.package)
    companies: Company[];
  
    @CreateDateColumn()
    created_at: Date;
  
    @UpdateDateColumn()
    updated_at: Date;
  }