import { Injectable } from '@nestjs/common'
import { CreateTimerleakDto } from './dto/create-timerleak.dto'

// https://betterstack.com/community/guides/scaling-nodejs/high-performance-nodejs/nodejs-memory-leaks/#2-closures

// global data
const data: string[] = []

type Getter = () => number
function createGetter(elementCount: number) {
  // Create an array containing numbers from 0 to elementCount value
  const elements = Array.from(Array(elementCount).keys())

  return function getRandomElement() {
    // return a random number from array
    return elements[Math.floor(Math.random() * elements.length)]
  }
}

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

class Timeouts {
  constructor(private readonly pending = new Set<NodeJS.Timeout>()) {}

  private add(id: NodeJS.Timeout) {
    this.pending.add(id)
  }

  private remove(id: NodeJS.Timeout) {
    this.pending.delete(id)
  }

  private cancel(id: NodeJS.Timeout) {
    clearTimeout(id)
    this.pending.delete(id)
  }

  private cancelAll() {
    for (const id of this.pending.keys()) {
      clearTimeout(id)
    }
    this.pending.clear()
  }
  after(ms: number): Promise<void> {
    return new Promise((resolve, _) => {
      const id = setTimeout(() => {
        this.remove(id)
        resolve()
      }, ms)
      this.add(id)
    })
  }

  async rejectAfter(ms: number): Promise<void> {
    await this.after(ms)
    throw new Error('Timeout')
  }

  getPendingCount() {
    return this.pending.size
  }
}

@Injectable()
export class MemoryleakService {
  private getters: Getter[] = []

  private timeouts = new Timeouts()

  // create(createMemoryleakDto: CreateMemoryleakDto) {
  //   return 'This action adds a new memoryleak'
  // }

  createClosureLeak() {
    for (let idx = 0; idx < 10; ++idx) {
      this.getters.push(createGetter(getRandomInt(1024, 1024 * 1024)))
    }
  }

  createSmallstringLeak() {
    const generateRandomString = () => {
      // crypto.randomBytes(20).toString('hex');
      let out = ''
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      const length = getRandomInt(25, 1024)
      for (let idx = 0; idx < length; ++idx) {
        out += chars[getRandomInt(0, chars.length - 1)]
      }
      return out
    }
    for (let idx = 0; idx < 1000; ++idx) {
      data.push(generateRandomString())
    }
  }

  createLongTimeoutLeak(count: number = 100): CreateTimerleakDto {
    const ONE_SECOND_MS = 1000
    const ONE_MINUTE_MS = 60 * ONE_SECOND_MS
    const TEN_MINUTES_MS = ONE_MINUTE_MS * 10
    for (let idx = 0; idx < count; ++idx) {
      void this.timeouts.after(getRandomInt(ONE_SECOND_MS, TEN_MINUTES_MS))
    }
    return {
      pending: this.timeouts.getPendingCount(),
      count,
    }
  }
}
