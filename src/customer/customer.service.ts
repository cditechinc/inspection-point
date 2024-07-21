// src/customer/customer.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto, clientId: string): Promise<Customer> {
    const customer = this.customerRepository.create({ ...createCustomerDto, client: { id: clientId } });
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
}
