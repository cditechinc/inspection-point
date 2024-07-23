import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles, UseGuards } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AssetsService } from './../services/assets.service';
import { CreateAssetDto } from './../dto/create-asset.dto';
import { UpdateAssetDto } from './../dto/update-asset.dto';
import * as multer from 'multer';
import { JwtAuthGuard } from './../../auth/guards/jwt-auth.guard';
import { RolesGuard } from './../../auth/guards/roles.guard';

@Controller('assets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  create(
    @Body() createAssetDto: CreateAssetDto,
    @UploadedFiles() files: multer.File[],
  ) {
    return this.assetsService.create(createAssetDto, files);
  }

  @Get()
  findAll() {
    return this.assetsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assetsService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('files'))
  update(
    @Param('id') id: string,
    @Body() updateAssetDto: UpdateAssetDto,
    @UploadedFiles() files: multer.File[],
  ) {
    return this.assetsService.update(id, updateAssetDto, files);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assetsService.remove(id);
  }
}
