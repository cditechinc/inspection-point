import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { UserSession } from './user-session.entity';
import { UserIP } from './user-ip.entity';
import { Logs } from './../../logs/entities/log.entity';
import { Client } from '../../client/entities/client.entity';

import { Asset } from './../../assets/entities/asset.entity';
import { Inspection } from './../../inspection/entities/inspection.entity';
import { UserGroupMembership } from './../../user-groups/entities/user-group-membership.entity';
import { Permission } from './../../permissions/entities/permission.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  username: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column()
  password_hash: string;

  @Column({ unique: true })
  email: string;

  @Column({
    type: 'varchar',
    enum: ['admin', 'client_admin', 'customer_admin', 'client', 'customer', 'employee'],
  })
  role: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @Column({ nullable: true })
  created_by: string;

  @ManyToOne(() => Client, client => client.users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @OneToMany(() => UserGroupMembership, (membership) => membership.user)
  groupMemberships: UserGroupMembership[];

  @OneToMany(() => Permission, (permission) => permission.user)
  permissions: Permission[];

  @Column({ nullable: true })
  phone: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: false })
  is_client_admin: boolean;

  @Column({ default: false })
  is_customer_admin: boolean;

  @Column({ default: false })
  isProtectedUser: boolean;

  @Column({ type: 'timestamp', nullable: true })
  last_login: Date;

  @Column({ nullable: true })
  last_login_ip: string;

  @Column({ type: 'point', nullable: true })
  last_gps_location: any;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  profile_image: string;

  @Column({ default: false })
  two_factor_enabled: boolean;

  @Column({ type: 'jsonb', nullable: true })
  two_factor_details: any;

  @Column({ nullable: true })
  two_factor_authentication_secret: string;

  @Column({ nullable: true })
  quickbooks_customer_id: string;

  @Column({ type: 'timestamp', nullable: true })
  quickbooks_sync_date: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Asset, asset => asset.customer)
  assets: Asset[];

  @OneToMany(() => UserSession, session => session.user)
  sessions: UserSession[];

  @OneToMany(() => UserIP, ip => ip.user)
  ips: UserIP[];

  @OneToMany(() => Logs, log => log.user)
  logs: Logs[];

  @OneToMany(() => Inspection, (inspection) => inspection.customer)
  customerInspections: Inspection[];

  @OneToMany(() => Inspection, (inspection) => inspection.assignedTo)
  assignedInspections: Inspection[];

}
