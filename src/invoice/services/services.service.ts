import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Services } from '../entities/services.entity';
  import { Repository } from 'typeorm';
  import { QuickBooksOAuthService } from './../../auth/quickbooks-oauth.service';
  import { ClientService } from './../../client/client.service';
  import { CreateServiceFeeDto } from '../dto/create-services.dto';
  import { UpdateServiceFeeDto } from '../dto/update-services';
  
  @Injectable()
  export class ServicesService {
    constructor(
      @InjectRepository(Services)
      private readonly serviceFeeRepository: Repository<Services>,
      private readonly quickBooksService: QuickBooksOAuthService,
      private readonly clientService: ClientService,
    ) {}
  
    async createServiceFee(
      clientId: string,
      createServiceFeeDto: CreateServiceFeeDto,
    ): Promise<Services> {
      const client = await this.clientService.findOne(clientId);
  
      const serviceFee = this.serviceFeeRepository.create({
        ...createServiceFeeDto,
        client: client,
      });
  
      return this.serviceFeeRepository.save(serviceFee);
    }
  
    async findAll(clientId: string): Promise<Services[]> {
      return this.serviceFeeRepository.find({
        where: { client: { id: clientId } },
      });
    }
  
    async findOne(clientId: string, id: string): Promise<Services> {
      const serviceFee = await this.serviceFeeRepository.findOne({
        where: { id, client: { id: clientId } },
      });
  
      if (!serviceFee) {
        throw new NotFoundException('Service fee not found');
      }
  
      return serviceFee;
    }
  
    async updateServiceFee(
      clientId: string,
      id: string,
      updateServiceFeeDto: UpdateServiceFeeDto,
    ): Promise<Services> {
      const serviceFee = await this.findOne(clientId, id);
  
      Object.assign(serviceFee, updateServiceFeeDto);
  
      return this.serviceFeeRepository.save(serviceFee);
    }
  
    async removeServiceFee(clientId: string, id: string): Promise<void> {
      const serviceFee = await this.findOne(clientId, id);
  
      await this.serviceFeeRepository.remove(serviceFee);
    }
  
    async syncServiceFees(clientId: string): Promise<void> {
      // Refresh QuickBooks token if needed and get the OAuth client
      await this.quickBooksService.refreshTokenIfNeeded(clientId);
      const client = await this.clientService.findOne(clientId);
  
      // Fetch service fees from QuickBooks
      const serviceFees = await this.quickBooksService.fetchServiceFees(
        client.quickbooksRealmId,
        client.quickbooksAccessToken,
      );
  
      // Upsert service fees into the database
      for (const fee of serviceFees) {
        const existingServiceFee = await this.serviceFeeRepository.findOne({
          where: { quickbooksServiceId: fee.Id, client: { id: clientId } },
        });
  
        const serviceFeeData = {
          quickbooksServiceId: fee.Id,
          name: fee.Name,
          description: fee.Description || '',
          price: parseFloat(fee.UnitPrice),
          isTaxable: fee.Taxable || false,
          client: client,
        };
  
        if (existingServiceFee) {
          // Update existing service fee
          await this.serviceFeeRepository.update(existingServiceFee.id, serviceFeeData);
        } else {
          // Create new service fee
          const newServiceFee = this.serviceFeeRepository.create(serviceFeeData);
          await this.serviceFeeRepository.save(newServiceFee);
        }
      }
    }
  }
  