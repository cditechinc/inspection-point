import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePhotoDto } from './../dto/create-photo.dto';
import { UpdatePhotoDto } from './../dto/update-photo.dto';
import { Photo } from './../entities/photo.entity';
import { AwsService } from './../../aws/aws.service';
import * as multer from 'multer';

@Injectable()
export class PhotosService {
  constructor(
    @InjectRepository(Photo)
    private photosRepository: Repository<Photo>,
    private readonly awsService: AwsService,
  ) {}

  async create(createPhotoDto: CreatePhotoDto, file: multer.File): Promise<Photo> {
    const entityType = this.getEntityType(createPhotoDto);

    if (!createPhotoDto.clientId) {
      throw new BadRequestException('Client ID must be provided');
    }

    console.log('CreatePhotoDto:', createPhotoDto);


    const url = await this.awsService.uploadFile(createPhotoDto.clientId, entityType, 'image', file.buffer, file.originalname);

    const photo = this.photosRepository.create({ ...createPhotoDto, url });
    return this.photosRepository.save(photo);
  }

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

  async update(id: string, updatePhotoDto: UpdatePhotoDto, file: multer.File): Promise<Photo> {
    const photo = await this.photosRepository.preload({ id, ...updatePhotoDto });
    if (!photo) {
      throw new NotFoundException(`Photo #${id} not found`);
    }

    if (file) {
      const entityType = this.getEntityType(updatePhotoDto);
      const clientId = updatePhotoDto.clientId || photo.clientId;
      const url = await this.awsService.uploadFile(clientId, entityType, 'image', file.buffer, file.originalname);
      photo.url = url;
    }

    return this.photosRepository.save(photo);
  }

  async remove(id: string): Promise<void> {
    const photo = await this.findOne(id);
    await this.photosRepository.remove(photo);
  }

  private getEntityType(dto: CreatePhotoDto | UpdatePhotoDto): 'asset' | 'pump' | 'pumpBrand' | 'customer' {
    if (dto.assetId) return 'asset';
    if (dto.pumpId) return 'pump';
    if (dto.pumpBrandId) return 'pumpBrand';
    if (dto.customerId) return 'customer';
    throw new BadRequestException('Invalid entity type: At least one of assetId, pumpId, pumpBrandId, or customerId must be provided');
  }
}
