import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, Index } from 'typeorm';
import { Asset } from './asset.entity';

@Entity()
export class Photo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Asset, asset => asset.photos, { onDelete: 'CASCADE' })
  @Index()
  asset: Asset;

  @Column({ type: 'varchar', length: 255 })
  url: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
