import { Observable } from "rxjs";
import { HistoryBooking } from "./storage.types";

export interface CalculatedHistoryItem {
    type: CalculatedTypeEnum;
    ongoing: boolean;
    booking?: HistoryBooking;
    amount$?: Observable<number>;
}

export enum CalculatedTypeEnum {
    booking,
    calculation,
}
