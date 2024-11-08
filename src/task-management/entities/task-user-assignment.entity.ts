import { Entity, PrimaryGeneratedColumn, ManyToOne, Unique } from 'typeorm';
import { Task } from './task.entity';
import { User } from './../../user/entities/user.entity';

@Entity('task_user_assignments')
@Unique(['task', 'user'])
export class TaskUserAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Task, { onDelete: 'CASCADE' })
  task: Task;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;
}