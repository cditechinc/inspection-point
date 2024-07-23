// src/assets/entities/asset.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index, OneToMany } from 'typeorm';
import { Client } from '../../client/entities/client.entity';
import { User } from '../../user/entities/user.entity';
import { Photo } from './photo.entity';
import { Pump } from './pump.entity';
import { AssetType } from './asset-type.entity';
import { AssetPump } from './asset-pump.entity';

@Entity()
export class Asset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Client, client => client.assets, { onDelete: 'CASCADE' })
  @Index()
  client: Client;

  @ManyToOne(() => User, user => user.assets, { onDelete: 'CASCADE' })
  @Index()
  customer: User;

  @Column()
  name: string;

  @ManyToOne(() => AssetType, { nullable: true })
  @Index()
  type: AssetType;

  @Column({ nullable: true })
  location: string;

  @Column('decimal', { nullable: true })
  latitude: number;

  @Column('decimal', { nullable: true })
  longitude: number;

  @Column('text', { nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active',
  })
  status: string;

  @Column({ nullable: true })
  inspectionInterval: string;

  @Column({ nullable: true })
  qrCode: string;

  @Column({ nullable: true })
  nfcCode: string;

  @OneToMany(() => Photo, photo => photo.asset)
  photos: Photo[];

  @OneToMany(() => Pump, pump => pump.asset)
  pumps: Pump[];

  @OneToMany(() => AssetPump, assetPump => assetPump.asset)
  assetPumps: AssetPump[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
