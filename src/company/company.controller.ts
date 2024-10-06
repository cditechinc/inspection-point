// src/company/company.controller.ts
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
import { CompanyService } from './services/company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { JwtAuthGuard } from './../auth/guards/jwt-auth.guard';
import { RolesGuard } from './../auth/guards/roles.guard';
import { PermissionsGuard } from './../auth/guards/permissions.guard';
import { Roles } from './../auth/decorators/roles.decorator';
import { Role } from './../auth/role.enum';

@Controller('companies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Roles(Role.ClientAdmin)
  @Get()
  findAll() {
    return this.companyService.findAll();
  }

  @Roles(Role.ClientAdmin)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companyService.findOne(id);
  }

  @Roles(Role.ClientAdmin)
  @Get('client/:clientId')
  findByClientId(@Param('clientId') clientId: string) {
    return this.companyService.findByClientId(clientId);
  }

  @Roles(Role.ClientAdmin)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companyService.update(id, updateCompanyDto);
  }

  @Roles(Role.ClientAdmin)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.companyService.remove(id);
  }
}
