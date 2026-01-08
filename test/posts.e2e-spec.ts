import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from './../src/app.module'
import { PostModel } from '../src/posts/posts.interface'

describe('PostsController (e2e)', () => {
  let app: INestApplication

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  it('should support full CRUD lifecycle for posts', async () => {
    const server = app.getHttpServer()

    // 1. Get all posts (should be empty initially)
    await request(server).get('/posts').expect(200).expect([])

    // 2. Create a new post
    const newPost: PostModel = {
      date: new Date(),
      title: 'Test Post',
      body: 'This is a test post',
      category: 'testing',
    }

    const createResponse = await request(server).post('/posts').send(newPost).expect(201)

    const createdPost = createResponse.body
    expect(createdPost.id).toBeDefined()
    expect(createdPost.title).toBe(newPost.title)

    // 3. Get the created post
    await request(server)
      .get(`/posts/${createdPost.id}`)
      .expect(200)
      .expect(res => {
        expect(res.body.title).toBe(newPost.title)
      })

    // 4. Update the post
    const updateData = { ...createdPost, title: 'Updated Title' }
    await request(server)
      .put(`/posts/${createdPost.id}`)
      .send(updateData)
      .expect(200)
      .expect(res => {
        expect(res.body.title).toBe('Updated Title')
      })

    // 5. Delete the post
    await request(server).delete(`/posts/${createdPost.id}`).expect(200)

    // 6. Verify post is gone
    await request(server).get(`/posts/${createdPost.id}`).expect(404)
  })
})
