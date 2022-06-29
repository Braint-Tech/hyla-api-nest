import {
  Controller,
  Post,
  HttpException,
  HttpStatus,
  Request,
  UseGuards,
  Body,
  Put,
  Get,
  Param,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReviewDto } from './review.dto';
import { ReviewService } from './review.service';

@Controller('review')
export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  @UseGuards(JwtAuthGuard)
  @Post('')
  async createReview(
    @Body('purchaseDate') purchaseDate: string,
    @Body('code') code: string,
    @Request() req: any,
  ): Promise<object> {
    try {
      if (req.user.role != 1) throw { forbidden: true };

      const response = await this.reviewService.createReview(
        purchaseDate,
        code,
      );

      if (response) {
        return {
          message: 'Review created successfully!',
        };
      } else throw response;
    } catch (error) {
      if (error.forbidden)
        throw new HttpException('Unauthorized user!', HttpStatus.FORBIDDEN);
      else throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put('/update')
  async updateReview(@Body() reviewDto: ReviewDto[]): Promise<object> {
    try {
      const response = await this.reviewService.updateReview(reviewDto);
      if (response)
        return {
          message: 'Review successfully updated!',
        };
      else throw response;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('/next/date/:code')
  async getNextDateReview(@Param('code') code: string): Promise<object> {
    try {
      const response = await this.reviewService.getNextDateReview(code);

      return response;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
