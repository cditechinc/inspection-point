import {
    Injectable,
    NotFoundException,
    BadRequestException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import { Package } from './entities/package.entity';
  import { CreatePackageDto } from './dto/create-package.dto';
  import { UpdatePackageDto } from './dto/update-package.dto';
  
  @Injectable()
  export class PackageService {
    constructor(
      @InjectRepository(Package)
      private packageRepository: Repository<Package>,
    ) {}
  
    async create(createPackageDto: CreatePackageDto): Promise<Package> {
      const existingPackage = await this.packageRepository.findOne({
        where: { name: createPackageDto.name },
      });
  
      if (existingPackage) {
        throw new BadRequestException(
          `Package with name ${createPackageDto.name} already exists`,
        );
      }
  
      const pkg = this.packageRepository.create(createPackageDto);
      return this.packageRepository.save(pkg);
    }
  
    async findAll(): Promise<Package[]> {
      return this.packageRepository.find();
    }
  
    async findOne(id: string): Promise<Package> {
      const pkg = await this.packageRepository.findOne({ where: { id } });
      if (!pkg) {
        throw new NotFoundException(`Package with id ${id} not found`);
      }
      return pkg;
    }
  
    async update(
      id: string,
      updatePackageDto: UpdatePackageDto,
    ): Promise<Package> {
      const pkg = await this.findOne(id);
      Object.assign(pkg, updatePackageDto);
      return this.packageRepository.save(pkg);
    }
  
    async remove(id: string): Promise<void> {
      const pkg = await this.findOne(id);
      const isAssigned = await this.packageRepository
        .createQueryBuilder('package')
        .leftJoinAndSelect('package.companies', 'company')
        .where('package.id = :id', { id })
        .andWhere('company.package_id IS NOT NULL')
        .getOne();
  
      if (isAssigned) {
        throw new BadRequestException(
          `Cannot delete package with id ${id} because it is assigned to one or more companies`,
        );
      }
  
      await this.packageRepository.remove(pkg);
    }
  }