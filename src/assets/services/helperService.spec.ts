import { HelperService } from './helperService';

describe('HelperService', () => {
    const service = new HelperService();

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should return correct value of difference in days', () => {

        const date1 = new Date('2021-09-21');
        const date2 = new Date('2021-09-30');

        const differenceInDays = service.differenceInDays(date1, date2);
        expect(differenceInDays).toEqual(9);
    });

    it('should return correct value of reservation price', () => {

        const reservationPriceOf9days = service.calculateReservationPrice(9);
        const reservationPriceOf11days = service.calculateReservationPrice(11);
        const reservationPriceOf23days = service.calculateReservationPrice(23);

        expect(reservationPriceOf9days).toEqual(9000);
        expect(reservationPriceOf11days).toEqual(9900);
        expect(reservationPriceOf23days).toEqual(18400);
    });

    it('should return correct formatted date value', () => {

        const date = new Date('1963-11-22');

        const formattedDateString = service.formatDate(date);
        expect(formattedDateString).toEqual('1963-11-22');
        expect(
            typeof formattedDateString
        ).toEqual('string')
    });

});