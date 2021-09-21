import * as fs from 'fs';
import { IRoom } from '../../rooms/entities/room.entity';
import { ICreateReservation, IReservation } from '../../reservations/entities/reservation.entity';
import * as faker from 'faker';
import { DaysOfWeek } from '../../assets/enums/daysOfWeek.enum';
import { HelperService } from '../../assets/services/helperService';
import * as fastcsv from 'fast-csv';
import contains from 'validator/lib/contains';

const { Pool } = require('pg');
const { host, user, database, password, port } = require('../../database/config');

const pool = new Pool({
    host,
    user,
    database,
    password,
    port,
});

const helperService = new HelperService();
const insertFromCsv = (query: string) => {
    let csvData = [];
    return (
        fastcsv
            .parse()
            .validate((data) => !contains(data[0], ','))
            .on('data', (data) => {
                csvData.push(data);
            })
            .on('data-invalid', (row, rowNumber) =>
                console.log(
                    `Invalid [rowNumber=${rowNumber}] [row=${JSON.stringify(row)}]`
                )
            )
            .on('end', () => {

                pool.connect().then(
                    (client) => {
                        try {
                            csvData.forEach((row) => {
                                client.query(query, row, (err, res) => {
                                    if (err) {
                                        console.log(err.stack);
                                    } else {
                                        console.log('inserted ' + res.rowCount + ' row:', row);
                                    }
                                });
                            });
                        } catch (e) {
                            console.log(e);
                        }
                    }
                );
            })
    );
}
const seedDB = async () => {

    try {
        await pool.connect();
        const roomsOutput = './src/database/roomsOutput.csv';
        const roomsStream = fs.createWriteStream(roomsOutput);

        const reservationsOutput = './src/database/reservationsOutput.csv';
        const reservationsStream = fs.createWriteStream(reservationsOutput);

        const reservationsCount = 15;
        const roomsCount = 30;

        const createRoomTranslation = (room: IRoom): string => {
            return `${room.id},${room.number},${room.smoke},${room.created_at},${room.updated_at}\n`;
        }

        const createReservationTranslation = (reservation: IReservation): string => {
            return `${reservation.room_id},${reservation.date_in},${reservation.date_out},${reservation.price}\n`;
        }

        const generateRooms = (count): IRoom[] => {
            const rooms: IRoom[] = [];

            for (let i = 0; i < count; i++) {

                const room: IRoom = {
                    id: i + 1,
                    number: i + 1,
                    smoke: faker.datatype.boolean(),
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                };
                rooms.push(room);
            }

            return rooms;
        }

        const generateReservations = (count): IReservation[] => {
            const reservations: ICreateReservation[] = [];
            const usedRooms: number[] = [];
            const getRoomId = (): number => {

                const roomId = faker.datatype.number({
                    'min': 1,
                    'max': roomsCount
                });

                if (usedRooms.indexOf(roomId) === -1) {
                    usedRooms.push(roomId);
                    return roomId
                } else {
                    return getRoomId()
                }
            }

            for (let i = 0; i < count; i++) {

                const dateIn = new Date();
                dateIn.setDate(dateIn.getDate() + faker.datatype.number({
                    'min': 1,
                    'max': 30
                }));

                const dateOut = new Date(JSON.parse(JSON.stringify(dateIn)));
                dateOut.setDate(dateOut.getDate() + faker.datatype.number({
                    'min': 1,
                    'max': 30
                }));

                if (dateIn.getDay() === DaysOfWeek.Monday || dateIn.getDay() === DaysOfWeek.Thursday) {
                    dateIn.setDate(dateIn.getDate() + 1)
                } else if (dateOut.getDay() === DaysOfWeek.Monday || dateOut.getDay() === DaysOfWeek.Thursday) {
                    dateOut.setDate(dateOut.getDate() + 1)
                }

                const differenceInDays = helperService.differenceInDays(dateIn, dateOut);
                const price = helperService.calculateReservationPrice(differenceInDays) || 1000;

                const reservation: ICreateReservation = {
                    room_id: getRoomId(),
                    date_in: dateIn.toISOString(),
                    date_out: dateOut.toISOString(),
                    price: price,
                };
                reservations.push(reservation);
            }

            return reservations;
        }

        const generatedRooms = generateRooms(roomsCount);
        const generatedReservations = generateReservations(reservationsCount);


        generatedRooms.forEach(element => {
            roomsStream.write(createRoomTranslation(element), 'utf-8');
        });
        roomsStream.end();

        generatedReservations.forEach(element => {
            reservationsStream.write(createReservationTranslation(element), 'utf-8');
        })
        reservationsStream.end();

        const seedRooms = () => new Promise((resolve, reject) => {
            const readableRoomsStream = fs.createReadStream(roomsOutput);
            readableRoomsStream.pipe(insertFromCsv('INSERT INTO rooms (id, number, smoke, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)'));
            readableRoomsStream.on('end', () => resolve('Rooms have been seeded.'));
            readableRoomsStream.on('error', reject);
        })


        const seedReservations = () => new Promise((resolve, reject) => {
            const readableReservationsStream = fs.createReadStream(reservationsOutput);
            readableReservationsStream.pipe(insertFromCsv('INSERT INTO reservations (room_id, date_in, date_out, price) VALUES ($1, $2, $3, $4)'));
            readableReservationsStream.on('end', () => resolve('Reservations have been seeded.'));
            readableReservationsStream.on('error', reject);
        })


        seedRooms()
        await helperService.sleep(3000);
        seedReservations()

    } catch (error) {
        console.error(error.stack);
    } finally {
        console.log('Seeding completed.')
    }

}

seedDB();