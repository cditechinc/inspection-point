import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAssetDto } from './../dto/create-asset.dto';
import { UpdateAssetDto } from '../dto/update-asset.dto';
import { Asset } from '../entities/asset.entity';

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
  ) {}

  create(createAssetDto: CreateAssetDto) {
    const asset = this.assetRepository.create(createAssetDto);
    return this.assetRepository.save(asset);
  }

  findAll() {
    return this.assetRepository.find({ relations: ['client', 'customer', 'photos', 'pumps', 'assetPumps'] });
  }

  findOne(id: string) {
    return this.assetRepository.findOne({ where: { id }, relations: ['client', 'customer', 'photos', 'pumps', 'assetPumps'] });
  }

  update(id: string, updateAssetDto: UpdateAssetDto) {
    return this.assetRepository.update(id, updateAssetDto);
  }

  remove(id: string) {
    return this.assetRepository.delete(id);
  }
}
