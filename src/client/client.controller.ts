import { Controller, Post, Body, Get, Param, Patch, Delete } from '@nestjs/common';
import { ClientService } from './client.service';
import { RegisterClientDto } from './dto/register-client.dto';
import { Client } from './entities/client.entity';

@Controller('clients')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post('register')
  async create(@Body() registerClientDto: RegisterClientDto): Promise<Client> {
    return this.clientService.create(registerClientDto);
  }

  @Get()
  async findAll(): Promise<Client[]> {
    return this.clientService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Client> {
    return this.clientService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateClientDto: Partial<Client>): Promise<Client> {
    return this.clientService.update(id, updateClientDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.clientService.remove(id);
  }
}