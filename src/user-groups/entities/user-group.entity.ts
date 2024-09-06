import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Client } from '../../client/entities/client.entity';
import { UserGroupMembership } from './user-group-membership.entity';
import { UserGroupPermission } from './user-group-permission.entity';

@Entity('user_groups')
export class UserGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ManyToOne(() => Client, (client) => client.userGroups, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: false })
  isDefaultAdminGroup: boolean;

  @OneToMany(() => UserGroupMembership, (membership) => membership.userGroup)
  memberships: UserGroupMembership[];

  @OneToMany(() => UserGroupPermission, (permission) => permission.userGroup)
  permissions: UserGroupPermission[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
