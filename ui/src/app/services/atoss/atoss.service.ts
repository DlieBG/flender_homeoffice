import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BalanceRequestDto, BookingRequestDto, ResponseDto } from '../../types/atoss.types';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AtossService {

  constructor(
    private httpClient: HttpClient,
  ) { }

  getBalance(dto: BalanceRequestDto): Observable<ResponseDto> {
    return this.httpClient.post<ResponseDto>('api/balance', dto);
  }

  postBooking(dto: BookingRequestDto): Observable<ResponseDto> {
    return this.httpClient.post<ResponseDto>('api/booking', dto);
  }

}
