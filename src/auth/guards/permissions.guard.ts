// import { Injectable, CanActivate, ExecutionContext, ForbiddenException, forwardRef, Inject } from '@nestjs/common';
// import { AuthService } from '../auth.service'; // Assuming you have a service to fetch user data

// @Injectable()
// export class PermissionsGuard implements CanActivate {
//   constructor(
//     @Inject(forwardRef(() => AuthService))
//     private readonly authService: AuthService) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const { user, route, method } = context.switchToHttp().getRequest();

//     // Check if the user has permission to access the resource based on their group permissions
//     const hasPermission = await this.authService.checkUserPermissions(user.id, route.path, method);

//     if (!hasPermission) {
//       throw new ForbiddenException('You do not have permission to access this resource');
//     }

//     return true;
//   }
// }

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { AuthService } from '../auth.service'; // Assuming you have a service to fetch user data
import { UserGroupPermissionService } from './../../user-groups/services/user-group-permission.service';
import { UserGroupService } from './../../user-groups/services/user-group.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly userGroupPermissionService: UserGroupPermissionService,
    private readonly userGroupService: UserGroupService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { user, route, method } = request;

    // Get user groups
    const userGroups = await this.userGroupService.getUserGroups(user.id);

    // Aggregate all permissions from all groups
    const allPermissions = [];
    for (const group of userGroups) {
      const permissions = await this.userGroupPermissionService.getGroupPermissions(group.id);
      allPermissions.push(...permissions);
    }

    // Check if the user has the required permission
    const hasPermission = this.hasRequiredPermission(allPermissions, route.path, method);

    if (!hasPermission) {
      throw new ForbiddenException('You do not have permission to access this resource');
    }

    return true;
  }

  private hasRequiredPermission(permissions: any[], route: string, method: string): boolean {
    let requiredPermission = '';

    if (route.includes('customers')) {
      requiredPermission = 'manage_customers';
    } else if (route.includes('inspections')) {
      requiredPermission = 'manage_inspections';
    } else if (route.includes('invoices')) {
      requiredPermission = 'manage_invoices';
    } else if (route.includes('user-groups')) {
      requiredPermission = 'manage_groups';
    } else if (route.includes('users')) {
      requiredPermission = 'manage_users';
    } else if (route.includes('assets')) {
      requiredPermission = 'manage_assets';
    } else if (route.includes('checklist-items')) {
      requiredPermission = 'manage_checklist-items';
    } else if (route.includes('checklists')) {
      requiredPermission = 'manage_checklists';
    } else if (route.includes('permissions')) {
      requiredPermission = 'manage_permissions';
    } else if (route.includes('reports')) {
      requiredPermission = 'manage_reports';
    } else if (route.includes('pumps')) {
      requiredPermission = 'manage_pumps';
    } else if (route.includes('pump-brands')) {
      requiredPermission = 'manage_pump-brands';
    } else if (route.includes('asset-types')) {
      requiredPermission = 'manage_asset-types';
    } else if (route.includes('photos')) {
      requiredPermission = 'manage_photos';
    } else if (route.includes('inspection-scores')) {
      requiredPermission = 'manage_inspection-scores';
    } else if (route.includes('companies')) {
      requiredPermission = 'manage_companies';
    } else if (route.includes('services')) {
      requiredPermission = 'manage_services';
    } else if (route.includes('invoice-items')) {
      requiredPermission = 'manage_invoice-items';
    } else if (route.includes('checklist-templates')) {
      requiredPermission = 'manage_checklist-templates';
    } else if (route.includes('inspection-checklists')) {
      requiredPermission = 'manage_inspection-checklists';
    }
    // Add more cases as needed

    // Now check if the user has the required permission
    return permissions.some((permission) => {
      if (permission.permissionName === requiredPermission) {
        switch (method) {
          case 'GET':
            return permission.canView;
          case 'POST':
            return permission.canCreate;
          case 'PATCH':
          case 'PUT':
            return permission.canEdit;
          case 'DELETE':
            return permission.canDelete;
          default:
            return false;
        }
      }
      return false;
    });
  }
}
