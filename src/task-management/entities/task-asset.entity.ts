import { Entity, PrimaryGeneratedColumn, ManyToOne, Unique } from 'typeorm';
import { Task } from './task.entity';
import { Asset } from './../../assets/entities/asset.entity';

@Entity('task_assets')
@Unique(['task', 'asset'])
export class TaskAsset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Task, { onDelete: 'CASCADE' })
  task: Task;

  @ManyToOne(() => Asset, { onDelete: 'CASCADE' })
  asset: Asset;
}