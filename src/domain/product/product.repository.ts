import { EntityRepository } from 'typeorm';
import { Repository } from 'typeorm/repository/Repository';
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
}
