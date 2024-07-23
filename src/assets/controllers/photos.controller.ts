import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PhotosService } from './../services/photos.service';
import { CreatePhotoDto } from './../dto/create-photo.dto';
import { UpdatePhotoDto } from './../dto/update-photo.dto';
import { JwtAuthGuard } from './../../auth/guards/jwt-auth.guard';
import { RolesGuard } from './../../auth/guards/roles.guard';
import { Roles } from './../../auth/decorators/roles.decorator';
import { Role } from './../../auth/role.enum';

@Controller('photos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Post()
  @Roles(Role.Client, Role.CustomerAdmin)
  create(@Body() createPhotoDto: CreatePhotoDto) {
    return this.photosService.create(createPhotoDto);
  }

  @Get()
  @Roles(Role.Client, Role.CustomerAdmin)
  findAll() {
    return this.photosService.findAll();
  }

  @Get(':id')
  @Roles(Role.Client, Role.CustomerAdmin)
  findOne(@Param('id') id: string) {
    return this.photosService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.Client, Role.CustomerAdmin)
  update(@Param('id') id: string, @Body() updatePhotoDto: UpdatePhotoDto) {
    return this.photosService.update(id, updatePhotoDto);
  }

  @Delete(':id')
  @Roles(Role.Client, Role.CustomerAdmin)
  remove(@Param('id') id: string) {
    return this.photosService.remove(id);
  }
}
