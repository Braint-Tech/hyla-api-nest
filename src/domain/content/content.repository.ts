import { EntityRepository } from 'typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { User } from '../user/user.entity';
import { ContentDto } from './content.dto';
import { Content } from './content.entity';

@EntityRepository(Content)
export class ContentRepository extends Repository<Content> {
  async createContent(contentDto: ContentDto): Promise<object> {
    const user = new User();
    user.id = contentDto.userId;
    const content = this.create(contentDto);
    content.user = user;
    return await this.save(content);
  }

  async findContent(idContent: number): Promise<Content> {
    return await this.findOne({
      select: ['title', 'link', 'type', 'image', 'date'],
      where: { id: idContent },
    });
  }

  async listContent(
    offset: number,
    limit: number,
    title: string,
    type: string,
  ): Promise<object[]> {
    const filter = this.createFilterListContent(title, type);
    const [list, count] = await Promise.all([
      this.createQueryBuilder()
        .distinct()
        .select(['id', 'title', 'type', 'link', 'image', 'date'])
        .where(filter)
        .offset(offset)
        .limit(limit)
        .getRawMany(),
      this.count({
        where: filter,
      }),
    ]);

    return [list, { totalContent: count }];
  }

  private createFilterListContent(title: string, type: string): object {
    if (title !== undefined && type !== undefined)
      return { title: title, type: type };
    else if (title !== undefined && type === undefined) return { title: title };
    else if (title === undefined && type !== undefined) return { type: type };
    else return {};
  }

  async updateContent(
    contentDto: ContentDto,
    idContent: number,
  ): Promise<Content> {
    const result = await this.createQueryBuilder()
      .update({
        title: contentDto.title,
        link: contentDto.link,
        image: contentDto.image,
        date: contentDto.date,
      })
      .where({
        id: idContent,
      })
      .execute();

    return result.raw[0];
  }

  async deleteContent(idContent: number): Promise<Content> {
    const result = await this.createQueryBuilder()
      .delete()
      .where({
        id: idContent,
      })
      .execute();

    return result.raw;
  }
}
