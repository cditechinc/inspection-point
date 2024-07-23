import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PumpBrandsService } from './../services/pump-brands.service';
import { CreatePumpBrandDto } from './../dto/create-pump-brand.dto';
import { UpdatePumpBrandDto } from './../dto/update-pump-brand.dto';
import * as multer from 'multer';
import { JwtAuthGuard } from './../../auth/guards/jwt-auth.guard';
@UseGuards(JwtAuthGuard)
@Controller('pump-brands')
export class PumpBrandsController {
  constructor(private readonly pumpBrandsService: PumpBrandsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() createPumpBrandDto: CreatePumpBrandDto,
    @UploadedFile() file: multer.File,
  ) {
    return this.pumpBrandsService.create(createPumpBrandDto, file);
  }

  @Get()
  findAll() {
    return this.pumpBrandsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pumpBrandsService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Param('id') id: string,
    @Body() updatePumpBrandDto: UpdatePumpBrandDto,
    @UploadedFile() file: multer.File,
  ) {
    return this.pumpBrandsService.update(id, updatePumpBrandDto, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pumpBrandsService.remove(id);
  }
}
