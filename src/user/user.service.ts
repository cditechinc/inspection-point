import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserSession } from './entities/user-session.entity';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { UserGroupMembership } from './../user-groups/entities/user-group-membership.entity';
import * as bcrypt from 'bcrypt';
import { CreateAssociatedUserDto } from './dto/create-associated-user.dto';
import { UpdateAssociatedUserDto } from './dto/update-associated-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserSession)
    private sessionsRepository: Repository<UserSession>,
    @InjectRepository(UserGroupMembership)
    private readonly userGroupMembershipRepository: Repository<UserGroupMembership>,
  ) {}

  async findByEmail(
    email: string,
    options?: { relations: string[] },
  ): Promise<User> {
    return this.usersRepository.findOne({ where: { email }, ...options });
  }

  async findById(
    id: string,
    options?: FindOneOptions<User>,
  ): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { id }, ...options });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async create(userDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(userDto);
    return this.usersRepository.save(user);
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    await this.usersRepository.update(id, updateData);
    return this.findById(id);
  }

  async createSession(sessionData: Partial<UserSession>): Promise<UserSession> {
    const session = this.sessionsRepository.create(sessionData);
    return this.sessionsRepository.save(session);
  }

  async saveSession(session: UserSession): Promise<UserSession> {
    return this.sessionsRepository.save(session);
  }

  async findSessionByToken(token: string): Promise<UserSession | undefined> {
    return this.sessionsRepository.findOne({
      where: { session_token: token },
      relations: ['user'],
    });
  }

  // Prevent deletion of protected users
  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    if (user.isProtectedUser) {
      throw new BadRequestException('Cannot delete a protected user');
    }
    await this.usersRepository.delete(id);
  }

  // Prevent reassignment of protected users
  async assignUserToGroup(userId: string, groupId: string): Promise<void> {
    const user = await this.findById(userId);

    // Skip protected user check if this is the initial assignment during registration
    const isNewUser =
      !user.groupMemberships || user.groupMemberships.length === 0;

    if (user.isProtectedUser && !isNewUser) {
      throw new BadRequestException('Cannot reassign a protected user');
    }

    // Logic to assign user to group
    const membership = this.userGroupMembershipRepository.create({
      user: user,
      userGroup: { id: groupId },
    });
    await this.userGroupMembershipRepository.save(membership);
  }

  async createForClientAdmin(
    createAssociatedUserDto: CreateAssociatedUserDto,
    clientId: string,
  ): Promise<User> {
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(
      createAssociatedUserDto.password,
      10,
    );

    // Create a new user entity
    const user = this.usersRepository.create({
      ...createAssociatedUserDto,
      password_hash: hashedPassword,
      role: 'client',
      client: { id: clientId }, // Associate the user with the client
    });

    // Save the new user in the database
    const newUser = await this.usersRepository.save(user);

    // Assign the user to a group if provided
    if (createAssociatedUserDto.groupId) {
      await this.assignUserToGroup(newUser.id, createAssociatedUserDto.groupId);
    }

    // Fetch the user with group memberships included
    return this.usersRepository.findOne({
      where: { id: newUser.id },
      relations: ['groupMemberships', 'groupMemberships.userGroup'], // Fetch group memberships and associated group
    });
  }

  async updateUser(userId: string, updateAssociatedUserDto: UpdateAssociatedUserDto): Promise<User> {
    // Fetch the user to ensure they exist
    const user = await this.findById(userId, { relations: ['groupMemberships', 'client'] });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Prevent updates to protected users if necessary
    if (user.isProtectedUser) {
      throw new BadRequestException('Cannot update a protected user');
    }

    // Handle group assignment if groupId is provided
    if (updateAssociatedUserDto.groupId) {
      // Remove existing group memberships
      await this.userGroupMembershipRepository.delete({ user: { id: userId } });

      // Assign new group
      await this.assignUserToGroup(userId, updateAssociatedUserDto.groupId);
    }

    // Update user properties
    Object.assign(user, updateAssociatedUserDto);

    // Save the updated user
    const updatedUser = await this.usersRepository.save(user);

    // Fetch the updated user with relations
    return await this.findById(updatedUser.id, { relations: ['groupMemberships', 'groupMemberships.userGroup'] });
  }
}
