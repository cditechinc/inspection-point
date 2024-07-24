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

@Injectable()
export class PumpsService {
  constructor(
    @InjectRepository(Pump)
    private pumpsRepository: Repository<Pump>,
    @InjectRepository(Photo)
    private photosRepository: Repository<Photo>,
    @InjectRepository(Asset)
    private assetsRepository: Repository<Asset>,
    @InjectRepository(PumpBrand)
    private pumpBrandsRepository: Repository<PumpBrand>,
    private readonly awsService: AwsService,
  ) {}

  async create(createPumpDto: CreatePumpDto, files: multer.File[]): Promise<Pump> {
    const asset = await this.assetsRepository.findOne({ where: { id: createPumpDto.assetId } });
    if (!asset) {
      throw new NotFoundException(`Asset #${createPumpDto.assetId} not found`);
    }

    const brand = createPumpDto.brandId ? await this.pumpBrandsRepository.findOne({ where: { id: createPumpDto.brandId } }) : null;
    if (createPumpDto.brandId && !brand) {
      throw new NotFoundException(`Brand #${createPumpDto.brandId} not found`);
    }

    const pump = this.pumpsRepository.create({
      asset,
      brand,
      avgAmps: createPumpDto.avgAmps,
      maxAmps: createPumpDto.maxAmps,
      hp: createPumpDto.hp,
      serial: createPumpDto.serial,
      warranty: createPumpDto.warranty,
      installedDate: createPumpDto.installedDate,
    });
    const savedPump = await this.pumpsRepository.save(pump);

    if (files && files.length > 0) {
      await this.addPhotosToPump(savedPump, files);
    }

    return savedPump;
  }

  async findAll(): Promise<Pump[]> {
    return this.pumpsRepository.find({ relations: ['photos', 'asset', 'brand'] });
  }

  async findOne(id: string): Promise<Pump> {
    const pump = await this.pumpsRepository.findOne({ where: { id }, relations: ['photos', 'asset', 'brand'] });
    if (!pump) {
      throw new NotFoundException(`Pump #${id} not found`);
    }
    return pump;
  }

  async update(id: string, updatePumpDto: UpdatePumpDto, files: multer.File[]): Promise<Pump> {
    const pump = await this.pumpsRepository.preload({
      id,
      ...updatePumpDto,
    });
    if (!pump) {
      throw new NotFoundException(`Pump #${id} not found`);
    }

    if (updatePumpDto.assetId) {
      const asset = await this.assetsRepository.findOne({ where: { id: updatePumpDto.assetId } });
      if (!asset) {
        throw new NotFoundException(`Asset #${updatePumpDto.assetId} not found`);
      }
      pump.asset = asset;
    }

    if (updatePumpDto.brandId) {
      const brand = await this.pumpBrandsRepository.findOne({ where: { id: updatePumpDto.brandId } });
      if (!brand) {
        throw new NotFoundException(`Brand #${updatePumpDto.brandId} not found`);
      }
      pump.brand = brand;
    }

    if (files && files.length > 0) {
      await this.addPhotosToPump(pump, files);
    }

    return this.pumpsRepository.save(pump);
  }

  async remove(id: string): Promise<void> {
    const pump = await this.findOne(id);
    await this.pumpsRepository.remove(pump);
  }

  private async addPhotosToPump(pump: Pump, files: multer.File[]) {
    const photos: Photo[] = pump.photos || [];
    for (const file of files) {
      const url = await this.awsService.uploadFile(
        pump.asset.client.id, 
        'pump', 
        'image', 
        file.buffer, 
        file.originalname
      );
      const photo = this.photosRepository.create({ url, pump });
      await this.photosRepository.save(photo);
      photos.push(photo);
    }
    pump.photos = photos;
    await this.pumpsRepository.save(pump);
  }
}
