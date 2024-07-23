import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Client } from '../../client/entities/client.entity';
import { Photo } from './../../assets/entities/photo.entity';

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

  @ManyToOne(() => Client, client => client.customers, { onDelete: 'CASCADE' })
  client: Client;

  @OneToMany(() => Photo, photo => photo.customer)
  photos: Photo[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
