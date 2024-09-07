import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserGroupPermission } from './../entities/user-group-permission.entity';
import { UserGroup } from './../entities/user-group.entity';
import { CreateUserGroupPermissionDto } from './../dto/create-user-group-permission.dto';
import { UpdateUserGroupPermissionDto } from './../dto/update-user-group-permission.dto';
import { AssignMultiplePermissionsDto } from '../dto/assign-multiple-permissions.dto';

@Injectable()
export class UserGroupPermissionService {
  constructor(
    @InjectRepository(UserGroupPermission)
    private readonly userGroupPermissionRepository: Repository<UserGroupPermission>,
    @InjectRepository(UserGroup)
    private readonly userGroupRepository: Repository<UserGroup>
  ) {}

  async assignPermissions(
    groupId: string,
    assignMultiplePermissionsDto: AssignMultiplePermissionsDto,
  ): Promise<UserGroupPermission[]> {
    const group = await this.userGroupRepository.findOne({ where: { id: groupId } });
    if (!group) {
      throw new NotFoundException('User group not found');
    }
  
    const { permissions } = assignMultiplePermissionsDto;
  
    // Start transaction
    const queryRunner = this.userGroupPermissionRepository.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();
  
    try {
      // Step 1: Delete all existing permissions for the group
      const deleteResult = await queryRunner.manager.delete(UserGroupPermission, { userGroup: group });
      console.log('Deleted permissions result:', deleteResult);
  
      // Step 2: Prepare and save new permissions from the request
      const permissionsToSave: UserGroupPermission[] = [];
  
      for (const permissionDto of permissions) {
        const { resource, actions } = permissionDto;
  
        for (const action of actions) {
          const permissionName = `${resource}_${action}`;
  
          const newPermission = this.userGroupPermissionRepository.create({
            userGroup: group,
            permissionName,
            canView: action === 'view',
            canEdit: action === 'edit',
            canCreate: action === 'create',
            canDelete: action === 'delete',
          });
  
          permissionsToSave.push(newPermission);
        }
      }
  
      console.log('Permissions to save:', permissionsToSave);
  
      if (permissionsToSave.length > 0) {
        await queryRunner.manager.save(UserGroupPermission, permissionsToSave);
      }
  
      // Commit transaction
      await queryRunner.commitTransaction();
  
      // Return all the saved permissions for the group
      const savedPermissions = await this.getGroupPermissions(groupId);
      console.log('Saved permissions:', savedPermissions);
      return savedPermissions;
    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      console.error('Transaction error:', error);
      throw new InternalServerErrorException('Failed to assign permissions');
    } finally {
      // Release transaction
      await queryRunner.release();
    }
  }
  
  
  


  async getGroupPermissions(groupId: string): Promise<UserGroupPermission[]> {
    const group = await this.userGroupRepository.findOne({ where: { id: groupId } });
    if (!group) {
      throw new NotFoundException('User group not found');
    }

    return await this.userGroupPermissionRepository.find({
      where: { userGroup: { id: groupId } },
    });
  }

  async updatePermissions(
    id: string,
    updatePermissionDto: UpdateUserGroupPermissionDto,
  ): Promise<UserGroupPermission> {
    const permission = await this.userGroupPermissionRepository.findOne({ where: { id } });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    Object.assign(permission, updatePermissionDto);
    return await this.userGroupPermissionRepository.save(permission);
  }
}
