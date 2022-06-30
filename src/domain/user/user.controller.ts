import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Put,
  Param,
  UseGuards,
  Get,
  Request,
  Query,
  Delete,
  Patch,
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

  @Post('/admin/auth')
  async authAdmin(@Body() userDto: UserDto): Promise<object> {
    try {
      const response = await this.userService.authAdmin(userDto);

      if (response === null) throw { forbidden: true };

      return {
        response,
        message: 'User successfully authenticated!',
      };
    } catch (error) {
      if (error.forbidden)
        throw new HttpException('Incorrect password!', HttpStatus.FORBIDDEN);
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

  @UseGuards(JwtAuthGuard)
  @Get('/list/:offset/:limit')
  async listUser(
    @Param('offset') offset: number,
    @Param('limit') limit: number,
    @Request() req: any,
    @Query('name') name: string,
  ): Promise<object> {
    try {
      if (req.user.role != 1) throw { forbidden: true };

      const response = await this.userService.listUser(offset, limit, name);
      return response;
    } catch (error) {
      if (error.forbidden)
        throw new HttpException('Unauthorized user!', HttpStatus.FORBIDDEN);
      else throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('/profile/:idUser')
  async findUserProfile(@Param('idUser') idUser: number): Promise<object> {
    try {
      const response = await this.userService.findUserProfile(idUser);

      return response;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/delete/:idUser')
  async deleteUser(@Param('idUser') idUser: number): Promise<object> {
    try {
      const response = await this.userService.deleteUser(idUser);

      if (response.success)
        return {
          message: 'User successfully removed!',
        };
      else throw response;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/update/cellphone/:idUser')
  async updateUserCellphone(
    @Param('idUser') idUser: number,
    @Body() userDto: UserDto,
  ): Promise<object> {
    try {
      const response = await this.userService.updateUserCellphone(
        userDto,
        idUser,
      );

      if (response === undefined)
        return {
          message: 'User cellphone successfully updated!',
        };
      else throw response;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('/admin/export')
  async exportUser(@Request() req: any): Promise<object> {
    try {
      if (req.user.role != 1) throw { forbidden: true };

      const response = await this.userService.exportUser();
      return response;
    } catch (error) {
      if (error.forbidden)
        throw new HttpException('Unauthorized user!', HttpStatus.FORBIDDEN);
      else throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/forgot/password')
  async forgotPasswordUser(@Body('email') email: string): Promise<object> {
    try {
      await this.userService.forgotPasswordUser(email);
      return {
        message: 'Email successfully sent!',
      };
    } catch (error) {
      if (error.message === 'User not found!')
        throw new HttpException(error.message, HttpStatus.NOT_ACCEPTABLE);
      else throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
