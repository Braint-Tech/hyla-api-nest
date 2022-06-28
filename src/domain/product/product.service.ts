import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductRepository } from './product.repository';
import * as csvToJson from 'csvtojson';

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
}
