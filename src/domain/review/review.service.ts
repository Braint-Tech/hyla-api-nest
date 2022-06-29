import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReviewRepository } from './review.repository';
import { ProductService } from '../product/product.service';
import { ReviewDto } from './review.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(ReviewRepository)
    private reviewRepository: ReviewRepository,
    private productService: ProductService,
  ) {}

  async createReview(purchaseDate: string, code: string): Promise<object> {
    const product = await this.productService.findOneByCode(code);

    await this.reviewRepository.deleteReviewByProduct(product.id);

    return await this.reviewRepository.createReview(purchaseDate, product.id);
  }

  async updateReview(reviewDto: ReviewDto[]): Promise<any> {
    await this.reviewRepository.deleteReviewByProduct(reviewDto[0].productId);
    return await this.reviewRepository.updateReview(reviewDto);
  }
}
