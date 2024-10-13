import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
  } from 'typeorm';
  import { Invoice } from './invoice.entity';
  import { Services } from './services.entity';
  
  @Entity('invoice_items')
  export class InvoiceItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @ManyToOne(() => Invoice, (invoice) => invoice.invoiceItems, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'invoice_id' })
    invoice: Invoice;
  
    @ManyToOne(() => Services, (serviceFee) => serviceFee.invoiceItems, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'service_fee_id' })
    serviceFee: Services;
  
    @Column({ type: 'integer', default: 1 })
    quantity: number;
  
    @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2 })
    unitPrice: number;
  
    @Column({ name: 'total_price', type: 'decimal', precision: 10, scale: 2 })
    totalPrice: number;
  
    @Column({ type: 'text', nullable: true })
    description: string;
  
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
  }
  