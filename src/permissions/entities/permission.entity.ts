import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.permissions, { onDelete: 'CASCADE' })
  user: User;

  @Column({ default: false })
  canCreateUser: boolean;

  @Column({ default: false })
  canEditUser: boolean;

  @Column({ default: false })
  canDeleteUser: boolean;

  @Column({ default: false })
  canCreateAsset: boolean;

  @Column({ default: false })
  canEditAsset: boolean;

  @Column({ default: false })
  canDeleteAsset: boolean;

  @Column({ default: false })
  canCreateInspection: boolean;

  @Column({ default: false })
  canEditInspection: boolean;

  @Column({ default: false })
  canDeleteInspection: boolean;

  @Column({ default: false })
  canCreateCustomer: boolean;

  @Column({ default: false })
  canEditCustomer: boolean;

  @Column({ default: false })
  canDeleteCustomer: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
