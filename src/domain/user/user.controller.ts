import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UserDto } from './user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  async createUser(@Body() userDto: UserDto): Promise<object> {
    try {
      const response = await this.userService.authUser(userDto);

      if (response === null) throw { disabled: true };

      return {
        response,
        message: 'User successfully authenticated!',
      };
    } catch (error) {
      if (error.disabled)
        throw new HttpException(
          'User with access disabled!',
          HttpStatus.PRECONDITION_FAILED,
        );
      else throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
