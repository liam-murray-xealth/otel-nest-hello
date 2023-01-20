import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PostsService } from './posts.service'
import { PostsController } from './posts.controller'

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
