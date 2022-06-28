import { EntityRepository } from 'typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { Review } from './review.entity';

@EntityRepository(Review)
export class ReviewRepository extends Repository<Review> {}
