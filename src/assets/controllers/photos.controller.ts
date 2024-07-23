import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PhotosService } from './../services/photos.service';
import { CreatePhotoDto } from './../dto/create-photo.dto';
import { UpdatePhotoDto } from './../dto/update-photo.dto';
import * as multer from 'multer';
import { JwtAuthGuard } from './../../auth/guards/jwt-auth.guard';
@UseGuards(JwtAuthGuard)
@Controller('photos')
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() createPhotoDto: CreatePhotoDto,
    @UploadedFile() file: multer.File,
  ) {
    return this.photosService.create(createPhotoDto, file);
  }

  @Get()
  findAll() {
    return this.photosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.photosService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Param('id') id: string,
    @Body() updatePhotoDto: UpdatePhotoDto,
    @UploadedFile() file: multer.File,
  ) {
    return this.photosService.update(id, updatePhotoDto, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.photosService.remove(id);
  }
}
