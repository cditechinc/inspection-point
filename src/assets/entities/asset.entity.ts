import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Client } from '../../client/entities/client.entity';
import { User } from '../../user/entities/user.entity';
import { AssetType } from './asset-type.entity';
import { Photo } from './photo.entity';
import { AssetPump } from './asset-pump.entity';
import { Customer } from './../../customer/entities/customer.entity';
import { Inspection } from './../../inspection/entities/inspection.entity';

@Entity('assets')
export class Asset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Client, client => client.assets, { onDelete: 'CASCADE' })
  client: Client;

  @ManyToOne(() => Customer, customer => customer.assets, { onDelete: 'CASCADE' })
  customer: Customer;

  @Column()
  name: string;

  @ManyToOne(() => AssetType)
  assetType: AssetType;

  @Column({ nullable: true })
  location: string;

  @Column('decimal', { precision: 9, scale: 6, nullable: true })
  latitude: number;

  @Column('decimal', { precision: 9, scale: 6, nullable: true })
  longitude: number;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  })
  status: string;

  @Column({ nullable: true })
  inspectionInterval: string;

  @Column({ nullable: true })
  qrCode: string;

  @Column({ nullable: true })
  nfcCode: string;

  @Column({ nullable: true })
  pipeDia: number;

  @Column({ nullable: true })
  smart: string;

  @Column({ nullable: true })
  size: string;

  @Column({ nullable: true })
  material: string;

  @Column({ nullable: true })
  deleteProtect: string;

  @Column({ nullable: true })
  duty: string;

  @Column({ nullable: true })
  rails: string;

  @Column({ nullable: true })
  float: number;

  @Column({ nullable: true })
  pumps: number;

  @OneToMany(() => Photo, photo => photo.asset)
  photos: Photo[];

  @OneToMany(() => AssetPump, assetPump => assetPump.asset)
  assetPumps: AssetPump[];

  @OneToMany(() => Inspection, (inspection) => inspection.asset)
  inspections: Inspection[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}