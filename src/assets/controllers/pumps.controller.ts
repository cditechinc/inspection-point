import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PumpsService } from './../services/pumps.service';
import { CreatePumpDto } from './../dto/create-pump.dto';
import { UpdatePumpDto } from './../dto/update-pump.dto';
import { JwtAuthGuard } from './../../auth/guards/jwt-auth.guard';
import { RolesGuard } from './../../auth/guards/roles.guard';
import { Roles } from './../../auth/decorators/roles.decorator';
import { Role } from './../../auth/role.enum';

@Controller('pumps')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PumpsController {
  constructor(private readonly pumpsService: PumpsService) {}

  @Post()
  @Roles(Role.Client, Role.CustomerAdmin)
  create(@Body() createPumpDto: CreatePumpDto) {
    return this.pumpsService.create(createPumpDto);
  }

  @Get()
  @Roles(Role.Client, Role.CustomerAdmin)
  findAll() {
    return this.pumpsService.findAll();
  }

  @Get(':id')
  @Roles(Role.Client, Role.CustomerAdmin)
  findOne(@Param('id') id: string) {
    return this.pumpsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.Client, Role.CustomerAdmin)
  update(@Param('id') id: string, @Body() updatePumpDto: UpdatePumpDto) {
    return this.pumpsService.update(id, updatePumpDto);
  }

  @Delete(':id')
  @Roles(Role.Client, Role.CustomerAdmin)
  remove(@Param('id') id: string) {
    return this.pumpsService.remove(id);
  }
}
