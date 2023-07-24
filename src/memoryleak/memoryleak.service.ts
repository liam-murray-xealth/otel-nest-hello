import { Injectable } from '@nestjs/common'
import { CreateMemoryleakDto } from './dto/create-memoryleak.dto'
import { UpdateMemoryleakDto } from './dto/update-memoryleak.dto'

type Getter = () => number
function createGetter(elementCount: number) {
  // Create an array containing numbers from 0 to elementCount value
  let elements = Array.from(Array(elementCount).keys())

  return function getRandomElement() {
    // return a random number
    return elements[Math.floor(Math.random() * elements.length)]
  }
}

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

@Injectable()
export class MemoryleakService {
  private getters: Getter[] = []

  // create(createMemoryleakDto: CreateMemoryleakDto) {
  //   return 'This action adds a new memoryleak'
  // }

  createClosureLeak() {
    for (let idx = 0; idx < 10; ++idx) {
      this.getters.push(createGetter(getRandomInt(1024, 1024 * 1024)))
    }
  }
}
