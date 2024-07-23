import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Client } from '../../client/entities/client.entity';
import { User } from '../../user/entities/user.entity';
import { AssetType } from './asset-type.entity';
import { Photo } from './photo.entity';
import { AssetPump } from './asset-pump.entity';

@Entity()
export class Asset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Client, client => client.assets, { onDelete: 'CASCADE' })
  client: Client;

  @ManyToOne(() => User, user => user.assets, { onDelete: 'CASCADE' })
  customer: User;

  @Column()
  name: string;

  @ManyToOne(() => AssetType)
  type: AssetType;

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
  pipeDia: string;

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
  float: string;

  @Column({ nullable: true })
  pumps: string;

  @OneToMany(() => Photo, photo => photo.asset)
  photos: Photo[];

  @OneToMany(() => AssetPump, assetPump => assetPump.asset)
  assetPumps: AssetPump[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}