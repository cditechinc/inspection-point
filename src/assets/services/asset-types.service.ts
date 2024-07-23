import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAssetTypeDto } from '../dto/create-asset-type.dto';
import { UpdateAssetTypeDto } from '../dto/update-asset-type.dto';
import { AssetType } from '../entities/asset-type.entity';

@Injectable()
export class AssetTypesService {
  constructor(
    @InjectRepository(AssetType)
    private readonly assetTypeRepository: Repository<AssetType>,
  ) {}

  create(createAssetTypeDto: CreateAssetTypeDto) {
    const assetType = this.assetTypeRepository.create(createAssetTypeDto);
    return this.assetTypeRepository.save(assetType);
  }

  findAll() {
    return this.assetTypeRepository.find();
  }

  findOne(id: string) {
    return this.assetTypeRepository.findOne({ where: { id } });
  }

  update(id: string, updateAssetTypeDto: UpdateAssetTypeDto) {
    return this.assetTypeRepository.update(id, updateAssetTypeDto);
  }

  remove(id: string) {
    return this.assetTypeRepository.delete(id);
  }
}
