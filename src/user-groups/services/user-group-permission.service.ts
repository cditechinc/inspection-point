// import {
//   Injectable,
//   NotFoundException,
//   BadRequestException,
//   InternalServerErrorException,
// } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { UserGroupPermission } from './../entities/user-group-permission.entity';
// import { UserGroup } from './../entities/user-group.entity';
// import { CreateUserGroupPermissionDto } from './../dto/create-user-group-permission.dto';
// import { UpdateUserGroupPermissionDto } from './../dto/update-user-group-permission.dto';
// import { AssignMultiplePermissionsDto } from '../dto/assign-multiple-permissions.dto';
// import { Resource } from './../../common/enums/resource.enum';
// import { Action } from './../../common/enums/action.enum';

// @Injectable()
// export class UserGroupPermissionService {
//   constructor(
//     @InjectRepository(UserGroupPermission)
//     private readonly userGroupPermissionRepository: Repository<UserGroupPermission>,
//     @InjectRepository(UserGroup)
//     private readonly userGroupRepository: Repository<UserGroup>,
//   ) {}

//   // async assignPermissions(
//   //   groupId: string,
//   //   assignMultiplePermissionsDto: AssignMultiplePermissionsDto,
//   // ): Promise<UserGroupPermission[]> {
//   //   const group = await this.userGroupRepository.findOne({ where: { id: groupId } });
//   //   if (!group) {
//   //     throw new NotFoundException('User group not found');
//   //   }

//   //   const { permissions } = assignMultiplePermissionsDto;

//   //   // Start transaction
//   //   const queryRunner = this.userGroupPermissionRepository.manager.connection.createQueryRunner();
//   //   await queryRunner.startTransaction();

//   //   try {
//   //     // Step 1: Delete all existing permissions for the group
//   //     const deleteResult = await queryRunner.manager.delete(UserGroupPermission, { userGroup: group });
//   //     console.log('Deleted permissions result:', deleteResult);

//   //     // Step 2: Prepare and save new permissions from the request
//   //     const permissionsToSave: UserGroupPermission[] = [];

//   //     for (const permissionDto of permissions) {
//   //       const { resource, actions } = permissionDto;

//   //       for (const action of actions) {
//   //         const permissionName = `${resource}_${action}`;

//   //         const newPermission = this.userGroupPermissionRepository.create({
//   //           userGroup: group,
//   //           permissionName,
//   //           canView: action === 'view',
//   //           canEdit: action === 'edit',
//   //           canCreate: action === 'create',
//   //           canDelete: action === 'delete',
//   //         });

//   //         permissionsToSave.push(newPermission);
//   //       }
//   //     }

//   //     console.log('Permissions to save:', permissionsToSave);

//   //     if (permissionsToSave.length > 0) {
//   //       await queryRunner.manager.save(UserGroupPermission, permissionsToSave);
//   //     }

//   //     // Commit transaction
//   //     await queryRunner.commitTransaction();

//   //     // Return all the saved permissions for the group
//   //     const savedPermissions = await this.getGroupPermissions(groupId);
//   //     console.log('Saved permissions:', savedPermissions);
//   //     return savedPermissions;
//   //   } catch (error) {
//   //     // Rollback transaction on error
//   //     await queryRunner.rollbackTransaction();
//   //     console.error('Transaction error:', error);
//   //     throw new InternalServerErrorException('Failed to assign permissions');
//   //   } finally {
//   //     // Release transaction
//   //     await queryRunner.release();
//   //   }
//   // }

//   async assignPermissions(
//     groupId: string,
//     assignMultiplePermissionsDto: AssignMultiplePermissionsDto,
//     isClientAdminOnboarding: boolean = false,
//   ): Promise<UserGroupPermission[]> {
//     try {
//       const group = await this.userGroupRepository.findOne({
//         where: { id: groupId },
//       });
//       if (!group) {
//         throw new NotFoundException(`User group with ID ${groupId} not found`);
//       }
  
