import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity('user_sessions')
export class UserSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  ip_address: string;

  @Column({ nullable: true })
  ip_type: string;

  @Column({ nullable: true })
  device_type: string;

  @Column({ nullable: true })
  browser_type: string;

  @Column({ type: 'point', nullable: true })
  gps_location: string;

  @Column({ nullable: true })
  ip_location: string;

  @Column()
  session_token: string;

  @Column({ type: 'timestamp' })
  expires_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @ManyToOne(() => User, user => user.sessions, { onDelete: 'CASCADE' })
  user: User;
}
