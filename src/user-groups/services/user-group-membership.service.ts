import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserGroupMembership } from './../entities/user-group-membership.entity';
import { UserGroup } from './../entities/user-group.entity';
import { User } from './../../user/entities/user.entity';

@Injectable()
export class UserGroupMembershipService {
  constructor(
    @InjectRepository(UserGroupMembership)
    private readonly userGroupMembershipRepository: Repository<UserGroupMembership>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserGroup)
    private readonly userGroupRepository: Repository<UserGroup>
  ) {}

  // Add a user to a group
  async addUserToGroup(userId: string, groupId: string): Promise<UserGroupMembership> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const group = await this.userGroupRepository.findOne({ where: { id: groupId } });

    if (!user || !group) {
      throw new BadRequestException('User or Group not found');
    }

    const membership = this.userGroupMembershipRepository.create({ user, userGroup: group });
    return await this.userGroupMembershipRepository.save(membership);
  }

  // Remove a user from a group
  async removeUserFromGroup(userId: string, groupId: string): Promise<void> {
    const membership = await this.userGroupMembershipRepository.findOne({
      where: { user: { id: userId }, userGroup: { id: groupId } },
    });

    if (!membership) {
      throw new BadRequestException('User not assigned to the group');
    }

    await this.userGroupMembershipRepository.delete(membership.id);
  }
}
