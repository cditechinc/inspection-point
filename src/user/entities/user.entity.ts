import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne } from 'typeorm';
import { UserSession } from './user-session.entity';
import { UserIP } from './user-ip.entity';
import { Log } from './log.entity';
import { Client } from '../../client/entities/client.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password_hash: string;

  @Column({ unique: true })
  email: string;

  @Column()
  role: string;

  @Column({ nullable: true })
  created_by: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: false })
  is_client_admin: boolean;

  @Column({ default: false })
  is_customer_admin: boolean;

  @Column({ type: 'timestamp', nullable: true })
  last_login: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @Column({ nullable: true })
  two_factor_authentication_secret: string;

  @Column({ nullable: true })
  quickbooks_customer_id: string;

  @Column({ nullable: true })
  quickbooks_sync_date: Date;

  @ManyToOne(() => Client, client => client.users, { onDelete: 'CASCADE' })
  client: Client;

  @OneToMany(() => UserSession, session => session.user)
  sessions: UserSession[];

  @OneToMany(() => UserIP, ip => ip.user)
  ips: UserIP[];

  @OneToMany(() => Log, log => log.user)
  logs: Log[];
}

