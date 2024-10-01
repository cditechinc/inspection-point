import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePhotoDto } from './../dto/create-photo.dto';
import { UpdatePhotoDto } from './../dto/update-photo.dto';
import { Photo } from './../entities/photo.entity';
import { AwsService } from './../../aws/aws.service';
import * as multer from 'multer';
import { Client } from './../../client/entities/client.entity';
import { Asset } from '../entities/asset.entity';
import { Inspection } from './../../inspection/entities/inspection.entity';

@Injectable()
export class PhotosService {
  constructor(
    @InjectRepository(Photo)
    private photosRepository: Repository<Photo>,
    private readonly awsService: AwsService,
  ) {}

  async create(createPhotoDto: CreatePhotoDto, files: Express.Multer.File[]): Promise<Photo[]> {
    const photos: Photo[] = [];

    const entityType = this.getEntityType(createPhotoDto);

    // Validate existence of client
    const clientExists = await this.photosRepository.manager.findOne(Client, {
      where: { id: createPhotoDto.clientId },
    });
    if (!clientExists) {
      throw new BadRequestException('Invalid client ID');
    }

    // Validate existence of asset (if provided)
    if (createPhotoDto.assetId) {
      const assetExists = await this.photosRepository.manager.findOne(Asset, {
        where: { id: createPhotoDto.assetId },
      });
      if (!assetExists) {
        throw new BadRequestException('Invalid asset ID');
      }
    } else if (createPhotoDto.inspectionId) {
      const inspectionExists = await this.photosRepository.manager.findOne(Inspection, {
        where: { id: createPhotoDto.inspectionId },
      });
      if (!inspectionExists) {
        throw new BadRequestException('Invalid inspection ID');
      }
    }

    console.log('Request Body:', createPhotoDto);
    console.log('Uploaded Files:', files);

    for (const file of files) {
      const url = await this.awsService.uploadFile(
        createPhotoDto.clientId,
        entityType,
        'image',
        file.buffer,
        file.originalname,
      );

      const photo = this.photosRepository.create({ ...createPhotoDto, url });
      photos.push(await this.photosRepository.save(photo));
    }

    return photos;
  }

  //   async create(createPhotoDto: CreatePhotoDto, file: multer.File): Promise<Photo> {
  //     const entityType = this.getEntityType(createPhotoDto);

  //     // Validate existence of client
  //     const clientExists = await this.photosRepository.manager.findOne(Client, { where: { id: createPhotoDto.clientId } });
  //     if (!clientExists) {
  //         throw new BadRequestException('Invalid client ID');
  //     }

  //     // Validate existence of asset (if provided)
  //     if (createPhotoDto.assetId) {
  //         const assetExists = await this.photosRepository.manager.findOne(Asset, { where: { id: createPhotoDto.assetId } });
  //         if (!assetExists) {
  //             throw new BadRequestException('Invalid asset ID');
  //         }
  //     }

  //     console.log('CreatePhotoDto:', createPhotoDto);

  //     const url = await this.awsService.uploadFile(createPhotoDto.clientId, entityType, 'image', file.buffer, file.originalname);

  //     const photo = this.photosRepository.create({ ...createPhotoDto, url });
  //     return this.photosRepository.save(photo);
  // }

  async findAll(): Promise<Photo[]> {
    return this.photosRepository.find();
  }

  async findOne(id: string): Promise<Photo> {
    const photo = await this.photosRepository.findOne({ where: { id } });
    if (!photo) {
      throw new NotFoundException(`Photo #${id} not found`);
    }
    return photo;
  }

  async update(
    id: string,
    updatePhotoDto: UpdatePhotoDto,
    file: Express.Multer.File,
  ): Promise<Photo> {
    const photo = await this.photosRepository.preload({
      id,
      ...updatePhotoDto,
    });
    if (!photo) {
      throw new NotFoundException(`Photo #${id} not found`);
    }

    if (file) {
      const entityType = this.getEntityType(updatePhotoDto);
      const clientId = updatePhotoDto.clientId || photo.clientId;
      const url = await this.awsService.uploadFile(
        clientId,
        entityType,
        'image',
        file.buffer,
        file.originalname,
      );
      photo.url = url;
    }

    return this.photosRepository.save(photo);
  }

  async remove(id: string): Promise<void> {
    const photo = await this.findOne(id);
    await this.photosRepository.remove(photo);
  }

  private getEntityType(
    dto: CreatePhotoDto | UpdatePhotoDto,
  ): 'asset' | 'pump' | 'pumpBrand' | 'customer' | 'inspection' | 'client' {
    if (dto.assetId) return 'asset';
    if (dto.pumpId) return 'pump';
    if (dto.pumpBrandId) return 'pumpBrand';
    if (dto.customerId) return 'customer';
    if (dto.inspectionId) return 'inspection';
    if (dto.clientId) return 'client';
    throw new BadRequestException(
      'Invalid entity type: At least one of assetId, pumpId, pumpBrandId, or customerId must be provided',
    );
  }
}
