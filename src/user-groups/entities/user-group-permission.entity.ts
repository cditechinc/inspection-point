import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, Unique } from 'typeorm';
import { UserGroup } from './user-group.entity';

@Entity('user_group_permissions')
@Unique(['userGroup', 'permissionName'])
export class UserGroupPermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserGroup, (userGroup) => userGroup.permissions, { onDelete: 'CASCADE' })
  userGroup: UserGroup;

  @Column({ type: 'varchar', length: 255 })
  permissionName: string;

  @Column({ default: false })
  canView: boolean;

  @Column({ default: false })
  canEdit: boolean;

  @Column({ default: false })
  canCreate: boolean;

  @Column({ default: false })
  canDelete: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
