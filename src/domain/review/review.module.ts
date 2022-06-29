import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewRepository } from './review.repository';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReviewRepository]),
    forwardRef(() => ProductModule),
  ],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
