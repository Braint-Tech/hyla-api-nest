import {
  Controller,
  Post,
  HttpException,
  HttpStatus,
  Request,
  UseGuards,
  Body,
  Get,
  Param,
  Query,
  Put,
  Delete,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ContentDto } from './content.dto';
import { ContentService } from './content.service';

@Controller('content')
export class ContentController {
  constructor(private contentService: ContentService) {}

  @UseGuards(JwtAuthGuard)
  @Post('')
  async createContent(
    @Body() contentDto: ContentDto,
    @Request() req: any,
  ): Promise<object> {
    try {
      if (req.user.role != 1) throw { forbidden: true };

      const response = await this.contentService.createContent(contentDto);

      if (response === null) throw { max: true };

      return {
        message: 'Content created successfully!',
      };
    } catch (error) {
      if (error.forbidden)
        throw new HttpException('Unauthorized user!', HttpStatus.FORBIDDEN);
      else if (error.max)
        throw new HttpException(
          'Maximum amount of product content has already been reached!',
          HttpStatus.NOT_ACCEPTABLE,
        );
      else throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:idContent')
  async findContent(
    @Param('idContent') idContent: number,
    @Request() req: any,
  ): Promise<object> {
    try {
      if (req.user.role != 1) throw { forbidden: true };

      const response = await this.contentService.findContent(idContent);

      return response;
    } catch (error) {
      if (error.forbidden)
        throw new HttpException('Unauthorized user!', HttpStatus.FORBIDDEN);
      else throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('/list/:offset/:limit')
  async listContent(
    @Param('offset') offset: number,
    @Param('limit') limit: number,
    @Request() req: any,
    @Query('title') title: string,
    @Query('type') type: string,
  ): Promise<object> {
    try {
      if (req.user.role != 1) throw { forbidden: true };

      const response = await this.contentService.listContent(
        offset,
        limit,
        title,
        type,
      );
      return response;
    } catch (error) {
      if (error.forbidden)
        throw new HttpException('Unauthorized user!', HttpStatus.FORBIDDEN);
      else throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put('/update/:idContent')
  async updateContent(
    @Param('idContent') idContent: number,
    @Body() contentDto: ContentDto,
    @Request() req: any,
  ): Promise<object> {
    try {
      if (req.user.role != 1) throw { forbidden: true };

      await this.contentService.updateContent(contentDto, idContent);

      return {
        message: 'Content successfully updated!',
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/delete/:idContent')
  async deleteContent(@Param('idContent') idContent: number): Promise<object> {
    try {
      await this.contentService.deleteContent(idContent);
      return {
        message: 'Content successfully removed!',
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('/product/find')
  async findProductContent(): Promise<object> {
    try {
      const response = await this.contentService.findProductContent();

      return response;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('/list/blog/:offset/:limit')
  async listBlogContent(
    @Param('offset') offset: number,
    @Param('limit') limit: number,
  ): Promise<object> {
    try {
      const response = await this.contentService.listBlogContent(offset, limit);
      return response;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('/list/video/:offset/:limit')
  async listVideoContent(
    @Param('offset') offset: number,
    @Param('limit') limit: number,
  ): Promise<object> {
    try {
      const response = await this.contentService.listVideoContent(
        offset,
        limit,
      );
      return response;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
