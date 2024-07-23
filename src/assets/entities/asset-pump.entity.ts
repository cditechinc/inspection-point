import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, Index } from 'typeorm';
import { Asset } from './asset.entity';
import { Pump } from './pump.entity';

@Entity()
export class AssetPump {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Asset, asset => asset.assetPumps, { onDelete: 'CASCADE' })
  @Index()
  asset: Asset;

  @ManyToOne(() => Pump, pump => pump.assetPumps, { onDelete: 'CASCADE' })
  @Index()
  pump: Pump;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
