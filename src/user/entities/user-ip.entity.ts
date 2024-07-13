import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity('user_ips')
export class UserIP {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  ip_address: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @ManyToOne(() => User, user => user.ips, { onDelete: 'CASCADE' })
  user: User;
}
