import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, Index, OneToMany } from 'typeorm';
import { Asset } from './asset.entity';
import { PumpBrand } from './pump-brand.entity';
import { AssetPump } from './asset-pump.entity';

@Entity()
export class Pump {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Asset, asset => asset.pumps, { onDelete: 'CASCADE' })
  @Index()
  asset: Asset;

  @ManyToOne(() => PumpBrand, brand => brand.pumps, { onDelete: 'SET NULL' })
  @Index()
  brand: PumpBrand;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  avgAmps: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  maxAmps: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  hp: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  serial: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  warranty: string;

  @Column({ type: 'timestamp', nullable: true })
  installedDate: Date;

  @OneToMany(() => AssetPump, assetPump => assetPump.pump)
  assetPumps: AssetPump[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
