import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AssetsService } from './../services/assets.service';
import { CreateAssetDto } from './../dto/create-asset.dto';
import { UpdateAssetDto } from './../dto/update-asset.dto';
import { JwtAuthGuard } from './../../auth/guards/jwt-auth.guard';
import { RolesGuard } from './../../auth/guards/roles.guard';
import { Roles } from './../../auth/decorators/roles.decorator';
import { Role } from './../../auth/role.enum';

@Controller('assets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post()
  @Roles(Role.Client, Role.CustomerAdmin)
  create(@Body() createAssetDto: CreateAssetDto) {
    return this.assetsService.create(createAssetDto);
  }

  @Get()
  @Roles(Role.Client, Role.CustomerAdmin)
  findAll() {
    return this.assetsService.findAll();
  }

  @Get(':id')
  @Roles(Role.Client, Role.CustomerAdmin)
  findOne(@Param('id') id: string) {
    return this.assetsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.Client, Role.CustomerAdmin)
  update(@Param('id') id: string, @Body() updateAssetDto: UpdateAssetDto) {
    return this.assetsService.update(id, updateAssetDto);
  }

  @Delete(':id')
  @Roles(Role.Client, Role.CustomerAdmin)
  remove(@Param('id') id: string) {
    return this.assetsService.remove(id);
  }
}
