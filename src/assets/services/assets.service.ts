import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAssetDto } from './../dto/create-asset.dto';
import { UpdateAssetDto } from './../dto/update-asset.dto';
import { Asset } from './../entities/asset.entity';
import { AwsService } from './../../aws/aws.service';
import { Client } from './../../client/entities/client.entity';
import { User } from './../../user/entities/user.entity';
import { Photo } from './../entities/photo.entity';
import * as multer from 'multer';

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Asset)
    private assetsRepository: Repository<Asset>,
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Photo)
    private photosRepository: Repository<Photo>,
    private readonly awsService: AwsService,
  ) {}

  async create(createAssetDto: CreateAssetDto, files: multer.File[]): Promise<Asset> {
    const client = await this.clientsRepository.findOne({ where: { id: createAssetDto.clientId } });
    if (!client) {
      throw new NotFoundException(`Client #${createAssetDto.clientId} not found`);
    }

    const customer = await this.usersRepository.findOne({ where: { id: createAssetDto.customerId } });
    if (!customer) {
      throw new NotFoundException(`Customer #${createAssetDto.customerId} not found`);
    }

    const asset = this.assetsRepository.create({
      name: createAssetDto.name,
      location: createAssetDto.location,
      latitude: createAssetDto.latitude,
      longitude: createAssetDto.longitude,
      description: createAssetDto.description,
      status: createAssetDto.status,
      inspectionInterval: createAssetDto.inspectionInterval,
      qrCode: createAssetDto.qrCode,
      nfcCode: createAssetDto.nfcCode,
      pipeDia: createAssetDto.pipeDiameter ? createAssetDto.pipeDiameter.toString() : undefined,
      smart: createAssetDto.smart,
      size: createAssetDto.size,
      material: createAssetDto.material,
      deleteProtect: createAssetDto.deleteProtect,
      duty: createAssetDto.duty,
      rails: createAssetDto.rails,
      float: createAssetDto.floats ? createAssetDto.floats.toString() : undefined,
      pumps: createAssetDto.pumps ? createAssetDto.pumps.toString() : undefined,
      client,
      customer,
    });

    const savedAsset = await this.assetsRepository.save(asset);

    if (files && files.length > 0) {
      for (const file of files) {
        const url = await this.awsService.uploadFile(client.id, 'asset', 'image', file.buffer, file.originalname);
        const photo = this.photosRepository.create({
          url,
          asset: savedAsset,
        });
        await this.photosRepository.save(photo);
      }
    }

    return savedAsset;
  }

  async findAll(): Promise<Asset[]> {
    return this.assetsRepository.find({ relations: ['photos', 'client', 'customer'] });
  }

  async findOne(id: string): Promise<Asset> {
    const asset = await this.assetsRepository.findOne({
      where: { id },
      relations: ['photos', 'client', 'customer']
    });
    if (!asset) {
      throw new NotFoundException(`Asset #${id} not found`);
    }
    return asset;
  }
  

  async update(id: string, updateAssetDto: UpdateAssetDto, files: multer.File[]): Promise<Asset> {
    const asset = await this.assetsRepository.preload({
      id,
      name: updateAssetDto.name,
      location: updateAssetDto.location,
      latitude: updateAssetDto.latitude,
      longitude: updateAssetDto.longitude,
      description: updateAssetDto.description,
      status: updateAssetDto.status,
      inspectionInterval: updateAssetDto.inspectionInterval,
      qrCode: updateAssetDto.qrCode,
      nfcCode: updateAssetDto.nfcCode,
      pipeDia: updateAssetDto.pipeDiameter ? updateAssetDto.pipeDiameter.toString() : undefined,
      smart: updateAssetDto.smart,
      size: updateAssetDto.size,
      material: updateAssetDto.material,
      deleteProtect: updateAssetDto.deleteProtect,
      duty: updateAssetDto.duty,
      rails: updateAssetDto.rails,
      float: updateAssetDto.floats ? updateAssetDto.floats.toString() : undefined,
      pumps: updateAssetDto.pumps ? updateAssetDto.pumps.toString() : undefined,
    });

    if (!asset) {
      throw new NotFoundException(`Asset #${id} not found`);
    }

    const savedAsset = await this.assetsRepository.save(asset);

    if (files && files.length > 0) {
      for (const file of files) {
        const url = await this.awsService.uploadFile(savedAsset.client.id, 'asset', 'image', file.buffer, file.originalname);
        const photo = this.photosRepository.create({
          url,
          asset: savedAsset,
        });
        await this.photosRepository.save(photo);
      }
    }

    return savedAsset;
  }

  async remove(id: string): Promise<void> {
    const asset = await this.findOne(id);
    await this.assetsRepository.remove(asset);
  }
}
