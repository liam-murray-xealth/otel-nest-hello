import { PartialType } from '@nestjs/swagger'
import { CreateMemoryleakDto } from './create-memoryleak.dto'

export class UpdateMemoryleakDto extends PartialType(CreateMemoryleakDto) {}
