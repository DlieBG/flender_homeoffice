import { ResponseDto } from "./atoss.types";

export interface Credentials {
    personal_number: string;
    pin: string;
}

export interface HistoryBooking {
    timestamp: Date;
    booking: ResponseDto;
}
