import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('logs')
export class Logs {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, nullable: true, default: 'Unknown Actions' })
  action: string;  

  @CreateDateColumn()
  timestamp: Date;  

  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, any>;  

  @Column({ type: 'varchar', length: 50, default: 'INFO' })
  logLevel: string;  // For distinguishing between INFO, WARN, ERROR logs

  @ManyToOne(() => User, (user) => user.logs)
  user: User;  // The user who triggered the action
}
