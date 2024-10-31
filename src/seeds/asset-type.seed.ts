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
      {
        name: 'Grease Trap',
        description:
          'A grease trap is a plumbing device designed to intercept most greases and solids before they enter a wastewater disposal system.',
      },
      {
        name: 'Lint Trap',
        description:
          'A lint trap is a device used to catch lint and other debris from laundry wastewater before it enters the sewage system.',
      },
      {
        name: 'Treatment Plant Digester',
        description:
          'A treatment plant digester is a component of a wastewater treatment plant where sludge is decomposed by anaerobic bacteria.',
      },
    ];

    for (const assetType of assetTypes) {
      const exists = await this.assetTypeRepository.findOne({
        where: { name: assetType.name },
      });
      if (!exists) {
        const newAssetType = this.assetTypeRepository.create(assetType);
        await this.assetTypeRepository.save(newAssetType);
      } else {
        // Optional: Update the description if it has changed
        if (exists.description !== assetType.description) {
          exists.description = assetType.description;
          await this.assetTypeRepository.save(exists);
        }
      }
    }
  }
}
