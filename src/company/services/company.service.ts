// src/company/company.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './../entities/company.entity';
import { CreateCompanyDto } from './../dto/create-company.dto';
import { UpdateCompanyDto } from './../dto/update-company.dto';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
  ) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    const company = this.companyRepository.create(createCompanyDto);
    return this.companyRepository.save(company);
  }

  async findAll(): Promise<Company[]> {
    return this.companyRepository.find();
  }

  async findOne(id: string): Promise<Company> {
    const company = await this.companyRepository.findOne({
      where: { id },
      relations: ['client'],
    });
    if (!company) {
      throw new NotFoundException(`Company with id ${id} not found`);
    }
    return company;
  }

  async findByClientId(clientId: string): Promise<Company> {
    const company = await this.companyRepository.findOne({
      where: { client: { id: clientId } }, // Query by client ID
      relations: ['client'], // Include client object in the result
    });
    if (!company) {
      throw new NotFoundException(
        `Company for client with id ${clientId} not found`,
      );
    }
    return company;
  }

  async update(
    id: string,
    updateCompanyDto: UpdateCompanyDto,
  ): Promise<Company> {
    const company = await this.findOne(id);
    Object.assign(company, updateCompanyDto);
    return this.companyRepository.save(company);
  }

  async remove(id: string): Promise<void> {
    const company = await this.findOne(id);
    if (!company) {
      throw new NotFoundException(`Company with id ${id} not found`);
    }
    await this.companyRepository.remove(company);
  }
}
