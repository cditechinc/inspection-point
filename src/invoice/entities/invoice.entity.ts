import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Client } from '../../client/entities/client.entity';
import { Customer } from '../../customer/entities/customer.entity';
import { Inspection } from '../../inspection/entities/inspection.entity';
import { InvoiceItem } from './invoice-item.entity';
import { Task } from './../../task-management/entities/task.entity';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true }) // or 'int' if it's a number
  quickbooks_invoice_id: string;

  // Many invoices can belong to one client
  @ManyToOne(() => Client, (client) => client.invoices, { onDelete: 'CASCADE' })
  client: Client;

  // Many invoices can belong to one customer
  @ManyToOne(() => Customer, (customer) => customer.invoices, {
    onDelete: 'CASCADE',
  })
  customer: Customer;

  @OneToMany(() => Inspection, (inspection) => inspection.invoice, {
    cascade: true,
  })
  inspections: Inspection[];

  @Column({ type: 'varchar', length: 50 })
  status: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount_due: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  amount_paid: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  balance: number;

  @Column({ type: 'timestamp', nullable: true })
  due_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  paid_date: Date;

  @Column({ type: 'varchar', length: 50 })
  quickbooks_invoice_number: string;

  @Column({ type: 'varchar', nullable: true })
  quickbooks_invoice_url: string;

  @Column({ type: 'varchar', length: 50 })
  quickbooks_sync_status: string;

  @OneToMany(() => InvoiceItem, (invoiceItem) => invoiceItem.invoice, {
    cascade: true,
  })
  invoiceItems: InvoiceItem[];

  @OneToMany(() => Task, (task) => task.invoice)
  tasks: Task[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
