import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from './../auth/guards/jwt-auth.guard';
import { Roles } from './../auth/decorators/roles.decorator';
import { Role } from './../auth/role.enum';
import { CreateAssociatedUserDto } from './dto/create-associated-user.dto';
import { LocalAuthGuard } from './../auth/guards/local-auth.guard';

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

  // Client admin adds new user
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ClientAdmin)  // Only client admins can add users
  @Post('add')
  async addUser(@Body() createAssociatedUserDto: CreateAssociatedUserDto, @Req() req: any): Promise<User> {
    console.log(req.user);  // Log the authenticated user
    const clientId = req.user.clientId;  // Get the client ID from the authenticated client admin
    console.log(clientId)
    return this.userService.createForClientAdmin(createAssociatedUserDto, clientId);
  }
}