//       const { permissions } = assignMultiplePermissionsDto;
//       const permissionsToSave: UserGroupPermission[] = [];
  
//       if (isClientAdminOnboarding) {
//         const resources = Object.values(Resource);
//         const actions = Object.values(Action);
  
//         resources.forEach((resource) => {
//           const permission = {
//             userGroup: group,
//             permissionName: `manage_${resource}`,  // Single permission object for the resource
//             canView: false,
//             canEdit: false,
//             canCreate: false,
//             canDelete: false,
//           };
  
//           actions.forEach((action) => {
//             switch (action) {
//               case Action.VIEW:
//                 permission.canView = true;
//                 break;
//               case Action.EDIT:
//                 permission.canEdit = true;
//                 break;
//               case Action.CREATE:
//                 permission.canCreate = true;
//                 break;
//               case Action.DELETE:
//                 permission.canDelete = true;
//                 break;
//             }
//           });
  
//           permissionsToSave.push(this.userGroupPermissionRepository.create(permission));
//         });
//       } else {
//         for (const permissionDto of permissions) {
//           const { resource, actions } = permissionDto;
  
//           if (!Array.isArray(actions)) {
//             throw new BadRequestException(`Actions should be an array for resource: ${resource}`);
//           }
  
//           const permission = {
//             userGroup: group,
//             permissionName: `manage_${resource}`,  // Single permission object for the resource
//             canView: false,
//             canEdit: false,
//             canCreate: false,
//             canDelete: false,
//           };
  
//           actions.forEach((action) => {
//             switch (action) {
//               case Action.VIEW:
//                 permission.canView = true;
//                 break;
//               case Action.EDIT:
//                 permission.canEdit = true;
//                 break;
//               case Action.CREATE:
//                 permission.canCreate = true;
//                 break;
//               case Action.DELETE:
//                 permission.canDelete = true;
//                 break;
//             }
//           });
  
//           permissionsToSave.push(this.userGroupPermissionRepository.create(permission));
//         }
//       }
  
//       if (permissionsToSave.length > 0) {
//         await this.userGroupPermissionRepository.save(permissionsToSave);
//       }
  
//       return this.getGroupPermissions(groupId);
//     } catch (error) {
//       console.error('Error assigning permissions:', error.message);
//       if (error instanceof BadRequestException || error instanceof NotFoundException) {
//         throw error;
//       }
//       throw new InternalServerErrorException('Failed to assign permissions');
//     }
//   }
  
//   async assignCustomPermissions(
//     groupId: string,
//     assignMultiplePermissionsDto: AssignMultiplePermissionsDto,
//   ): Promise<UserGroupPermission[]> {
//     try {
//       const group = await this.userGroupRepository.findOne({
//         where: { id: groupId },
//       });
  
//       if (!group) {
//         throw new NotFoundException(`User group with ID ${groupId} not found`);
//       }
  
//       const { permissions } = assignMultiplePermissionsDto;
//       const permissionsToSave: UserGroupPermission[] = [];
  
//       if (!Array.isArray(permissions)) {
//         throw new BadRequestException('Permissions must be an array');
//       }
  
//       for (const permissionDto of permissions) {
//         const { resource, actions } = permissionDto;
  
//         if (!Array.isArray(actions)) {
//           throw new BadRequestException(`Actions should be an array for resource: ${resource}`);
//         }
  
//         const permission = {
//           userGroup: group,
//           permissionName: `manage_${resource}`,  // Single permission object for the resource
//           canView: false,
//           canEdit: false,
//           canCreate: false,
//           canDelete: false,
//         };
  
//         actions.forEach((action) => {
//           switch (action) {
//             case Action.VIEW:
//               permission.canView = true;
//               break;
//             case Action.EDIT:
//               permission.canEdit = true;
//               break;
//             case Action.CREATE:
//               permission.canCreate = true;
//               break;
//             case Action.DELETE:
//               permission.canDelete = true;
//               break;
//           }
//         });
  
