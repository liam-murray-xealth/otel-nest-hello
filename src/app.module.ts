import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ConfigModule } from '@nestjs/config'
import { PostsModule } from './posts/posts.module'
import { MemoryleakModule } from './memoryleak/memoryleak.module'

@Module({
  imports: [ConfigModule.forRoot(), PostsModule, MemoryleakModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
