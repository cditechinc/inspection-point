import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles, UseGuards } from '@nestjs/common';
import { FileFieldsInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { AssetsService } from './../services/assets.service';
import { CreateAssetDto } from './../dto/create-asset.dto';
import { UpdateAssetDto } from './../dto/update-asset.dto';
import { Express } from 'express';
import * as multer from 'multer';
import { JwtAuthGuard } from './../../auth/guards/jwt-auth.guard';
import { RolesGuard } from './../../auth/guards/roles.guard';
import { Roles } from './../../auth/decorators/roles.decorator';
import { Role } from './../../auth/role.enum';

@Controller('assets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post()
  @Roles(Role.Client, Role.ClientAdmin)
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'photos', maxCount: 4 }]), // Allow up to 4 photos
  )
  create(
    @Body() createAssetDto: CreateAssetDto,
    @UploadedFiles() files: { photos?: Express.Multer.File[] },
  ) {
    return this.assetsService.create(createAssetDto, files?.photos || []);
  }


  @Get('storm-drains')
  @Roles(Role.Client, Role.ClientAdmin)
  async getStormDrainsWithConnections() {
    return this.assetsService.findStormDrainsWithConnections();
  }

  @Get()
  @Roles(Role.Client, Role.ClientAdmin)
  findAll() {
    return this.assetsService.findAll();
  }

  @Get(':id')
  @Roles(Role.Client, Role.ClientAdmin)
  findOne(@Param('id') id: string) {
    return this.assetsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.Client, Role.ClientAdmin)
  @UseInterceptors(FilesInterceptor('files'))
  update(
    @Param('id') id: string,
    @Body() updateAssetDto: UpdateAssetDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.assetsService.update(id, updateAssetDto, files);
  }

  @Delete(':id')
  @Roles(Role.Client, Role.ClientAdmin)
  remove(@Param('id') id: string) {
    return this.assetsService.remove(id);
  }
}
