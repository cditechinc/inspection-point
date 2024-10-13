import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    Unique,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { Client } from '../../client/entities/client.entity';
  import { InvoiceItem } from './invoice-item.entity';
  
  @Entity('services')
  @Unique(['name', 'client'])
  export class Services {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ name: 'quickbooks_service_id', type: 'varchar', length: 255, unique: true })
    quickbooksServiceId: string;
  
    @Column({ type: 'varchar', length: 255 })
    name: string;
  
    @Column({ type: 'text', nullable: true })
    description: string;
  
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;
  
    @Column({ name: 'is_taxable', type: 'boolean', default: false })
    isTaxable: boolean;

    @Column({ nullable: true })
    billing_io: string;
  
    @ManyToOne(() => Client, (client) => client.serviceFees, { onDelete: 'CASCADE' })
    client: Client;
  
    @OneToMany(() => InvoiceItem, (invoiceItem) => invoiceItem.serviceFee)
    invoiceItems: InvoiceItem[];
  
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
  }
  