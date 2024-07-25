import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PhotosService } from './../services/photos.service';
import { CreatePhotoDto } from './../dto/create-photo.dto';
import { UpdatePhotoDto } from './../dto/update-photo.dto';
import * as multer from 'multer';
import { JwtAuthGuard } from './../../auth/guards/jwt-auth.guard';
import { RolesGuard } from './../../auth/guards/roles.guard';
import { Roles } from './../../auth/decorators/roles.decorator';
import { Role } from './../../auth/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('photos')
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Post('upload/:clientId')
  @Roles(Role.Client)
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Param('clientId') clientId: string,
    @Body() createPhotoDto: CreatePhotoDto,
    @UploadedFile() file: multer.File,
  ) {
    createPhotoDto.clientId = clientId; // Ensure the clientId is included in the DTO
    console.log('CreatePhotoDto:', createPhotoDto);

    return this.photosService.create(createPhotoDto, file);
  }

  @Get()
  @Roles(Role.Client)
  findAll() {
    return this.photosService.findAll();
  }

  @Get(':id')
  @Roles(Role.Client)
  findOne(@Param('id') id: string) {
    return this.photosService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.Client)
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Param('id') id: string,
    @Body() updatePhotoDto: UpdatePhotoDto,
    @UploadedFile() file: multer.File,
  ) {
    return this.photosService.update(id, updatePhotoDto, file);
  }

  @Delete(':id')
  @Roles(Role.Client)
  remove(@Param('id') id: string) {
    return this.photosService.remove(id);
  }
}
