import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserGroup } from './../entities/user-group.entity';
import { CreateUserGroupDto } from './../dto/create-user-group.dto';
import { UpdateUserGroupDto } from './../dto/update-user-group.dto';
import { User } from './../../user/entities/user.entity';
import { UserGroupMembership } from './../entities/user-group-membership.entity';

@Injectable()
export class UserGroupService {
  constructor(
    @InjectRepository(UserGroup)
    private readonly userGroupRepository: Repository<UserGroup>,
    @InjectRepository(UserGroupMembership)
    private readonly userGroupMembershipRepository: Repository<UserGroupMembership>
  ) {}

  // Create a new user group
  async create(clientId: string, createUserGroupDto: CreateUserGroupDto): Promise<UserGroup> {
    const group = this.userGroupRepository.create({ ...createUserGroupDto, client: { id: clientId } });
    return await this.userGroupRepository.save(group);
  }

   // Fetch all groups a user belongs to
   async getUserGroups(userId: string): Promise<UserGroup[]> {
    const memberships = await this.userGroupMembershipRepository.find({
      where: { user: { id: userId } },
      relations: ['userGroup'], // Eager load the userGroup
    });

    // Return only the user groups
    return memberships.map((membership) => membership.userGroup);
  }

  // Get all user groups for a client
  async findAll(clientId: string): Promise<UserGroup[]> {
    return await this.userGroupRepository.find({
      where: { client: { id: clientId } },
      relations: ['permissions'],
    });
  }

  // Get a specific user group
  async findOne(id: string): Promise<UserGroup> {
    const group = await this.userGroupRepository.findOne({
      where: { id },
      relations: ['permissions', 'memberships'],
    });
    if (!group) {
      throw new NotFoundException('User group not found');
    }
    return group;
  }

  // Update a user group
  async update(id: string, updateUserGroupDto: UpdateUserGroupDto): Promise<UserGroup> {
    const group = await this.findOne(id);
    if (group.isDefaultAdminGroup) {
      throw new BadRequestException('Cannot update the default admin group');
    }

    Object.assign(group, updateUserGroupDto);
    return await this.userGroupRepository.save(group);
  }

  // Delete a user group
  async remove(id: string): Promise<void> {
    const group = await this.findOne(id);
    if (group.isDefaultAdminGroup) {
      throw new BadRequestException('Cannot delete the default admin group');
    }

    // Check if any users are assigned to the group
    const users = await this.userGroupMembershipRepository.find({
      where: { userGroup: { id } },
    });

    if (users.length > 0) {
      throw new BadRequestException('Cannot delete a user group with assigned users');
    }

    await this.userGroupRepository.delete(id);
  }
}
