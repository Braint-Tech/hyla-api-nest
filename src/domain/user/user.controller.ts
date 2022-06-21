import { Controller, Post, Body, Get } from '@nestjs/common';
import { UserDto } from './user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  async createUser(@Body() userDto: UserDto): Promise<object> {
    const user = await this.userService.createUser(userDto);
    return {
      user,
      message: 'User registered successfully!',
    };
  }

  @Get()
  getAll() {
    return this.userService.findAll();
  }
}
