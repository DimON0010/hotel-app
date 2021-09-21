export class Reservation { }
export interface IReservation {
    id?: number;
    room_id: number;
    date_in: string;
    date_out: string;
    price: number;
    created_at?: string;
    updated_at?: string;
}
export interface ICreateReservation {
    room_id: number;
    date_in: string;
    date_out: string;
    price: number;
}