//         const existingPermission = await this.userGroupPermissionRepository.findOne({
//           where: { userGroup: group, permissionName: permission.permissionName },
//         });
  
//         if (!existingPermission) {
//           permissionsToSave.push(this.userGroupPermissionRepository.create(permission));
//         } else {
//           // Update existing permission with new actions
//           existingPermission.canView = existingPermission.canView || permission.canView;
//           existingPermission.canEdit = existingPermission.canEdit || permission.canEdit;
//           existingPermission.canCreate = existingPermission.canCreate || permission.canCreate;
//           existingPermission.canDelete = existingPermission.canDelete || permission.canDelete;
  
//           await this.userGroupPermissionRepository.save(existingPermission);
//         }
//       }
  
//       if (permissionsToSave.length > 0) {
//         await this.userGroupPermissionRepository.save(permissionsToSave);
//       }
  
//       return this.getGroupPermissions(groupId);
//     } catch (error) {
//       console.error('Error assigning custom permissions:', error.message);
//       if (error instanceof BadRequestException || error instanceof NotFoundException) {
//         throw error;
//       }
//       throw new InternalServerErrorException('Failed to assign custom permissions');
//     }
//   }
  
//   async getGroupPermissions(groupId: string): Promise<any> {
//     try {
//       const group = await this.userGroupRepository.findOne({
//         where: { id: groupId },
//         relations: ['permissions'],
//       });
  
//       if (!group) {
//         throw new NotFoundException(`User group with ID ${groupId} not found`);
//       }
  
//       const permissions = await this.userGroupPermissionRepository.find({
//         where: { userGroup: { id: groupId } },
//       });
  
//       // Modify the response format as needed
//       const formattedPermissions = permissions.map((permission) => {
//         const resourceMap = {
//           users_view: 'manage_users',
//           users_edit: 'manage_users',
//           users_create: 'manage_users',
//           users_delete: 'manage_users',
//           customers_view: 'manage_customers',
//           customers_edit: 'manage_customers',
//           customers_create: 'manage_customers',
//           customers_delete: 'manage_customers',
//           inspections_view: 'manage_inspections',
//           inspections_edit: 'manage_inspections',
//           inspections_create: 'manage_inspections',
//           inspections_delete: 'manage_inspections',
//           // Add other mappings if needed
//         };
  
//         return {
//           id: permission.id,
//           permissionName: resourceMap[permission.permissionName] || permission.permissionName,
//           canView: permission.canView,
//           canEdit: permission.canEdit,
//           canCreate: permission.canCreate,
//           canDelete: permission.canDelete,
//           createdAt: permission.createdAt,
//           updatedAt: permission.updatedAt,
//         };
//       });
  
//       return formattedPermissions;
//     } catch (error) {
//       console.error('Error fetching group permissions:', error.message);
//       throw new InternalServerErrorException('Failed to fetch group permissions');
//     }
//   }

//   async updatePermissions(
//     id: string,
//     updatePermissionDto: UpdateUserGroupPermissionDto,
//   ): Promise<UserGroupPermission> {
//     const permission = await this.userGroupPermissionRepository.findOne({
//       where: { id },
//     });
  
//     if (!permission) {
//       throw new NotFoundException('Permission not found');
//     }
  
//     const { resource, actions } = updatePermissionDto;
  
//     if (!Array.isArray(actions)) {
//       throw new BadRequestException('Actions should be an array');
//     }
  
//     // Ensure we are updating the specific resource's permissions
//     if (permission.permissionName !== `manage_${resource}`) {
//       throw new BadRequestException(`Permission does not match the resource: ${resource}`);
//     }
  
