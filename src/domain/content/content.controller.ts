import {
  Controller,
  Post,
  HttpException,
  HttpStatus,
  Request,
  UseGuards,
  Body,
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
}
