import { Injectable, NotFoundException, UnprocessableEntityException, Logger } from '@nestjs/common'
import { PostModel } from './posts.interface'
import { HttpModule, HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'

export type CatFact = {
  fact: string
  length: number
}

@Injectable()
export class PostsService {
  private posts: PostModel[] = []
  private readonly logger = new Logger(PostsService.name)

  constructor(private readonly httpService: HttpService) { }
  public findAll(): Array<PostModel> {
    return this.posts
  }

  public findOne(id: number): PostModel {
    const post = this.posts.find(post => post.id === id)
    if (!post) {
      throw new NotFoundException('Post not found.')
    }

    return post
  }

  public async getCatFact(): Promise<CatFact> {
    // https://apipheny.io/free-api/
    // https://catfact.ninja/
    const fact = 'https://catfact.ninja/fact'
    const resp = await firstValueFrom(this.httpService.get<CatFact>(fact))
    return resp.data
  }

  public async create(post: PostModel): Promise<PostModel> {
    // if the title is already in use by another post
    const titleExists = this.posts.some(item => item.title === post.title)
    if (titleExists) {
      throw new UnprocessableEntityException('Post title already exists.')
    }

    if (!post.body.length) {
      const fact = await this.getCatFact()
      post = {
        ...post,
        body: fact.fact,
        category: 'cat_fact',
      }
    }

    // find the next id for a new blog post
    const maxId: number = this.posts.length > 0 ? Math.max(...this.posts.map(post => post.id || 0)) : -1
    const id: number = maxId + 1

    const blogPost: PostModel = {
      ...post,
      id,
    }

    this.posts.push(blogPost)

    return blogPost
  }

  public delete(id: number): void {
    const index: number = this.posts.findIndex(post => post.id === id)

    // -1 is returned when no findIndex() match is found
    if (index === -1) {
      throw new NotFoundException('Post not found.')
    }

    this.posts.splice(index, 1)
  }

  public update(id: number, post: PostModel): PostModel {
    this.logger.log(`Updating post with id: ${id}`)

    const index: number = this.posts.findIndex(post => post.id === id)

    // -1 is returned when no findIndex() match is found
    if (index === -1) {
      throw new NotFoundException('Post not found.')
    }

    // if the title is already in use by another post
    const titleExists: boolean = this.posts.some(
      item => item.title === post.title && item.id !== id
    )
    if (titleExists) {
      throw new UnprocessableEntityException('Post title already exists.')
    }

    const blogPost: PostModel = {
      ...post,
      id,
    }

    this.posts[index] = blogPost

    return blogPost
  }
}
