import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtStrategy } from './domain/auth/jwt.strategy';
import { DomainModule } from './domain/domain.module';
import * as config from './ormconfig';

@Module({
  imports: [TypeOrmModule.forRoot(config), DomainModule],
  controllers: [AppController],
  providers: [AppService, JwtStrategy],
})
export class AppModule {}
