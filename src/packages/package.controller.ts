import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
  } from '@nestjs/common';
  import { PackageService } from './package.service';
  import { CreatePackageDto } from './dto/create-package.dto';
  import { UpdatePackageDto } from './dto/update-package.dto';
  import { JwtAuthGuard } from './../auth/guards/jwt-auth.guard';
  import { RolesGuard } from './../auth/guards/roles.guard';
  import { Roles } from './../auth/decorators/roles.decorator';
  import { Role } from './../auth/role.enum';
  
  @Controller('packages')
  @UseGuards(JwtAuthGuard, RolesGuard)
  export class PackageController {
    constructor(private readonly packageService: PackageService) {}
  
    
  
    // @Roles(Role.ClientAdmin)
    @Get()
    findAll() {
      return this.packageService.findAll();
    }
  
    @Roles(Role.ClientAdmin)
    @Get(':id')
    findOne(@Param('id') id: string) {
      return this.packageService.findOne(id);
    }
  
    @Roles(Role.ClientAdmin)
    @Patch(':id')
    update(
      @Param('id') id: string,
      @Body() updatePackageDto: UpdatePackageDto,
    ) {
      return this.packageService.update(id, updatePackageDto);
    }
  
    @Roles(Role.ClientAdmin)
    @Delete(':id')
    remove(@Param('id') id: string) {
      return this.packageService.remove(id);
    }
  }