// src/customer/customer.service.ts
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { QuickBooksOAuthService } from './../auth/quickbooks-oauth.service';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    private readonly quickBooksOAuthService: QuickBooksOAuthService,
  ) {}

  async create(createCustomerDto: CreateCustomerDto, clientId: string): Promise<Customer> {
    // Create customer in QuickBooks
    const quickBooksCustomer = await this.createCustomerInQuickBooks(createCustomerDto, clientId);

    // Store the QuickBooks customer ID in your database
    const customer = this.customerRepository.create({
      ...createCustomerDto,
      client: { id: clientId },
      quickbooksCustomerId: quickBooksCustomer.Customer.Id,
    });

    return this.customerRepository.save(customer);
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

  async update(id: string, updateCustomerDto: Partial<CreateCustomerDto>, clientId: string): Promise<Customer> {
    await this.customerRepository.update({ id, client: { id: clientId } }, updateCustomerDto);
    return this.findOne(id, clientId);
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
