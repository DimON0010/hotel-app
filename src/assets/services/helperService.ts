import { RoomLoadResult } from "src/rooms/dto/room-load-result.dto";

export class HelperService {

    formatDate(date: Date): string {
        let d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2)
            month = '0' + month;
        if (day.length < 2)
            day = '0' + day;

        return [year, month, day].join('-');
    }

    differenceInDays = (dateIn: Date, dateOut: Date): number => {
        const differenceInTime = dateOut.getTime() - dateIn.getTime();
        return Math.round(differenceInTime / (1000 * 3600 * 24));
    }

    calculateReservationPrice = (days: number): number => {
        switch (true) {
            case days < 10:
                return days * 1000 || 1000

            case days >= 10 && days < 20:
                return (days * 1000) * 0.9

            case days >= 20:
                return (days * 1000) * 0.8

            default:
                break;
        }
    }

    sortArrayOfRoomLoad(array: RoomLoadResult[]) {
        function compareArr(a: RoomLoadResult, b: RoomLoadResult) {
            if (a.occupiedDays > b.occupiedDays) {
                return -1;
            }
            if (a.occupiedDays < b.occupiedDays) {
                return 1;
            }
            return 0;
        }

        return array.sort(compareArr);

    }

    sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

}