// // import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
// // import { Reflector } from '@nestjs/core';
// // import { ROLES_KEY } from '../decorators/roles.decorator';
// // import { Role } from '../role.enum';
// // import { AuthService } from '../auth.service'; // Inject authService for permission checks

// // @Injectable()
// // export class RolesGuard implements CanActivate {
// //   constructor(
// //     private readonly reflector: Reflector,
// //     @Inject(forwardRef(() => AuthService))
// //     private readonly authService: AuthService, // Inject AuthService to access user permissions
// //   ) {}

// //   async canActivate(context: ExecutionContext): Promise<boolean> {
// //     const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
// //       context.getHandler(),
// //       context.getClass(),
// //     ]);

// //     if (!requiredRoles) {
// //       return true;
// //     }

// //     const { user, route, method } = context.switchToHttp().getRequest();

// //     // Check if the user has the required role
// //     // const hasRole = requiredRoles.some((role) => user.role === role);

// //     const hasRole = requiredRoles.some((role) => user.roles?.includes(role));

// //     if (!hasRole) {
// //       throw new ForbiddenException('You do not have the required role to access this resource');
// //     }

// //     // Check if the user has the required permission for the resource/action
// //     const hasPermission = await this.authService.checkUserPermissions(user.id, route.path, method);

// //     if (!hasPermission) {
// //       throw new ForbiddenException('You do not have permission to access this resource');
// //     }

// //     return true;
// //   }
// // }

// import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { ROLES_KEY } from '../decorators/roles.decorator';
// import { Role } from '../role.enum';
// import { AuthService } from '../auth.service'; // Inject authService for permission checks

// @Injectable()
// export class RolesGuard implements CanActivate {
//   constructor(
//     private readonly reflector: Reflector,
//     @Inject(forwardRef(() => AuthService))
//     private readonly authService: AuthService,
//   ) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
//       context.getHandler(),
//       context.getClass(),
//     ]);

//     if (!requiredRoles) {
//       return true;
//     }

//     const { user } = context.switchToHttp().getRequest();

//     console.log('User Role:', user.role);  // Log user role
//     console.log('Required Roles:', requiredRoles);  // Log required roles

//     // Check if the user has the required role
//     const hasRole = requiredRoles.some((role) => user.role === role);

//     if (!hasRole) {
//       throw new ForbiddenException('You do not have the required role to access this resource');
//     }

//     return true;
//   }
// }

import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../role.enum';
import { AuthService } from '../auth.service'; // Inject authService for permission checks
import { UserGroupPermissionService } from './../../user-groups/services/user-group-permission.service';
import { UserGroupService } from './../../user-groups/services/user-group.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    // @Inject(forwardRef(() => AuthService))
    // private readonly authService: AuthService,
    private readonly userGroupPermissionService: UserGroupPermissionService,
    private readonly userGroupService: UserGroupService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const { user, route, method } = context.switchToHttp().getRequest();

    console.log('User Role:', user.role); // Log user role
    console.log('Required Roles:', requiredRoles); // Log required roles

    // Check if the user has the required role
    const hasRole = requiredRoles.some((role) => user.role === role);
    
    if (!hasRole) {
      throw new ForbiddenException('You do not have the required role to access this resource');
    }

    // If the user has the required role, check the permissions
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
    } else if (route.includes('clients')) {
      requiredPermission = 'manage_clients';
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
