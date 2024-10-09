import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { RegisterClientDto } from './dto/register-client.dto';
import { AwsService } from '../aws/aws.service';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './../auth/dto/create-user.dto';
import { UserGroupService } from './../user-groups/services/user-group.service';
import { UserGroupPermissionService } from './../user-groups/services/user-group-permission.service';
import { Company } from './../company/entities/company.entity';

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
  ) {}

  async create(registerClientDto: RegisterClientDto): Promise<Client> {
    const hashedPassword = await bcrypt.hash(registerClientDto.password, 10);

    // Step 1: Create the client
    const client = this.clientsRepository.create(registerClientDto);

    try {
      await this.clientsRepository.save(client);

      // Step 2: Create the first user (client admin)
      const userDto: CreateUserDto = {
        username: registerClientDto.name,
        email: registerClientDto.email,
        password: registerClientDto.password,
        password_hash: hashedPassword,
        role: 'client_admin',
        is_client_admin: true,
        isProtectedUser: true, // First user is protected
        client: client,
      };
      const user = await this.userService.create(userDto);

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
      );

      // Step 4: Assign the user to 'Client Admins' group
      await this.userService.assignUserToGroup(user.id, clientAdminsGroup.id);

       // Step 5: Create the company entity
    const createCompanyDto = {
      company_name: registerClientDto.company_name, 
      company_type: registerClientDto.company_type,
      industry: registerClientDto.industry,
      website: registerClientDto.website,
      payment_method: registerClientDto.payment_method,
      client: client, 
    };

    const company = this.companyRepository.create(createCompanyDto);
    await this.companyRepository.save(company);

      // Step 6: Assign permissions to the 'Client Admins' group
      await this.userGroupPermissionService.assignPermissions(
        clientAdminsGroup.id,
        { permissions: [] }, // Empty, as all permissions are assigned automatically in the function
        true,
      );
      // Update the client with user info and save
      client.user = user;
      await this.clientsRepository.save(client);

      // Step 6: Create folders for the client in AWS (if applicable)
      try {
        await this.awsService.createClientFolders(client.id);
      } catch (awsError) {
        console.error('Error creating AWS folders:', awsError);
        throw new InternalServerErrorException('Error creating AWS folders');
      }

      return client;
    } catch (error) {
      console.error('Error creating client:', error); // Log the error for debugging
      throw new InternalServerErrorException('Error creating client');
    }
  }

  async findAll(): Promise<Client[]> {
    return this.clientsRepository.find({ relations: ['user', 'userGroups'] });
  }

  async findOne(id: string): Promise<Client> {
    const client = await this.clientsRepository.findOne({
      where: { id },
      relations: ['user', 'userGroups'],
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
}
