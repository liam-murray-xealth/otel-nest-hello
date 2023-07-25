import { Module } from '@nestjs/common'
import { MemoryleakService } from './memoryleak.service'
import { MemoryleakController } from './memoryleak.controller'

@Module({
  controllers: [MemoryleakController],
  providers: [MemoryleakService],
})
export class MemoryleakModule {}
