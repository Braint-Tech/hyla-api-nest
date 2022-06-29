import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ProductModule } from './product/product.module';
import { ReviewModule } from './review/review.module';
import { ContentModule } from './content/content.module';

@Module({
  imports: [UserModule, AuthModule, ProductModule, ReviewModule, ContentModule],
})
export class DomainModule {}
