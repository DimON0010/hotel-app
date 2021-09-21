import { Injectable } from '@nestjs/common';
import { HelperService } from 'src/assets/services/helperService';
import { IReservation } from 'src/reservations/entities/reservation.entity';
import { DatabaseService } from '../database/database.service';
import { RoomLoadResult } from './dto/room-load-result.dto';
import { IRoom } from './entities/room.entity';

@Injectable()
export class RoomsService {

  constructor(
    private databaseService: DatabaseService,
    private helperService: HelperService,
  ) {
  }

  async findFreeRooms(dateIn: string, dateOut: string): Promise<IRoom[]> {
    try {


      let dateInFormat = this.helperService.formatDate(new Date(dateIn));

      let dateOutFormat = this.helperService.formatDate(new Date(dateOut));


      const occupiedRooms = (await this.databaseService.executeQuery(`
      SELECT * FROM reservations WHERE 
        date_in BETWEEN '${dateInFormat}' AND '${dateOutFormat}' 
        OR date_out BETWEEN  '${dateInFormat}' AND '${dateOutFormat}'
        OR date_in BETWEEN '${dateInFormat}' AND '${dateOutFormat}' AND date_out BETWEEN  '${dateInFormat}' AND '${dateOutFormat}' 
        `)).map((res: IReservation) => res.room_id);

      if (occupiedRooms.length) {
        return await this.databaseService.executeQuery(`
        SELECT * FROM rooms WHERE id NOT IN (${occupiedRooms});
        `);
      }

      return await this.databaseService.executeQuery(`
      SELECT * FROM rooms;
      `);

    } catch (e) {
      console.error(e);
    }
  }

  async getsRoomsLoad(dateFrom: string, dateTo: string): Promise<RoomLoadResult[]> {
    try {

      const dateFromObj = new Date(dateFrom);
      const dateToObj = new Date(dateTo);

      const result: RoomLoadResult[] = [];

      const reservations = await this.databaseService.executeQuery(`
      SELECT * FROM reservations 
      WHERE date_in BETWEEN '${this.helperService.formatDate(dateFromObj)}' AND '${this.helperService.formatDate(dateToObj)}'
      OR date_out BETWEEN '${this.helperService.formatDate(dateFromObj)}' AND '${this.helperService.formatDate(dateToObj)}';
      `)
      const transformedReservation = reservations.map((reservation: IReservation) => {
        if (dateFrom > reservation.date_in) {
          reservation.date_in = dateFrom;
        } else if (dateTo < reservation.date_out) {
          reservation.date_out = dateTo;
        }

        return reservation;
      })

      transformedReservation.forEach((res: IReservation) => {
        return result.push(
          {
            roomNumber: res.room_id,
            occupiedDays: this.helperService.differenceInDays(new Date(res.date_in), new Date(res.date_out)),
          })
      })

      return this.helperService.sortArrayOfRoomLoad(result);

    } catch (e) {
      console.error(e);
      throw e;
    }
  }

}
