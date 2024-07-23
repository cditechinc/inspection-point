import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePhotoDto } from '../dto/create-photo.dto';
import { UpdatePhotoDto } from '../dto/update-photo.dto';
import { Photo } from '../entities/photo.entity';

@Injectable()
export class PhotosService {
  constructor(
    @InjectRepository(Photo)
    private readonly photoRepository: Repository<Photo>,
  ) {}

  create(createPhotoDto: CreatePhotoDto) {
    const photo = this.photoRepository.create(createPhotoDto);
    return this.photoRepository.save(photo);
  }

  findAll() {
    return this.photoRepository.find({ relations: ['asset'] });
  }

  findOne(id: string) {
    return this.photoRepository.findOne({ where: { id }, relations: ['asset'] });
  }

  update(id: string, updatePhotoDto: UpdatePhotoDto) {
    return this.photoRepository.update(id, updatePhotoDto);
  }

  remove(id: string) {
    return this.photoRepository.delete(id);
  }
}
