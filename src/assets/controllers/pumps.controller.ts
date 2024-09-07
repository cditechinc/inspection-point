import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles, UseGuards } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PumpsService } from './../services/pumps.service';
import { CreatePumpDto } from './../dto/create-pump.dto';
import { UpdatePumpDto } from './../dto/update-pump.dto';
import * as multer from 'multer';
import { JwtAuthGuard } from './../../auth/guards/jwt-auth.guard';
import { RolesGuard } from './../../auth/guards/roles.guard';
import { Role } from './../../auth/role.enum';
import { Roles } from './../../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pumps')
export class PumpsController {
  constructor(private readonly pumpsService: PumpsService) {}

  @Post()
  @Roles(Role.Client, Role.ClientAdmin)
  @UseInterceptors(FilesInterceptor('files'))
  create(
    @Body() createPumpDto: CreatePumpDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.pumpsService.create(createPumpDto, files);
  }

  @Get()
  @Roles(Role.Client, Role.ClientAdmin)
  findAll() {
    return this.pumpsService.findAll();
  }

  @Get(':id')
  @Roles(Role.Client, Role.ClientAdmin)
  findOne(@Param('id') id: string) {
    return this.pumpsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.Client, Role.ClientAdmin)
  @UseInterceptors(FilesInterceptor('files'))
  update(
    @Param('id') id: string,
    @Body() updatePumpDto: UpdatePumpDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.pumpsService.update(id, updatePumpDto, files);
  }

  @Delete(':id')
  @Roles(Role.Client, Role.ClientAdmin)
  remove(@Param('id') id: string) {
    return this.pumpsService.remove(id);
  }
}
