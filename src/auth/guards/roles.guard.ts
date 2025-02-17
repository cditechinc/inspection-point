import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../role.enum';
import { UserGroupPermissionService } from './../../user-groups/services/user-group-permission.service';
import { UserGroupService } from './../../user-groups/services/user-group.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userGroupPermissionService: UserGroupPermissionService,
    private readonly userGroupService: UserGroupService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get required roles from metadata.
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Extract the request, including the user and route information.
    const request = context.switchToHttp().getRequest();
    const { user, route, method } = request;

    // If required roles are specified, check if the user has one.
    if (requiredRoles && requiredRoles.length > 0) {
      const hasRole = requiredRoles.some((role) => user.role === role);
      if (!hasRole) {
        throw new ForbiddenException('You do not have the required role to access this resource');
      }
    }

    // Retrieve all user groups that the user is a member of.
    const userGroups = await this.userGroupService.getUserGroups(user.id);

    // Aggregate all permissions from the groups.
    const allPermissions = [];
    for (const group of userGroups) {
      const permissions = await this.userGroupPermissionService.getGroupPermissions(group.id);
      allPermissions.push(...permissions);
    }

    // Check if the aggregated permissions grant access to the requested route.
    const hasPermission = this.hasRequiredPermission(allPermissions, route.path, method);
    if (!hasPermission) {
      throw new ForbiddenException('You do not have permission to access this resource');
    }

    return true;
  }

  private hasRequiredPermission(permissions: any[], route: string, method: string): boolean {
    let requiredPermission = '';

    // Determine the required permission based on the route's path.
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
    } else if (route.includes('logs')) {
      requiredPermission = 'manage_logs';
    } else if (route.includes('packages')) {
      requiredPermission = 'manage_packages';
    } else if (route.includes('tasks')) {
      requiredPermission = 'manage_tasks';
    } else if (route.includes('task-statuses')) {
      requiredPermission = 'manage_task-statuses';
    } else if (route.includes('task-types')) {
      requiredPermission = 'manage_task-types';
    } else if (route.includes('task-files')) {
      requiredPermission = 'manage_task-files';
    } else if (route.includes('client-task-settings')) {
      requiredPermission = 'manage_client-task-settings';
    } else if (route.includes('task-settings')) {
      requiredPermission = 'manage_task-settings';
    } else if (route.includes('task-status-history')) {
      requiredPermission = 'manage_task-status-history';
    } else if (route.includes('sessions')) {
      requiredPermission = 'manage_sessions';
    } else if (route.includes('routes')) {
      requiredPermission = 'manage_routes';
    }

    // Based on the HTTP method, check that the matching permission flag is set.
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
