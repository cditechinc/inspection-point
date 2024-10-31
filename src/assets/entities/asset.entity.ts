import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Client } from '../../client/entities/client.entity';
import { User } from '../../user/entities/user.entity';
import { AssetType } from './asset-type.entity';
import { Photo } from './photo.entity';
import { AssetPump } from './asset-pump.entity';
import { Customer } from './../../customer/entities/customer.entity';
import { Inspection } from './../../inspection/entities/inspection.entity';
import { Expose, Type } from 'class-transformer';

@Entity('assets')
export class Asset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Client, (client) => client.assets, { onDelete: 'CASCADE' })
  client: Client;

  @ManyToOne(() => Customer, (customer) => customer.assets, {
    onDelete: 'CASCADE',
  })
  customer: Customer;

  @Column()
  name: string;

  @ManyToOne(() => AssetType)
  assetType: AssetType;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active',
  })
  status: string;

  @Column({ type: 'jsonb', nullable: true })
  properties: Record<string, any>;
 
  @Expose()
  @OneToMany(() => Photo, (photo) => photo.asset)
  @Type(() => Photo)
  photos: Photo[];

  @OneToMany(() => AssetPump, (assetPump) => assetPump.asset)
  assetPumps: AssetPump[];

  @OneToMany(() => Inspection, (inspection) => inspection.asset)
  inspections: Inspection[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
