import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './../services/user.service';
import { User } from '../entities/user.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/role.enum';
import { CreateAssociatedUserDto } from '../dto/create-associated-user.dto';
import { UpdateAssociatedUserDto } from '../dto/update-associated-user.dto';
import { RolesGuard } from '../../auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<User> {
    return this.userService.findById(id);
  }

  @Get()
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get('client/associated')
  @Roles(Role.ClientAdmin) // Only client admins can fetch associated users
  async getUsersByClient(@Req() req: any): Promise<User[]> {
    const clientId = req.user.clientId; // Get the client ID from the authenticated user
    if (!clientId) {
      throw new UnauthorizedException('Client ID not found in the request');
    }
    return this.userService.findAllByClientId(clientId); // Get all users associated with this client
  }

  // Client admin adds new user
  @Roles(Role.ClientAdmin) // Only client admins can add users
  @Post('add')
  async addUser(
    @Body() createAssociatedUserDto: CreateAssociatedUserDto,
    @Req() req: any,
  ): Promise<User> {
    console.log(req.user); // Log the authenticated user
    const clientId = req.user.clientId; // Get the client ID from the authenticated client admin
    console.log(clientId);
    return this.userService.createForClientAdmin(
      createAssociatedUserDto,
      clientId,
    );
  }

  @Patch(':id')
  @Roles(Role.ClientAdmin) // Only client admins can update users
  async updateUser(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateAssociatedUserDto: UpdateAssociatedUserDto,
    @Req() req: any,
  ): Promise<User> {
    // Get the client ID from the authenticated user
    const clientId = req.user.clientId;

    // Fetch the user to be updated
    const userToUpdate = await this.userService.findById(id, {
      relations: ['client'],
    });

    if (!userToUpdate) {
      throw new NotFoundException('User not found');
    }

    // Ensure the user belongs to the same client
    if (userToUpdate.client.id !== clientId) {
      throw new UnauthorizedException(
        'You do not have permission to update this user',
      );
    }

    return await this.userService.updateUser(id, updateAssociatedUserDto);
  }
}
