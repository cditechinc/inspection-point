import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePumpDto } from './../dto/create-pump.dto';
import { UpdatePumpDto } from './../dto/update-pump.dto';
import { Pump } from './../entities/pump.entity';
import { Asset } from './../entities/asset.entity';
import { PumpBrand } from './../entities/pump-brand.entity';
import { Photo } from './../entities/photo.entity';
import { AwsService } from './../../aws/aws.service';
import * as multer from 'multer';
import { AssetPump } from '../entities/asset-pump.entity';

@Injectable()
export class PumpsService {
  constructor(
    @InjectRepository(Pump)
    private pumpsRepository: Repository<Pump>,
    @InjectRepository(Photo)
    private photosRepository: Repository<Photo>,
    @InjectRepository(Asset)
    private assetsRepository: Repository<Asset>,
    @InjectRepository(AssetPump)
    private assetPumpsRepository: Repository<AssetPump>,
    @InjectRepository(PumpBrand)
    private pumpBrandsRepository: Repository<PumpBrand>,
    private readonly awsService: AwsService,
  ) {}

  async create(
    createPumpDto: CreatePumpDto,
    files: Express.Multer.File[],
  ): Promise<Pump> {
    

    const brand = createPumpDto.brandId
      ? await this.pumpBrandsRepository.findOne({
          where: { id: createPumpDto.brandId },
        })
      : null;
    if (createPumpDto.brandId && !brand) {
      throw new NotFoundException(`Brand #${createPumpDto.brandId} not found`);
    }

    const pump = this.pumpsRepository.create({
      brand,
      name: createPumpDto.name,
      avgAmps: createPumpDto.avgAmps,
      maxAmps: createPumpDto.maxAmps,
      hp: createPumpDto.hp,
      serial: createPumpDto.serial,
      warranty: createPumpDto.warranty,
      installedDate: createPumpDto.installedDate,
    });
    const savedPump = await this.pumpsRepository.save(pump);

    // Link the pump to the asset via AssetPump
  if (createPumpDto.assetId) {
    const asset = await this.assetsRepository.findOne({
      where: { id: createPumpDto.assetId },
      relations: ['client'],
    });
    if (!asset) {
      throw new NotFoundException(`Asset #${createPumpDto.assetId} not found`);
    }

    // Create AssetPump entry
    await this.createAssetPumpAssociation(asset, savedPump);
  }

    if (files && files.length > 0) {
      await this.addPhotosToPump(savedPump, files);
    }

    return savedPump;
  }

  async findAll(): Promise<Pump[]> {
    return this.pumpsRepository.find({
      relations: ['photos', 'asset', 'brand'],
    });
  }

  async findOne(id: string): Promise<Pump> {
    const pump = await this.pumpsRepository.findOne({
      where: { id },
      relations: ['photos', 'asset', 'brand'],
    });
    if (!pump) {
      throw new NotFoundException(`Pump #${id} not found`);
    }
    return pump;
  }

  async update(
    id: string,
    updatePumpDto: UpdatePumpDto,
    files: Express.Multer.File[],
  ): Promise<Pump> {
    const pump = await this.pumpsRepository.findOne({ where: { id } });
    if (!pump) {
      throw new NotFoundException(`Pump #${id} not found`);
    }
  
    // Update pump properties
    Object.assign(pump, {
      name: updatePumpDto.name || pump.name,
      avgAmps: updatePumpDto.avgAmps ?? pump.avgAmps,
      maxAmps: updatePumpDto.maxAmps ?? pump.maxAmps,
      hp: updatePumpDto.hp ?? pump.hp,
      serial: updatePumpDto.serial || pump.serial,
      warranty: updatePumpDto.warranty || pump.warranty,
      installedDate: updatePumpDto.installedDate || pump.installedDate,
    });
  
    // Update brand if provided
    if (updatePumpDto.brandId) {
      const brand = await this.pumpBrandsRepository.findOne({
        where: { id: updatePumpDto.brandId },
      });
      if (!brand) {
        throw new NotFoundException(`Brand #${updatePumpDto.brandId} not found`);
      }
      pump.brand = brand;
    }
  
    // Save the updated pump
    const savedPump = await this.pumpsRepository.save(pump);
  
    // Update AssetPump association if assetId is provided
    if (updatePumpDto.assetId) {
      const asset = await this.assetsRepository.findOne({
        where: { id: updatePumpDto.assetId },
        relations: ['client'],
      });
      if (!asset) {
        throw new NotFoundException(`Asset #${updatePumpDto.assetId} not found`);
      }
  
      // Update AssetPump association
      await this.updateAssetPumpAssociation(asset, savedPump);
    }
  
    // Handle file uploads
    if (files && files.length > 0) {
      await this.addPhotosToPump(savedPump, files);
    }
  
    return savedPump;
  }
  

  async remove(id: string): Promise<void> {
    const pump = await this.findOne(id);
    await this.pumpsRepository.remove(pump);
  }

  private async addPhotosToPump(pump: Pump, files: Express.Multer.File[]) {
    // Retrieve the associated assets to get the client ID
    const assetPumps = await this.assetPumpsRepository.find({
      where: { pump: { id: pump.id } },
      relations: ['asset', 'asset.client'],
    });
  
    if (assetPumps.length === 0) {
      throw new NotFoundException(`No associated assets found for Pump #${pump.id}`);
    }
  
    // Assuming you want to use the first associated asset's client ID
    const clientId = assetPumps[0].asset.client.id;
  
    const photos: Photo[] = pump.photos || [];
    for (const file of files) {
      const url = await this.awsService.uploadFile(
        clientId,
        'pump',
        'image',
        file.buffer,
        file.originalname,
      );
      const photo = this.photosRepository.create({ url, pump });
      await this.photosRepository.save(photo);
      photos.push(photo);
    }
    pump.photos = photos;
    await this.pumpsRepository.save(pump);
  }
  

  private async createAssetPumpAssociation(asset: Asset, pump: Pump) {
    const assetPump = this.assetPumpsRepository.create({
      asset,
      pump,
    });
    await this.assetPumpsRepository.save(assetPump);
  }
  
  private async updateAssetPumpAssociation(asset: Asset, pump: Pump) {
    // Remove existing associations
    await this.assetPumpsRepository.delete({ pump: { id: pump.id } });
  
    // Create new association
    await this.createAssetPumpAssociation(asset, pump);
  }
  
}