//     // Update the permission actions based on what's provided in the request
//     actions.forEach((action) => {
//       switch (action) {
//         case Action.VIEW:
//           permission.canView = true;
//           break;
//         case Action.EDIT:
//           permission.canEdit = true;
//           break;
//         case Action.CREATE:
//           permission.canCreate = true;
//           break;
//         case Action.DELETE:
//           permission.canDelete = true;
//           break;
//         default:
//           throw new BadRequestException(`Invalid action: ${action}`);
//       }
//     });
  
//     return await this.userGroupPermissionRepository.save(permission);
//   }
  
// }


// src/user-groups/services/user-group-permission.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { UserGroupPermission } from './../entities/user-group-permission.entity';
import { UserGroup } from './../entities/user-group.entity';
import { AssignMultiplePermissionsDto } from '../dto/assign-multiple-permissions.dto';
import { AssignPermissionsDto } from '../dto/assign-permissions.dto';
import { Resource } from './../../common/enums/resource.enum';
import { Action } from './../../common/enums/action.enum';
import { UpdateUserGroupPermissionDto } from '../dto/update-user-group-permission.dto';

@Injectable()
export class UserGroupPermissionService {
  constructor(
    @InjectRepository(UserGroupPermission)
    private readonly userGroupPermissionRepository: Repository<UserGroupPermission>,
    @InjectRepository(UserGroup)
    private readonly userGroupRepository: Repository<UserGroup>,
  ) {}

  // async assignPermissions(
  //   groupId: string,
  //   assignMultiplePermissionsDto: AssignMultiplePermissionsDto,
  //   isClientAdminOnboarding: boolean = false,
  // ): Promise<UserGroupPermission[]> {
  //   const group = await this.userGroupRepository.findOne({ where: { id: groupId } });
  //   if (!group) {
  //     throw new NotFoundException('User group not found');
  //   }

  //   await this.preparePermissions(
  //     assignMultiplePermissionsDto,
  //     group,
  //     isClientAdminOnboarding,
  //   );

  //   return this.getGroupPermissions(groupId);
  // }

  async assignPermissions(
    groupId: string,
    assignMultiplePermissionsDto: AssignMultiplePermissionsDto,
    isClientAdminOnboarding: boolean = false,
    manager?: EntityManager,
  ): Promise<UserGroupPermission[]> {
    // Use the provided manager or default to the repository
    const userGroupRepository = manager
      ? manager.getRepository(UserGroup)
      : this.userGroupRepository;
  
    const group = await userGroupRepository.findOne({ where: { id: groupId } });
    if (!group) {
      throw new NotFoundException('User group not found');
    }
  
    await this.preparePermissions(
      assignMultiplePermissionsDto,
      group,
      isClientAdminOnboarding,
      manager,
    );
  
    return this.getGroupPermissions(groupId, manager);
  }

  async assignCustomPermissions(
    groupId: string,
    assignMultiplePermissionsDto: AssignMultiplePermissionsDto,
  ): Promise<UserGroupPermission[]> {
    const group = await this.userGroupRepository.findOne({ where: { id: groupId } });
    if (!group) {
      throw new NotFoundException('User group not found');
    }

    await this.preparePermissions(assignMultiplePermissionsDto, group);

    return this.getGroupPermissions(groupId);
  }

