import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { JoiPipe } from 'nestjs-joi';
import { GetFreeRoomsQueryDto } from './dto/get-room-query.dto';
import { GetRoomsLoadQueryDto } from './dto/get-rooms-load-query.dto';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) { }

  @Get()
  findAll(
    @Query(JoiPipe) query: GetFreeRoomsQueryDto,
  ) {
    return this.roomsService.findFreeRooms(query.date_in, query.date_out);
  }

  @Get('average-load')
  roomsAverageLoad(
    @Query(JoiPipe) query: GetRoomsLoadQueryDto,
  ) {
    return this.roomsService.getsRoomsLoad(query.date_from, query.date_to);
  }

}
