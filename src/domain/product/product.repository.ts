import { EntityRepository } from 'typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { Product } from './product.entity';

@EntityRepository(Product)
export class ProductRepository extends Repository<Product> {}
