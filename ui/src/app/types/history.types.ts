import { Observable } from "rxjs";
import { HistoryBooking } from "./storage.types";

export interface CalculatedHistoryItem {
    timestamp: Date;
    type: CalculatedTypeEnum;
    ongoing: boolean;
    booking?: HistoryBooking;
    amount$?: Observable<number>;
}

export enum CalculatedTypeEnum {
    booking,
    active_time,
    break_time,
}
