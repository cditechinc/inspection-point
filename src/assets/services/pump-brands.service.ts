import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePumpBrandDto } from './../dto/create-pump-brand.dto';
import { UpdatePumpBrandDto } from './../dto/update-pump-brand.dto';
import { PumpBrand } from './../entities/pump-brand.entity';
import { AwsService } from './../../aws/aws.service';
import * as multer from 'multer';

@Injectable()
export class PumpBrandsService {
  constructor(
    @InjectRepository(PumpBrand)
    private pumpBrandsRepository: Repository<PumpBrand>,
    private readonly awsService: AwsService,
  ) {}

  async create(createPumpBrandDto: CreatePumpBrandDto, file: multer.File): Promise<PumpBrand> {
    const pumpBrand = this.pumpBrandsRepository.create(createPumpBrandDto);
    const savedPumpBrand = await this.pumpBrandsRepository.save(pumpBrand);

    if (file) {
      const url = await this.awsService.uploadFile(savedPumpBrand.id, 'pumpBrand', 'image', file.buffer, file.originalname);
      savedPumpBrand.logoUrl = url;
      await this.pumpBrandsRepository.save(savedPumpBrand);
    }

    return savedPumpBrand;
  }

  async findAll(): Promise<PumpBrand[]> {
    return this.pumpBrandsRepository.find();
  }

  async findOne(id: string): Promise<PumpBrand> {
    const pumpBrand = await this.pumpBrandsRepository.findOne({ where: { id } });
    if (!pumpBrand) {
      throw new NotFoundException(`PumpBrand #${id} not found`);
    }
    return pumpBrand;
  }

  async update(id: string, updatePumpBrandDto: UpdatePumpBrandDto, file: multer.File): Promise<PumpBrand> {
    const pumpBrand = await this.pumpBrandsRepository.preload({ id, ...updatePumpBrandDto });
    if (!pumpBrand) {
      throw new NotFoundException(`PumpBrand #${id} not found`);
    }

    if (file) {
      const url = await this.awsService.uploadFile(pumpBrand.id, 'pumpBrand', 'image', file.buffer, file.originalname);
      pumpBrand.logoUrl = url;
      await this.pumpBrandsRepository.save(pumpBrand);
    }

    return this.pumpBrandsRepository.save(pumpBrand);
  }

  async remove(id: string): Promise<void> {
    const pumpBrand = await this.findOne(id);
    await this.pumpBrandsRepository.remove(pumpBrand);
  }
}
