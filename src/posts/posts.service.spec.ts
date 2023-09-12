import { Test, TestingModule } from '@nestjs/testing'
import { PostsService, CatFact } from './posts.service'
import { HttpModule } from '@nestjs/axios'

describe('PostsService', () => {
  let service: PostsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostsService],
      imports: [HttpModule],
    }).compile()

    service = module.get<PostsService>(PostsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should get cat fact', async () => {
    const fact = await service.getCatFact()
    console.log(JSON.stringify(fact, null, 2))
    expect(fact).toBeDefined()
    expect(fact).toHaveProperty('length')
    expect(fact).toHaveProperty('fact')
  })
})
