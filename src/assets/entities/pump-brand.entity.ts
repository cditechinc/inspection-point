import { Entity, Column, PrimaryGeneratedColumn, OneToMany, Index } from 'typeorm';
import { Pump } from './pump.entity';

@Entity()
@Index(['name'], { unique: true })
export class PumpBrand {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  model: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  website: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string;

  @Column({ type: 'boolean', nullable: true })
  madeInUsa: boolean;

  @OneToMany(() => Pump, pump => pump.brand)
  pumps: Pump[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
