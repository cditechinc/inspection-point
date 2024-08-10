import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Put,
    Delete,
    ParseUUIDPipe,
    UseGuards,
  } from '@nestjs/common';
  import { ChecklistService } from './../services/checklist.service';
  import { ChecklistDTO, UpdateChecklistDTO } from './../dto/checklist.dto';
  import { JwtAuthGuard } from './../../auth/guards/jwt-auth.guard';
  import { RolesGuard } from './../../auth/guards/roles.guard';
  import { Roles } from './../../auth/decorators/roles.decorator';
  import { Role } from './../../auth/role.enum';
  
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Controller('checklists')
  export class ChecklistController {
    constructor(private readonly checklistService: ChecklistService) {}
  
    @Roles(Role.Client)
    @Post()
    create(@Body() createChecklistDto: ChecklistDTO) {
      return this.checklistService.create(createChecklistDto);
    }
  
    @Roles(Role.Client)
    @Get()
    findAll() {
      return this.checklistService.findAll();
    }
  
    @Roles(Role.Client)
    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
      return this.checklistService.findOne(id);
    }
  
    @Roles(Role.Client)
    @Put(':id')
    update(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() updateChecklistDto: UpdateChecklistDTO,
    ) {
      return this.checklistService.update(id, updateChecklistDto);
    }
  
    @Roles(Role.Client)
    @Delete(':id')
    remove(@Param('id', ParseUUIDPipe) id: string) {
      return this.checklistService.remove(id);
    }
  }
  