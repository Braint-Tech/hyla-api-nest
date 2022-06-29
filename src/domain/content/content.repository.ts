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
}
