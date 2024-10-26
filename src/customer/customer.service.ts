// src/customer/customer.service.ts
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { QuickBooksOAuthService } from './../auth/quickbooks-oauth.service';
import { AwsService } from './../aws/aws.service';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    private readonly quickBooksOAuthService: QuickBooksOAuthService,
    private readonly awsService: AwsService,
  ) {}

  async create(createCustomerDto: CreateCustomerDto, clientId: string, files: Express.Multer.File[]): Promise<Customer> {
    try {
      // Upload photos to S3 using your existing uploadFile function
      const photoUrls: string[] = await Promise.all(
        files.map(file =>
          this.awsService.uploadFile(clientId, 'customer', 'image', file.buffer, file.originalname),
        ),
      );

      // Create customer in QuickBooks
      const quickBooksCustomer = await this.createCustomerInQuickBooks(createCustomerDto, clientId);

      // Store the QuickBooks customer ID and photo URLs in the database
      const customer = this.customerRepository.create({
        ...createCustomerDto,
        client: { id: clientId },
        quickbooksCustomerId: quickBooksCustomer.Customer.Id,
        photos: photoUrls, // Store S3 URLs of the uploaded photos
      });

      return this.customerRepository.save(customer);
    } catch (error) {
      console.error('Error creating customer with photos:', error);
      throw new InternalServerErrorException('Failed to create customer with photos.');
    }
  }

  async findAll(clientId: string): Promise<Customer[]> {
    return this.customerRepository.find({ where: { client: { id: clientId } } });
  }

  async findOne(id: string, clientId: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({ where: { id, client: { id: clientId } } });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    return customer;
  }

  async update(id: string, updateCustomerDto: Partial<CreateCustomerDto>, clientId: string, files: Express.Multer.File[]): Promise<Customer> {
    try {
      // If files are provided, upload the photos to S3
      let photoUrls: string[] = [];
      if (files && files.length > 0) {
        photoUrls = await Promise.all(
          files.map(file =>
            this.awsService.uploadFile(clientId, 'customer', 'image', file.buffer, file.originalname),
          ),
        );
      }
  
      // Find the customer to update
      const existingCustomer = await this.findOne(id, clientId);
      if (!existingCustomer) {
        throw new NotFoundException(`Customer with ID ${id} not found`);
      }
  
      // Update the customer details and append new photos to existing photos if they exist
      const updatedCustomer = {
        ...existingCustomer,
        ...updateCustomerDto,
        photos: photoUrls.length > 0 ? [...existingCustomer.photos, ...photoUrls] : existingCustomer.photos,
      };
  
      await this.customerRepository.save(updatedCustomer);
      return updatedCustomer;
    } catch (error) {
      console.error('Error updating customer with photos:', error);
      throw new InternalServerErrorException('Failed to update customer with photos.');
    }
  }
  

  async remove(id: string, clientId: string): Promise<void> {
    await this.customerRepository.delete({ id, client: { id: clientId } });
  }

  private async createCustomerInQuickBooks(createCustomerDto: CreateCustomerDto, clientId: string) {
    try {
      return await this.quickBooksOAuthService.createCustomer(clientId, {
        DisplayName: createCustomerDto.name,
        PrimaryEmailAddr: { Address: createCustomerDto.email },
        PrimaryPhone: { FreeFormNumber: createCustomerDto.phone },
        BillAddr: { Line1: createCustomerDto.billing_address },
        ShipAddr: { Line1: createCustomerDto.service_address },
        // Add other QuickBooks-specific fields if necessary
      });
    } catch (error) {
      console.error('Error creating customer in QuickBooks:', error);
      throw new InternalServerErrorException('Failed to create customer in QuickBooks');
    }
  }
}
