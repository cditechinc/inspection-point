import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PumpBrandsService } from './../services/pump-brands.service';
import { CreatePumpBrandDto } from './../dto/create-pump-brand.dto';
import { UpdatePumpBrandDto } from './../dto/update-pump-brand.dto';
import { JwtAuthGuard } from './../../auth/guards/jwt-auth.guard';
import { RolesGuard } from './../../auth/guards/roles.guard';
import { Roles } from './../../auth/decorators/roles.decorator';
import { Role } from './../../auth/role.enum';

@Controller('pump-brands')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PumpBrandsController {
  constructor(private readonly pumpBrandsService: PumpBrandsService) {}

  @Post()
  @Roles(Role.Admin)
  create(@Body() createPumpBrandDto: CreatePumpBrandDto) {
    return this.pumpBrandsService.create(createPumpBrandDto);
  }

  @Get()
  @Roles(Role.Client, Role.CustomerAdmin)
  findAll() {
    return this.pumpBrandsService.findAll();
  }

  @Get(':id')
  @Roles(Role.Client, Role.CustomerAdmin)
  findOne(@Param('id') id: string) {
    return this.pumpBrandsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.Admin)
  update(@Param('id') id: string, @Body() updatePumpBrandDto: UpdatePumpBrandDto) {
    return this.pumpBrandsService.update(id, updatePumpBrandDto);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  remove(@Param('id') id: string) {
    return this.pumpBrandsService.remove(id);
  }
}
