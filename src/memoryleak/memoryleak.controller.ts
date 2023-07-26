//import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common'
import { Controller, Get, UseFilters } from '@nestjs/common'
import { MemoryleakService } from './memoryleak.service'
import { CreateTimerleakDto } from './dto/create-timerleak.dto'

import { HttpExceptionFilter } from '../filters/http-exception-filter'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'

@Controller('memoryleak')
@ApiTags('memoryleak')
@UseFilters(HttpExceptionFilter)
export class MemoryleakController {
  constructor(private readonly memoryleakService: MemoryleakService) {}

  @Get('/closure')
  @ApiOkResponse({ description: 'Leak created successfully' })
  closureLeak() {
    return this.memoryleakService.createClosureLeak()
  }

  @Get('/small_string')
  @ApiOkResponse({ description: 'Leak created successfully' })
  smallStringLeak() {
    return this.memoryleakService.createSmallstringLeak()
  }

  @Get('/timeout')
  @ApiOkResponse({
    description: 'Leak created successfully',
    type: CreateTimerleakDto,
  })
  longTimeoutLeak() {
    return this.memoryleakService.createLongTimeoutLeak()
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.memoryleakService.findOne(+id)
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateMemoryleakDto: UpdateMemoryleakDto) {
  //   return this.memoryleakService.update(+id, updateMemoryleakDto)
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.memoryleakService.remove(+id)
  // }
}
