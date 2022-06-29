import { EntityRepository } from 'typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { Product } from '../product/product.entity';
import { Review } from './review.entity';

@EntityRepository(Review)
export class ReviewRepository extends Repository<Review> {
  async createReview(purchaseDate: string, productId: number): Promise<object> {
    const product = new Product();
    product.id = productId;
    const review = this.buildCreateReview(purchaseDate, product);
    return await this.save(review);
  }

  async deleteReviewByProduct(productId: number): Promise<object> {
    const product = new Product();
    product.id = productId;
    const result = await this.createQueryBuilder()
      .delete()
      .where({
        product: product,
      })
      .execute();

    return result.raw;
  }

  private buildCreateReview(date: string, product: Product): object[] {
    const review: object[] = [];

    for (let i = 0; i < 100; i++) {
      review.push({
        date: this.getNextDates(date, i),
        product: product,
        status: 'A Revisar',
      });
    }

    return review;
  }

  private getNextDates(date: string, index: number): string {
    const currentYear = date.split('/')[2];
    const newYear = (parseInt(currentYear) + index + 1).toString();
    return date.replace(currentYear, newYear);
  }
}
