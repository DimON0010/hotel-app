import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { DatabaseModule } from 'src/database/database.module';
import { HelperService } from 'src/assets/services/helperService';

@Module({
  imports: [DatabaseModule],
  controllers: [RoomsController],
  providers: [RoomsService, HelperService,]
})
export class RoomsModule { }
