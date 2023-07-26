import { PartialType } from '@nestjs/swagger'
import { CreateMemoryleakDto } from './create-memoryleak.dto'

export class CreateTimerleakDto extends PartialType(CreateMemoryleakDto) {
  pending: number
  count: number
}
