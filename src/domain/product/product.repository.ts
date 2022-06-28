import { EntityRepository } from 'typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { Review } from '../review/review.entity';
import { User } from '../user/user.entity';
import { ProductDto } from './product.dto';
import { Product } from './product.entity';

@EntityRepository(Product)
export class ProductRepository extends Repository<Product> {
  async importProducts(spreadsheetData: any): Promise<object> {
    const products = this.buildImportProducts(spreadsheetData);

    await this.save(products);

    return products;
  }

  private buildImportProducts(spreadsheetData: any): object[] {
    const currentProducts = this.find({ select: ['code'] });
    const products = this.removeEqualProducts(spreadsheetData, currentProducts);
    return products.map((product: any) => {
      return {
        code: product['Serie'],
      };
    });
  }

  private removeEqualProducts(
    spreadsheetData: any,
    currentProducts: any,
  ): object[] {
    for (let i = 0; i < spreadsheetData.length; i++) {
      for (let j = 0; j < currentProducts.length; j++) {
        if (spreadsheetData[i]['Serie'] === currentProducts[j].code) {
          delete spreadsheetData[i];
          break;
        }
      }
    }

    return spreadsheetData.filter((product: any) => product);
  }

  async findProductByCode(code: string): Promise<ProductDto[]> {
    return await this.createQueryBuilder()
      .distinct()
      .leftJoin(User, 'user', 'user.id = product.userId')
      .select(['product.id id', 'user.id userId'])
      .from(Product, 'product')
      .where({ code: code })
      .getRawMany();
  }

  async updateProduct(productDto: ProductDto, code: string): Promise<Product> {
    const user = new User();
    user.id = productDto.userId;

    const result = await this.createQueryBuilder()
      .update({
        purchaseDate: productDto.purchaseDate,
        representativeName: productDto.representativeName,
        user: user,
      })
      .where({
        code: code,
      })
      .execute();

    return result.raw[0];
  }

  async listProduct(
    offset: number,
    limit: number,
    code: string,
  ): Promise<object[]> {
    const [list, count] = await Promise.all([
      this.createQueryBuilder()
        .distinct()
        .select(['product.id', 'product.code', 'user.id'])
        .addSelect(
          (subQuery) =>
            subQuery
              .select('review.status')
              .from(Review, 'review')
              .where(
                `product.userId = user.id AND UNIX_TIMESTAMP(STR_TO_DATE(review.date, '%d/%m/%Y')) > ${
                  Date.now() / 1000
                }`,
              )
              .limit(1)
              .orderBy('review.id'),
          'status',
        )
        .addSelect(
          (subQuery) =>
            subQuery
              .select('review.date')
              .from(Review, 'review')
              .where(
                `product.userId = user.id AND UNIX_TIMESTAMP(STR_TO_DATE(review.date, '%d/%m/%Y')) > ${
                  Date.now() / 1000
                }`,
              )
              .limit(1)
              .orderBy('review.id'),
          'dateNextReview',
        )
        .from(Product, 'product')
        .leftJoin(User, 'user', 'user.id = product.userId')
        .where(code != undefined ? { code: code } : {})
        .offset(offset)
        .limit(limit)
        .orderBy('product.id', 'DESC')
        .getRawMany(),
      this.count({
        where: code != undefined ? { code: code } : {},
      }),
    ]);

    return [list, { totalProduct: count }];
  }
}
