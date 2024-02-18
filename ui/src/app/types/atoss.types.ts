export enum ActionEnum {
    start = 'Kommen',
    stop = 'Gehen',
}

export enum TypeEnum {
    homeoffice = 'HB',
    trip = '10',
}

export interface ResponseDto {
    personal_number: string;
    name: string;
    booked_time: string;
    action?: ActionEnum;
    type?: TypeEnum;
    flexi_date: string;
    flexi_balance: string;
}

export interface BalanceRequestDto {
    personal_number: string;
    pin: string;
}

export interface BookingRequestDto {
    personal_number: string;
    pin: string;
    action: ActionEnum;
    type: TypeEnum;
}

