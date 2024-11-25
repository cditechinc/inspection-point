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

  @Column({ type: 'inet', nullable: true })
  ip_address: string;

  @Column({ type: 'point', nullable: true })
  gps_location: string;

  @Column({ type: 'varchar', nullable: true })
  device_type: string;

  @Column({ type: 'varchar', nullable: true })
  browser_type: string;

  @Column({ type: 'varchar', nullable: true })
  ip_location: string;

  @Column({ type: 'varchar', length: 50, default: 'INFO' })
  logLevel: string;

  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, any>;

  @ManyToOne(() => User, (user) => user.logs, { nullable: true })
  user: User;  // The user who triggered the action
}
