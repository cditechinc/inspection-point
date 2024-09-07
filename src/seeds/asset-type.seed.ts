import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetType } from './../assets/entities/asset-type.entity';

@Injectable()
export class AssetTypeSeed {
  constructor(
    @InjectRepository(AssetType)
    private readonly assetTypeRepository: Repository<AssetType>,
  ) {}

  async run() {
    const assetTypes = [
      {
        name: 'Lift Station',
        description:
          'Wastewater lift stations are pumping stations that transfer wastewater from a lower level to a higher level.',
      },
    ];

    for (const assetType of assetTypes) {
      const exists = await this.assetTypeRepository.findOne({
        where: { name: assetType.name },
      });
      if (!exists) {
        const newAssetType = this.assetTypeRepository.create(assetType);
        await this.assetTypeRepository.save(newAssetType);
      }
    }
  }
}
