import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ContentRepository } from './content.repository';
import { ContentDto } from './content.dto';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(ContentRepository)
    private contentRepository: ContentRepository,
  ) {}

  async createContent(contentDto: ContentDto): Promise<object> {
    if (contentDto.type === '1') {
      const amountContent = await this.contentRepository.count();
      if (amountContent > 5) return null;
    }
    return await this.contentRepository.createContent(contentDto);
  }

  async findContent(idContent: number): Promise<object> {
    return await this.contentRepository.findContent(idContent);
  }

  async listContent(
    offset: number,
    limit: number,
    title: string,
    type: string,
  ): Promise<any> {
    return await this.contentRepository.listContent(offset, limit, title, type);
  }

  async updateContent(contentDto: ContentDto, idContent: number): Promise<any> {
    return await this.contentRepository.updateContent(contentDto, idContent);
  }

  async deleteContent(idContent: number): Promise<any> {
    return await this.contentRepository.deleteContent(idContent);
  }

  async findProductContent(): Promise<object> {
    return await this.contentRepository.findProductContent();
  }

  async listBlogContent(offset: number, limit: number): Promise<any> {
    return await this.contentRepository.listBlogContent(offset, limit);
  }

  async listVideoContent(offset: number, limit: number): Promise<any> {
    return await this.contentRepository.listVideoContent(offset, limit);
  }
}
