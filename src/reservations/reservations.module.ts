import { Module } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { DatabaseModule } from 'src/database/database.module';
import { HelperService } from 'src/assets/services/helperService';

@Module({
  imports: [DatabaseModule],
  controllers: [ReservationsController],
  providers: [ReservationsService, HelperService,],
})
export class ReservationsModule {}
