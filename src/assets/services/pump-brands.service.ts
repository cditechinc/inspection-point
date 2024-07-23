import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePumpBrandDto } from '../dto/create-pump-brand.dto';
import { UpdatePumpBrandDto } from '../dto/update-pump-brand.dto';
import { PumpBrand } from '../entities/pump-brand.entity';

@Injectable()
export class PumpBrandsService {
  constructor(
    @InjectRepository(PumpBrand)
    private readonly pumpBrandRepository: Repository<PumpBrand>,
  ) {}

  create(createPumpBrandDto: CreatePumpBrandDto) {
    const pumpBrand = this.pumpBrandRepository.create(createPumpBrandDto);
    return this.pumpBrandRepository.save(pumpBrand);
  }

  findAll() {
    return this.pumpBrandRepository.find();
  }

  findOne(id: string) {
    return this.pumpBrandRepository.findOne({ where: { id } });
  }

  update(id: string, updatePumpBrandDto: UpdatePumpBrandDto) {
    return this.pumpBrandRepository.update(id, updatePumpBrandDto);
  }

  remove(id: string) {
    return this.pumpBrandRepository.delete(id);
  }
}
