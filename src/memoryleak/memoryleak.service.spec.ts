import { Test, TestingModule } from '@nestjs/testing'
import { MemoryleakService } from './memoryleak.service'

describe('MemoryleakService', () => {
  let service: MemoryleakService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MemoryleakService],
    }).compile()

    service = module.get<MemoryleakService>(MemoryleakService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
