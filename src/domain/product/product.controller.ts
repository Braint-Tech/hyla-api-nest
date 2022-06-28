import {
  Controller,
  Post,
  HttpException,
  HttpStatus,
  Request,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Get,
  Param,
  Put,
  Body,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProductService } from './product.service';
import { Express } from 'express';
import { ProductDto } from './product.dto';

@Controller('product')
export class ProductController {
  constructor(private productService: ProductService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/import')
  @UseInterceptors(FileInterceptor('file'))
  async importProduct(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<object> {
    try {
      if (req.user.role != 1) throw { forbidden: true };
      console.log(file);
      const response = await this.productService.importProduct(file);

      if (response === null) throw { disabled: true };

      return {
        response,
        message: 'User successfully authenticated!',
      };
    } catch (error) {
      if (error.forbidden)
        throw new HttpException('Unauthorized user!', HttpStatus.FORBIDDEN);
      else throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('/verification/:code')
  async productVerification(@Param('code') code: string): Promise<object> {
    try {
      const response = await this.productService.productVerification(code);

      return response;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put('/update/:code')
  async updateUser(
    @Param('code') code: string,
    @Body() productDto: ProductDto,
  ): Promise<object> {
    try {
      const response = await this.productService.updateProduct(
        productDto,
        code,
      );
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
    @Query('code') code: string,
  ): Promise<object> {
    try {
      if (req.user.role != 1) throw { forbidden: true };

      const response = await this.productService.listProduct(
        offset,
        limit,
        code,
      );
      return response;
    } catch (error) {
      if (error.forbidden)
        throw new HttpException('Unauthorized user!', HttpStatus.FORBIDDEN);
      else throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
