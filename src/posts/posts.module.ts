import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PostsService } from './posts.service'
import { PostsController } from './posts.controller'
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [ConfigModule.forRoot(), HttpModule],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
