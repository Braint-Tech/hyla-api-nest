import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Put,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserDto } from './user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('/auth')
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

  @UseGuards(JwtAuthGuard)
  @Put('/update/:idUser')
  async updateUser(
    @Param('idUser') idUser: number,
    @Body() userDto: UserDto,
  ): Promise<object> {
    try {
      const response = await this.userService.updateUser(userDto, idUser);
      if (response.success)
        return {
          message: 'User successfully updated!',
        };
      else throw response;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
