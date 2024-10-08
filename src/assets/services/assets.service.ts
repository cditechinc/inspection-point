import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAssetDto } from './../dto/create-asset.dto';
import { Asset } from './../entities/asset.entity';
import { AwsService } from './../../aws/aws.service';
import { Client } from './../../client/entities/client.entity';
import { User } from './../../user/entities/user.entity';
import { Photo } from './../entities/photo.entity';
import { AssetType } from './../entities/asset-type.entity';
import * as multer from 'multer';
import { UpdateAssetDto } from '../dto/update-asset.dto';
import { Customer } from './../../customer/entities/customer.entity';

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Asset)
    private assetsRepository: Repository<Asset>,
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Photo)
    private photosRepository: Repository<Photo>,
    @InjectRepository(AssetType)
    private assetTypeRepository: Repository<AssetType>,
    private readonly awsService: AwsService,
  ) {}

  async create(createAssetDto: CreateAssetDto, files: Express.Multer.File[]): Promise<Asset> {
    const client = await this.clientsRepository.findOne({ where: { id: createAssetDto.clientId } });
    if (!client) {
      throw new NotFoundException(`Client #${createAssetDto.clientId} not found`);
    }

    const customer = await this.customerRepository.findOne({ where: { id: createAssetDto.customerId } });
    if (!customer) {
      throw new NotFoundException(`Customer #${createAssetDto.customerId} not found`);
    }

    const assetType = createAssetDto.assetType 
      ? await this.assetTypeRepository.findOne({ where: { id: createAssetDto.assetType } })
      : undefined;
    if (createAssetDto.assetType && !assetType) {
      throw new NotFoundException(`AssetType #${createAssetDto.assetType} not found`);
    }

    const asset = this.assetsRepository.create({
      name: createAssetDto.name,
      assetType,
      location: createAssetDto.location,
      latitude: createAssetDto.latitude,
      longitude: createAssetDto.longitude,
      status: createAssetDto.status,
      inspectionInterval: createAssetDto.inspectionInterval,
      qrCode: createAssetDto.qrCode,
      nfcCode: createAssetDto.nfcCode,
      pipeDia: createAssetDto.pipeDia,
      smart: createAssetDto.smart,
      size: createAssetDto.size,
      material: createAssetDto.material,
      deleteProtect: createAssetDto.deleteProtect,
      duty: createAssetDto.duty,
      rails: createAssetDto.rails,
      float: createAssetDto.float,
      pumps: createAssetDto.pumps,
      power: createAssetDto.power,
      client: client,
      customer: customer,
    });

    const savedAsset = await this.assetsRepository.save(asset);

    if (files && files.length > 0) {
      for (const file of files) {
        const url = await this.awsService.uploadFile(client.id, 'asset', 'image', file.buffer, file.originalname);
    
        console.log(`Uploading photo for client with ID: ${client.id}`); // Debug log to ensure client ID is correct
    
        const photo = this.photosRepository.create({
          url,
          asset: savedAsset,
          client: client, // Explicitly setting the client object here
        });
    
        console.log('Photo object before saving:', photo); // Debug log for photo object
    
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
      relations: ['photos', 'client', 'customer', 'assetType']
    });
    if (!asset) {
      throw new NotFoundException(`Asset #${id} not found`);
    }
    return asset;
  }
  

  async update(id: string, updateAssetDto: UpdateAssetDto, files: Express.Multer.File[]): Promise<Asset> {
    const asset = await this.assetsRepository.preload({
      id,
      name: updateAssetDto.name,
      location: updateAssetDto.location,
      latitude: updateAssetDto.latitude,
      longitude: updateAssetDto.longitude,
      status: updateAssetDto.status,
      inspectionInterval: updateAssetDto.inspectionInterval,
      qrCode: updateAssetDto.qrCode,
      nfcCode: updateAssetDto.nfcCode,
      pipeDia: updateAssetDto.pipeDia,
      smart: updateAssetDto.smart,
      size: updateAssetDto.size,
      material: updateAssetDto.material,
      deleteProtect: updateAssetDto.deleteProtect,
      duty: updateAssetDto.duty,
      rails: updateAssetDto.rails,
      float: updateAssetDto.float,
      pumps: updateAssetDto.pumps,
      power: updateAssetDto.power,
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
          client: savedAsset.client,
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
