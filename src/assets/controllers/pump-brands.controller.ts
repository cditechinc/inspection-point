import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PumpBrandsService } from './../services/pump-brands.service';
import { CreatePumpBrandDto } from './../dto/create-pump-brand.dto';
import { UpdatePumpBrandDto } from './../dto/update-pump-brand.dto';
import * as multer from 'multer';
import { JwtAuthGuard } from './../../auth/guards/jwt-auth.guard';
import { RolesGuard } from './../../auth/guards/roles.guard';
import { Roles } from './../../auth/decorators/roles.decorator';
import { Role } from './../../auth/role.enum';
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pump-brands')
export class PumpBrandsController {
  constructor(private readonly pumpBrandsService: PumpBrandsService) {}

  @Post()
  @Roles(Role.Client, Role.ClientAdmin)
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() createPumpBrandDto: CreatePumpBrandDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.pumpBrandsService.create(createPumpBrandDto, file);
  }

  @Get()
  @Roles(Role.Client, Role.ClientAdmin)
  findAll() {
    return this.pumpBrandsService.findAll();
  }

  @Get(':id')
  @Roles(Role.Client, Role.ClientAdmin)
  findOne(@Param('id') id: string) {
    return this.pumpBrandsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.Client, Role.ClientAdmin)
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Param('id') id: string,
    @Body() updatePumpBrandDto: UpdatePumpBrandDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.pumpBrandsService.update(id, updatePumpBrandDto, file);
  }

  @Delete(':id')
  @Roles(Role.Client, Role.ClientAdmin)
  remove(@Param('id') id: string) {
    return this.pumpBrandsService.remove(id);
  }
}
