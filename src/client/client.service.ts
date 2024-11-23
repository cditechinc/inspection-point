import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, FindOneOptions, Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { RegisterClientDto } from './dto/register-client.dto';
import { AwsService } from '../aws/aws.service';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './../auth/dto/create-user.dto';
import { UserGroupService } from './../user-groups/services/user-group.service';
import { UserGroupPermissionService } from './../user-groups/services/user-group-permission.service';
import { Company } from './../company/entities/company.entity';

import { TaskStatus } from './../task-management/entities/task-status.entity';
import { TaskType } from './../task-management/entities/task-type.entity';
import { ClientTaskSettings } from './../task-management/entities/client-task-settings.entity';
import { Photo } from './../assets/entities/photo.entity';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    private readonly awsService: AwsService,
    private readonly userService: UserService,
    private readonly userGroupService: UserGroupService,
    private readonly userGroupPermissionService: UserGroupPermissionService,
    private readonly dataSource: DataSource,
  ) {}

  // async create(registerClientDto: RegisterClientDto): Promise<Client> {
  //   const queryRunner = this.dataSource.createQueryRunner();
  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();

  //   // Step 1: Create the client

  //   try {
  //     const hashedPassword = await bcrypt.hash(registerClientDto.password, 10);
  //     const client = this.clientsRepository.create(registerClientDto);
  //     await queryRunner.manager.save(client);

  //     // Ensure client.id is available
  //     if (!client.id) {
  //       throw new InternalServerErrorException('Client ID not generated');
  //     }

  //     // Step 2: Create the first user (client admin)
  //     const userDto: CreateUserDto = {
  //       username: registerClientDto.name,
  //       email: registerClientDto.email,
  //       password: registerClientDto.password,
  //       password_hash: hashedPassword,
  //       role: 'client_admin',
  //       is_client_admin: true,
  //       isProtectedUser: true, // First user is protected
  //       client: client,
  //     };
  //     const user = await this.userService.create(userDto, queryRunner.manager);
  //     user.client = client; // Ensure user is associated with the client
  //     await queryRunner.manager.save(user);

  //     // Step 3: Create the 'Client Admins' group
  //     const createUserGroupDto = {
  //       name: 'Client Admins',
  //       description: 'Default admin group with full permissions',
  //       isDefaultAdminGroup: true,
  //       isProtected: true, // Group is protected
  //       client: client,
  //     };
  //     const clientAdminsGroup = await this.userGroupService.create(
  //       client.id,
  //       createUserGroupDto,
  //       queryRunner.manager,
  //     );
  //     await queryRunner.manager.save(clientAdminsGroup);

  //     // Step 4: Assign the user to 'Client Admins' group
  //     await this.userService.assignUserToGroup(user.id, clientAdminsGroup.id);

  //     // Step 5: Create the company entity
  //     const createCompanyDto = {
  //       company_name: registerClientDto.company_name,
  //       company_type: registerClientDto.company_type,
  //       industry: registerClientDto.industry,
  //       website: registerClientDto.website,
  //       payment_method: registerClientDto.payment_method,
  //       client: client,
  //     };

  //     const company = this.companyRepository.create(createCompanyDto);
  //     await queryRunner.manager.save(company);

  //     // Step 6: Assign permissions to the 'Client Admins' group
  //     await this.userGroupPermissionService.assignPermissions(
  //       clientAdminsGroup.id,
  //       { permissions: [] }, // Empty, as all permissions are assigned automatically in the function
  //       true,
  //     );
  //     // Step 7: Create default task statuses
  //     await this.createDefaultTaskStatuses(client.id, queryRunner.manager);

  //     // Step 8: Create default task types
  //     await this.createDefaultTaskTypes(client.id, queryRunner.manager);

  //     // Step 9: Create client task settings with default values
  //     await this.createDefaultClientTaskSettings(
  //       client.id,
  //       queryRunner.manager,
  //     );

  //     // Step 10: Update the client with user info and save
  //     client.user = user;
  //     await queryRunner.manager.save(client);

  //     // Step 11: Create folders for the client in AWS (if applicable)
  //     try {
  //       await this.awsService.createClientFolders(client.id);
  //     } catch (awsError) {
  //       console.error('Error creating AWS folders:', awsError);
  //       throw new InternalServerErrorException('Error creating AWS folders');
  //     }

  //     await queryRunner.commitTransaction();
  //     return client;
  //   } catch (error) {
  //     await queryRunner.rollbackTransaction();
  //     console.error('Error creating client:', error); // Log the error for debugging
  //     throw new InternalServerErrorException('Error creating client');
  //   } finally {
  //     await queryRunner.release();
  //   }
  // }

  async create(
    registerClientDto: RegisterClientDto,
    photos?: Express.Multer.File[],
  ): Promise<Client> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const hashedPassword = await bcrypt.hash(registerClientDto.password, 10);

      // Step 1: Create the client
      const client = queryRunner.manager.create(Client, registerClientDto);
      await queryRunner.manager.save(client);

      // Ensure client.id is available
      if (!client.id) {
        throw new InternalServerErrorException('Client ID not generated');
      }

      // Step 2: Create the first user (client admin)
      const userDto: CreateUserDto = {
        username: registerClientDto.name,
        email: registerClientDto.email,
        password: registerClientDto.password,
        password_hash: hashedPassword,
        role: 'client_admin',
        is_client_admin: true,
        isProtectedUser: true, // First user is protected
        client: client, // Associate user with client
      };

      const user = await this.userService.create(userDto, queryRunner.manager);
      // No need to set user.client or save again

      // Step 3: Create the 'Client Admins' group
      const createUserGroupDto = {
        name: 'Client Admins',
        description: 'Default admin group with full permissions',
        isDefaultAdminGroup: true,
        isProtected: true, // Group is protected
        client: client,
      };

      const clientAdminsGroup = await this.userGroupService.create(
        client.id,
        createUserGroupDto,
        queryRunner.manager,
      );
      // No need to save again

      // Step 4: Assign the user to 'Client Admins' group
      await this.userService.assignUserToGroup(
        user.id,
        clientAdminsGroup.id,
        queryRunner.manager,
      );

      // Step 5: Create the company entity
      const createCompanyDto = {
        company_name: registerClientDto.company_name,
        company_type: registerClientDto.company_type,
        industry: registerClientDto.industry,
        website: registerClientDto.website,
        payment_method: registerClientDto.payment_method,
        company_address: registerClientDto.company_address,
        billing_address: registerClientDto.billing_address,
        client: client,
      };

      const company = queryRunner.manager.create(Company, createCompanyDto);
      await queryRunner.manager.save(company);

      // Step 6: Assign permissions to the 'Client Admins' group
      await this.userGroupPermissionService.assignPermissions(
        clientAdminsGroup.id,
        { permissions: [] }, // Empty, as all permissions are assigned automatically in the function
        true,
        queryRunner.manager,
      );

      // Step 7: Create default task statuses
      await this.createDefaultTaskStatuses(client.id, queryRunner.manager);

      // Step 8: Create default task types
      await this.createDefaultTaskTypes(client.id, queryRunner.manager);

      // Step 9: Create client task settings with default values
      await this.createDefaultClientTaskSettings(
        client.id,
        queryRunner.manager,
      );

      // Step 10: Handle photos
      if (photos && photos.length > 0) {
        const photoEntities = [];
        for (const photoData of photos) {
          const filePath = await this.awsService.uploadClientPhoto(
            client.id,
            photoData.buffer,
            photoData.originalname,
          );
          const photo = new Photo();
          photo.url = filePath;
          photo.client = client;
          await queryRunner.manager.save(photo);
          photoEntities.push(photo);
        }
        client.photos = photoEntities;
      }

      // Step 11: Create folders for the client in AWS (if applicable)
      try {
        await this.awsService.createClientFolders(client.id);
      } catch (awsError) {
        console.error('Error creating AWS folders:', awsError);
        throw new InternalServerErrorException('Error creating AWS folders');
      }

      // Step 112: Update the client with user info and save
      client.user = user;
      await queryRunner.manager.save(client);

      await queryRunner.commitTransaction();
      return client;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error creating client:', error); // Log the error for debugging
      throw new InternalServerErrorException('Error creating client');
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Client[]> {
    return this.clientsRepository.find({
      relations: [
        'user',
        'userGroups',
        'company',
        'taskSettings',
        'taskTypes',
        'taskStatuses',
        'photos',
      ],
    });
  }

  async findOne(id: string): Promise<Client> {
    const client = await this.clientsRepository.findOne({
      where: { id },
      relations: [
        'user',
        'userGroups',
        'company',
        'taskSettings',
        'taskTypes',
        'taskStatuses',
        'photos',
      ],
    });
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    return client;
  }

  async findOneByEmail(
    email: string,
    options?: FindOneOptions<Client>,
  ): Promise<Client | null> {
    return this.clientsRepository.findOne({
      where: { email },
      relations: ['user', 'userGroups'],
      ...options,
    });
  }

  async findOneByState(state: string): Promise<Client> {
    return this.clientsRepository.findOne({
      where: { quickbooksState: state },
    });
  }

  async update(id: string, updateClientDto: Partial<Client>): Promise<Client> {
    const client = await this.findOne(id);
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    Object.assign(client, updateClientDto);
    await this.clientsRepository.save(client);
    return client;
  }

  async remove(id: string): Promise<void> {
    const client = await this.findOne(id);
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    await this.clientsRepository.delete(id);
  }

  // Helper method to create default task statuses
  private async createDefaultTaskStatuses(
    clientId: string,
    manager: EntityManager,
  ): Promise<void> {
    const defaultStatuses = [
      {
        name: 'Created',
        color: '#FFFFFF',
        isPastDueProtected: false,
        isDefault: true,
      },
      {
        name: 'Acknowledged',
        color: '#FFFFFF',
        isPastDueProtected: false,
        isDefault: true,
      },
      {
        name: 'In-Route',
        color: '#FFFFFF',
        isPastDueProtected: false,
        isDefault: true,
      },
      {
        name: 'Arrival',
        color: '#FFFFFF',
        isPastDueProtected: false,
        isDefault: true,
      },
      {
        name: 'In-Progress',
        color: '#FFFFFF',
        isPastDueProtected: false,
        isDefault: true,
      },
      {
        name: 'Past-Due',
        color: '#FF0000',
        isPastDueProtected: true,
        isDefault: true,
      },
      {
        name: 'Delayed',
        color: '#FFA500',
        isPastDueProtected: false,
        isDefault: true,
      },
      {
        name: 'Awaiting Backup',
        color: '#FFFF00',
        isPastDueProtected: false,
        isDefault: true,
      },
      {
        name: 'Awaiting Parts',
        color: '#FFFFFF',
        isPastDueProtected: true,
        isDefault: true,
      },
      {
        name: 'Awaiting Client Approval',
        color: '#FFFFFF',
        isPastDueProtected: true,
        isDefault: true,
      },
      {
        name: 'Canceled',
        color: '#FFFFFF',
        isPastDueProtected: true,
        isDefault: true,
      },
      {
        name: 'Completed Not-Billed',
        color: '#FFFFFF',
        isPastDueProtected: true,
        isDefault: true,
      },
      {
        name: 'Completed Billed',
        color: '#FFFFFF',
        isPastDueProtected: true,
        isDefault: true,
      },
      {
        name: 'Deleted',
        color: '#FFFFFF',
        isPastDueProtected: true,
        isDefault: true,
      },
      {
        name: 'Unknown',
        color: '#FFFFFF',
        isPastDueProtected: true,
        isDefault: true,
      },
    ];

    for (const statusData of defaultStatuses) {
      const taskStatus = manager.create(TaskStatus, {
        ...statusData,
        client: { id: clientId },
      });
      await manager.save(taskStatus);
    }
  }

  // Helper method to create default task types
  private async createDefaultTaskTypes(
    clientId: string,
    manager: EntityManager,
  ): Promise<void> {
    const defaultTaskTypes = [
      { name: 'Service Call', isDefault: true },
      { name: 'After Hours Service Call', isDefault: true },
      { name: 'Emergency Service Call', isDefault: true },
      { name: 'Pump Out Grease Trap', isDefault: true },
      { name: 'Pump Out Lint Trap', isDefault: true },
      { name: 'Clean Lift Station', isDefault: true },
      { name: 'Clean Storm Drain', isDefault: true },
      { name: 'Replace Pump', isDefault: true },
      { name: 'Assist Team Member', isDefault: true },
      { name: 'Pump Out Digester', isDefault: true },
      { name: 'Pump Out Trailer', isDefault: true },
    ];

    for (const typeData of defaultTaskTypes) {
      const taskType = manager.create(TaskType, {
        ...typeData,
        client: { id: clientId },
      });
      await manager.save(taskType);
    }
  }

  // Helper method to create default client task settings
  private async createDefaultClientTaskSettings(
    clientId: string,
    manager: EntityManager,
  ): Promise<void> {
    const defaultSettings = manager.create(ClientTaskSettings, {
      client: { id: clientId },
      autoAssignUsersToTask: false,
      maxInProgressTasksPerUser: 0,
      allowUsersToCompleteBillTask: false,
      assignUserToTaskUsingSchedules: false,
      enableTaskWeights: false,
      captureTaskStatusGpsLocation: false,
      automaticTaskArrivalStatus: false,
      automaticTaskInvoiceCreation: false,
      taskInvoiceTheme: null,
      taskWeather: false,
    });
    await manager.save(defaultSettings);
  }
}
