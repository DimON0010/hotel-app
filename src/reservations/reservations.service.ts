import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DaysOfWeek } from '../assets/enums/daysOfWeek.enum';
import { HelperService } from '../assets/services/helperService';
import { DatabaseService } from '../database/database.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(
    private databaseService: DatabaseService,
    private helperService: HelperService,
  ) { }

  async createReservation(createReservationDto: CreateReservationDto) {
    try {

      const { room_id, date_in, date_out } = createReservationDto;

      const dateIn = new Date(date_in);
      const dateOut = new Date(date_out);

      const todayIso = new Date().toISOString();


      if (dateIn.getDay() === DaysOfWeek.Monday || dateIn.getDay() === DaysOfWeek.Thursday) {
        throw new HttpException({
          statusCode: HttpStatus.NOT_ACCEPTABLE,
          message: "The day_in cannot be Monday or Thursday",
          error: "Not Acceptable"
        }, HttpStatus.NOT_ACCEPTABLE)
      } else if (dateOut.getDay() === DaysOfWeek.Monday || dateOut.getDay() === DaysOfWeek.Thursday) {
        throw new HttpException({
          statusCode: HttpStatus.NOT_ACCEPTABLE,
          message: "The day_out cannot be Monday or Thursday",
          error: "Not Acceptable"
        }, HttpStatus.NOT_ACCEPTABLE)
      } else if (dateIn.toISOString() < todayIso || dateOut.toISOString() < todayIso) {
        throw new HttpException({
          statusCode: HttpStatus.NOT_ACCEPTABLE,
          message: "Invalid date_in or date_out. Date must be at least today.",
          error: "Not Acceptable"
        }, HttpStatus.NOT_ACCEPTABLE)
      } else if (dateIn.toISOString() >  dateOut.toISOString()) {
        throw new HttpException({
          statusCode: HttpStatus.NOT_ACCEPTABLE,
          message: "date_in cannot be less than date_out.",
          error: "Not Acceptable"
        }, HttpStatus.NOT_ACCEPTABLE)
      }

      const existedReservations = await this.databaseService.executeQuery(`
      SELECT * FROM reservations 
      WHERE room_id = ${room_id} 
      AND date_in BETWEEN '${this.helperService.formatDate(new Date(date_in))}' AND '${this.helperService.formatDate(new Date(date_out))}'
      OR date_out BETWEEN '${this.helperService.formatDate(new Date(date_in))}' AND '${this.helperService.formatDate(new Date(date_out))}';
      `)

      if (existedReservations) {
        throw new HttpException({
          statusCode: HttpStatus.NOT_ACCEPTABLE,
          message: "This room is unavailable on the given date.",
          error: "Not Acceptable"
        }, HttpStatus.NOT_ACCEPTABLE)
      }

      const price = this.helperService.calculateReservationPrice(
        this.helperService.differenceInDays(
          new Date(date_in),
          new Date(date_out)
        )
      );

      return await this.databaseService.executeQuery(`
        INSERT INTO reservations(room_id, date_in, date_out, price)
        VALUES (${room_id}, '${this.helperService.formatDate(new Date(date_in))}', '${this.helperService.formatDate(new Date(date_out))}', ${price})
        RETURNING *;
      `);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  findAll() {
    try {

      return this.databaseService.executeQuery(`
      SELECT * FROM reservations
      `);

    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  findOne(id: number) {
    try {

      return this.databaseService.executeQuery(`
      SELECT * FROM reservations WHERE id = ${id}
      `);

    } catch (e) {
      console.error(e);
      throw e;
    }
  }

}
