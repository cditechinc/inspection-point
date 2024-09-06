import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  // Assign permissions to a user
  async assignPermissions(userId: string, createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const permission = this.permissionRepository.create({
      ...createPermissionDto,
      user,
    });

    return await this.permissionRepository.save(permission);
  }

  // Get all permissions for a user
  async getUserPermissions(userId: string): Promise<Permission[]> {
    return await this.permissionRepository.find({ where: { user: { id: userId } } });
  }

  // Update permissions for a user
  async updatePermissions(id: string, updatePermissionDto: UpdatePermissionDto): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({ where: { id } });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    Object.assign(permission, updatePermissionDto);
    return await this.permissionRepository.save(permission);
  }
}
