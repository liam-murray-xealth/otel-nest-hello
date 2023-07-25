import { Test, TestingModule } from '@nestjs/testing'
import { MemoryleakController } from './memoryleak.controller'
import { MemoryleakService } from './memoryleak.service'

describe('MemoryleakController', () => {
  let controller: MemoryleakController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MemoryleakController],
      providers: [MemoryleakService],
    }).compile()

    controller = module.get<MemoryleakController>(MemoryleakController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
