import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, Index } from 'typeorm';
import { Asset } from './asset.entity';
import { Pump } from './pump.entity';
import { PumpBrand } from './pump-brand.entity';
import { Client } from '../../client/entities/client.entity';
import { Customer } from '../../customer/entities/customer.entity';

@Entity('photos')
export class Photo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  url: string;

  @Column({ nullable: true })
  @Index()
  assetId?: string;

  @ManyToOne(() => Asset, asset => asset.photos, { onDelete: 'CASCADE' })
  asset: Asset;

  @Column({ nullable: true })
  @Index()
  pumpId?: string;

  @ManyToOne(() => Pump, pump => pump.photos, { onDelete: 'CASCADE' })
  pump: Pump;

  @Column({ nullable: true })
  @Index()
  pumpBrandId?: string;

  @ManyToOne(() => PumpBrand, pumpBrand => pumpBrand.photos, { onDelete: 'CASCADE' })
  pumpBrand: PumpBrand;

  @Column({ nullable: true })
  @Index()
  clientId?: string;

  @ManyToOne(() => Client, client => client.photos, { onDelete: 'CASCADE' })
  client: Client;

  @Column({ nullable: true })
  @Index()
  customerId?: string;

  @ManyToOne(() => Customer, customer => customer.photos, { onDelete: 'CASCADE' })
  customer: Customer;

  @CreateDateColumn()
  createdAt: Date;
}