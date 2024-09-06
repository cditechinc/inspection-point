import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserGroupPermission } from './../entities/user-group-permission.entity';
import { UserGroup } from './../entities/user-group.entity';
import { CreateUserGroupPermissionDto } from './../dto/create-user-group-permission.dto';
import { UpdateUserGroupPermissionDto } from './../dto/update-user-group-permission.dto';

@Injectable()
export class UserGroupPermissionService {
  constructor(
    @InjectRepository(UserGroupPermission)
    private readonly userGroupPermissionRepository: Repository<UserGroupPermission>,
    @InjectRepository(UserGroup)
    private readonly userGroupRepository: Repository<UserGroup>
  ) {}

  // Assign permissions to a group
  async assignPermissions(groupId: string, createPermissionDto: CreateUserGroupPermissionDto): Promise<UserGroupPermission> {
    const group = await this.userGroupRepository.findOne({ where: { id: groupId } });
    if (!group) {
      throw new NotFoundException('User group not found');
    }

    const permission = this.userGroupPermissionRepository.create({
      ...createPermissionDto,
      userGroup: group,
    });

    return await this.userGroupPermissionRepository.save(permission);
  }

  // Get all permissions for a group
  async getGroupPermissions(groupId: string): Promise<UserGroupPermission[]> {
    return await this.userGroupPermissionRepository.find({ where: { userGroup: { id: groupId } } });
  }

  // Update permissions for a group
  async updatePermissions(id: string, updatePermissionDto: UpdateUserGroupPermissionDto): Promise<UserGroupPermission> {
    const permission = await this.userGroupPermissionRepository.findOne({ where: { id } });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    Object.assign(permission, updatePermissionDto);
    return await this.userGroupPermissionRepository.save(permission);
  }
}
