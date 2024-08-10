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
  import { ChecklistItemService } from './../services/checklist-item.service';
  import { CreateChecklistItemDTO, UpdateChecklistItemDTO } from './../dto/checklist-item.dto';
  import { JwtAuthGuard } from './../../auth/guards/jwt-auth.guard';
  import { RolesGuard } from './../../auth/guards/roles.guard';
  import { Roles } from './../../auth/decorators/roles.decorator';
  import { Role } from './../../auth/role.enum';
  
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Controller('checklist-items')
  export class ChecklistItemController {
    constructor(private readonly checklistItemService: ChecklistItemService) {}
  
    @Roles(Role.Client)
    @Post()
    create(@Body() createChecklistItemDto: CreateChecklistItemDTO) {
      return this.checklistItemService.create(createChecklistItemDto);
    }
  
    @Roles(Role.Client)
    @Get()
    findAll() {
      return this.checklistItemService.findAll();
    }
  
    @Roles(Role.Client)
    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
      return this.checklistItemService.findOne(id);
    }
  
    @Roles(Role.Client)
    @Put(':id')
    update(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() updateChecklistItemDto: UpdateChecklistItemDTO,
    ) {
      return this.checklistItemService.update(id, updateChecklistItemDto);
    }
  
    @Roles(Role.Client)
    @Delete(':id')
    remove(@Param('id', ParseUUIDPipe) id: string) {
      return this.checklistItemService.remove(id);
    }
  }
  