  private async preparePermissions(
    assignMultiplePermissionsDto: AssignMultiplePermissionsDto,
    group: UserGroup,
    isClientAdminOnboarding: boolean = false,
    manager?: EntityManager,
  ): Promise<void> {
    let permissionsList: AssignPermissionsDto[] = [];
  
    if (isClientAdminOnboarding) {
      // Handle client admin onboarding with all permissions
      const resources = Object.values(Resource);
      const actions = Object.values(Action);
  
      permissionsList = resources.map((resource) => ({
        resource,
        actions,
      }));
    } else {
      // Handle single or multiple permissions
      if (assignMultiplePermissionsDto.permission) {
        permissionsList.push(assignMultiplePermissionsDto.permission);
      } else if (assignMultiplePermissionsDto.permissions) {
        permissionsList = assignMultiplePermissionsDto.permissions;
      } else {
        throw new BadRequestException('No permissions provided');
      }
    }
  
    // Use the provided manager or default to the repository
    const userGroupPermissionRepository = manager
      ? manager.getRepository(UserGroupPermission)
      : this.userGroupPermissionRepository;
  
    for (const permissionDto of permissionsList) {
      const { resource, actions } = permissionDto;
  
      if (!Array.isArray(actions)) {
        throw new BadRequestException(`Actions should be an array for resource: ${resource}`);
      }
  
      const permissionName = `manage_${resource}`;
  
      // Find existing permission using userGroup.id
      let existingPermission = await userGroupPermissionRepository.findOne({
        where: { userGroup: { id: group.id }, permissionName },
      });
  
      if (existingPermission) {
        // Update existing permission
        let updated = false;
        actions.forEach((action) => {
          switch (action) {
            case Action.VIEW:
              if (!existingPermission.canView) {
                existingPermission.canView = true;
                updated = true;
              }
              break;
            case Action.EDIT:
              if (!existingPermission.canEdit) {
                existingPermission.canEdit = true;
                updated = true;
              }
              break;
            case Action.CREATE:
              if (!existingPermission.canCreate) {
                existingPermission.canCreate = true;
                updated = true;
              }
              break;
            case Action.DELETE:
              if (!existingPermission.canDelete) {
                existingPermission.canDelete = true;
                updated = true;
              }
              break;
          }
        });
  
        if (updated) {
          // Save the updated permission
          await userGroupPermissionRepository.save(existingPermission);
        }
        // Else, no changes needed
      } else {
        // Create new permission
        const newPermission = userGroupPermissionRepository.create({
          userGroup: group,
          permissionName,
          canView: actions.includes(Action.VIEW),
          canEdit: actions.includes(Action.EDIT),
          canCreate: actions.includes(Action.CREATE),
          canDelete: actions.includes(Action.DELETE),
        });
        await userGroupPermissionRepository.save(newPermission);
      }
    }
  }

  async getGroupPermissions(
    groupId: string,
    manager?: EntityManager,
  ): Promise<UserGroupPermission[]> {
    // Use the provided manager or default to the repository
    const userGroupRepository = manager
      ? manager.getRepository(UserGroup)
      : this.userGroupRepository;
  
    const userGroupPermissionRepository = manager
      ? manager.getRepository(UserGroupPermission)
      : this.userGroupPermissionRepository;
  
    const group = await userGroupRepository.findOne({
      where: { id: groupId },
      relations: ['permissions'],
    });
  
    if (!group) {
      throw new NotFoundException(`User group with ID ${groupId} not found`);
    }
  
    const permissions = await userGroupPermissionRepository.find({
      where: { userGroup: { id: groupId } },
    });
  
    return permissions;
  }

  async updatePermissions(
    id: string,
    updatePermissionDto: UpdateUserGroupPermissionDto,
  ): Promise<UserGroupPermission> {
    const permission = await this.userGroupPermissionRepository.findOne({
      where: { id },
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    const { resource, actions } = updatePermissionDto;

    if (!Array.isArray(actions)) {
      throw new BadRequestException('Actions should be an array');
    }

    // Ensure we are updating the specific resource's permissions
    if (permission.permissionName !== `manage_${resource}`) {
      throw new BadRequestException(`Permission does not match the resource: ${resource}`);
    }

    // Update the permission actions based on what's provided in the request
    actions.forEach((action) => {
      switch (action) {
        case Action.VIEW:
          permission.canView = true;
          break;
        case Action.EDIT:
          permission.canEdit = true;
          break;
        case Action.CREATE:
          permission.canCreate = true;
          break;
        case Action.DELETE:
          permission.canDelete = true;
          break;
        default:
          throw new BadRequestException(`Invalid action: ${action}`);
      }
    });

    return await this.userGroupPermissionRepository.save(permission);
  }
}

