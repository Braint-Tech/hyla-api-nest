import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewRepository } from './review.repository';

@Module({ imports: [TypeOrmModule.forFeature([ReviewRepository])] })
export class ReviewModule {}
