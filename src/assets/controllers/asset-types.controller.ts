import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AssetTypesService } from './../services/asset-types.service';
import { CreateAssetTypeDto } from './../dto/create-asset-type.dto';
import { UpdateAssetTypeDto } from './../dto/update-asset-type.dto';
import { JwtAuthGuard } from './../../auth/guards/jwt-auth.guard';
import { RolesGuard } from './../../auth/guards/roles.guard';
import { Roles } from './../../auth/decorators/roles.decorator';
import { Role } from './../../auth/role.enum';

@Controller('asset-types')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssetTypesController {
  constructor(private readonly assetTypesService: AssetTypesService) {}

  @Post()
  @Roles(Role.Admin)
  create(@Body() createAssetTypeDto: CreateAssetTypeDto) {
    return this.assetTypesService.create(createAssetTypeDto);
  }

  @Get()
  @Roles(Role.Client, Role.CustomerAdmin)
  findAll() {
    return this.assetTypesService.findAll();
  }

  @Get(':id')
  @Roles(Role.Client, Role.CustomerAdmin)
  findOne(@Param('id') id: string) {
    return this.assetTypesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.Admin)
  update(@Param('id') id: string, @Body() updateAssetTypeDto: UpdateAssetTypeDto) {
    return this.assetTypesService.update(id, updateAssetTypeDto);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  remove(@Param('id') id: string) {
    return this.assetTypesService.remove(id);
  }
}
