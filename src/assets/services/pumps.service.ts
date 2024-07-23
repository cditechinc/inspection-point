import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePumpDto } from '../dto/create-pump.dto';
import { UpdatePumpDto } from '../dto/update-pump.dto';
import { Pump } from '../entities/pump.entity';

@Injectable()
export class PumpsService {
  constructor(
    @InjectRepository(Pump)
    private readonly pumpRepository: Repository<Pump>,
  ) {}

  create(createPumpDto: CreatePumpDto) {
    const pump = this.pumpRepository.create(createPumpDto);
    return this.pumpRepository.save(pump);
  }

  findAll() {
    return this.pumpRepository.find({ relations: ['asset', 'brand'] });
  }

  findOne(id: string) {
    return this.pumpRepository.findOne({ where: { id }, relations: ['asset', 'brand'] });
  }

  update(id: string, updatePumpDto: UpdatePumpDto) {
    return this.pumpRepository.update(id, updatePumpDto);
  }

  remove(id: string) {
    return this.pumpRepository.delete(id);
  }
}
