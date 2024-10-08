import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, Index, JoinColumn, RelationId } from 'typeorm';
import { Asset } from './asset.entity';
import { Pump } from './pump.entity';
import { PumpBrand } from './pump-brand.entity';
import { Client } from '../../client/entities/client.entity';
import { Customer } from '../../customer/entities/customer.entity';
import { Inspection } from './../../inspection/entities/inspection.entity';
import { Expose } from 'class-transformer';

@Entity('photos')
export class Photo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  url: string;

  @ManyToOne(() => Asset, asset => asset.photos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'asset_id' })
  @Expose()
  asset: Asset;

  @RelationId((photo: Photo) => photo.asset)
  assetId?: string;

  @Column({ nullable: true })
  @Index()
  pumpId?: string;

  @ManyToOne(() => Pump, pump => pump.photos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pump_id' })
  pump: Pump;

  @Column({ nullable: true })
  @Index()
  pumpBrandId?: string;

  @ManyToOne(() => PumpBrand, pumpBrand => pumpBrand.photos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pump_brand_id' })
  pumpBrand: PumpBrand;

  @ManyToOne(() => Client, client => client.photos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @RelationId((photo: Photo) => photo.client)
  clientId: string;

  @Column({ nullable: true })
  @Index()
  customerId?: string;

  @ManyToOne(() => Customer, customer => customer.photos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ nullable: true })
  @Index()
  inspectionId?: string;

  @ManyToOne(() => Inspection, inspection => inspection.photos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inspection_id' })
  inspection: Inspection;

  @CreateDateColumn()
  createdAt: Date;
}
