import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductRepository } from './product.repository';
import * as csvToJson from 'csvtojson';
import { ProductDto } from './product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductRepository)
    private productRepository: ProductRepository,
  ) {}

  async importProduct(file: any): Promise<object> {
    const spreadsheetData = await this.convertCSVtoJSON(
      file.buffer.toString(),
      ',',
    );

    const spreadsheetDataFiltered = this.filterSpreadsheetData(spreadsheetData);

    return await this.productRepository.importProducts(spreadsheetDataFiltered);
  }

  private async convertCSVtoJSON(
    string: string,
    delimiter: string,
  ): Promise<object> {
    return await csvToJson({ delimiter }).fromString(string);
  }

  private filterSpreadsheetData(data: any): object[] {
    return data.filter(
      (value: any, index: any, array: any[]) =>
        array.findIndex((index2) => index2['Serie'] === value['Serie']) ===
        index,
    );
  }

  async productVerification(code: string): Promise<object> {
    const product = await this.productRepository.findProductByCode(code);

    if (product.length > 0) {
      if (product[0].userId == null)
        return { message: 'Product found successfully!' };
      else
        return {
          message: 'Product found successfully and already has a user!',
        };
    } else return { message: 'Product not found in the database!' };
  }

  async updateProduct(productDto: ProductDto, code: string): Promise<any> {
    try {
      await this.productRepository.updateProduct(productDto, code);

      return { success: true };
    } catch (error) {
      return error;
    }
  }

  async listProduct(offset: number, limit: number, code: string): Promise<any> {
    return await this.productRepository.listProduct(offset, limit, code);
  }

  async findOneByCode(code: string): Promise<ProductDto> {
    return this.productRepository.findOne({ where: { code: code } });
  }

  async findProduct(code: string): Promise<any> {
    return this.productRepository.findProduct(code);
  }
}
