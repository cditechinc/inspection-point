import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PumpsService } from './../services/pumps.service';
import { CreatePumpDto } from './../dto/create-pump.dto';
import { UpdatePumpDto } from './../dto/update-pump.dto';
import * as multer from 'multer';

@Controller('pumps')
export class PumpsController {
  constructor(private readonly pumpsService: PumpsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  create(
    @Body() createPumpDto: CreatePumpDto,
    @UploadedFiles() files: multer.File[],
  ) {
    return this.pumpsService.create(createPumpDto, files);
  }

  @Get()
  findAll() {
    return this.pumpsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pumpsService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('files'))
  update(
    @Param('id') id: string,
    @Body() updatePumpDto: UpdatePumpDto,
    @UploadedFiles() files: multer.File[],
  ) {
    return this.pumpsService.update(id, updatePumpDto, files);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pumpsService.remove(id);
  }
}
