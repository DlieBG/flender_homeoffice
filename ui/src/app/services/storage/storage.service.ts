import { Injectable } from '@angular/core';
import { Credentials, HistoryBooking } from '../../types/storage.types';
import { ResponseDto } from '../../types/atoss.types';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  hasCredentials(): boolean {
    return !!localStorage.getItem('personal_number') && !!localStorage.getItem('pin');
  }

  getCredentials(): Credentials {
    return {
      personal_number: localStorage.getItem('personal_number') ?? '',
      pin: localStorage.getItem('pin') ?? '',
    };
  }

  setCredentials(credentials: Credentials) {
    localStorage.setItem('personal_number', credentials.personal_number);
    localStorage.setItem('pin', credentials.pin);
  }

  resetCredentials() {
    localStorage.removeItem('personal_number');
    localStorage.removeItem('pin');
  }

  getBookingHistory(): HistoryBooking[] {
    let history: HistoryBooking[] = JSON.parse(localStorage.getItem('history') ?? '[]');

    history = history.filter(
      (bookingHistory) => {
        return new Date(bookingHistory.timestamp).toDateString() == new Date().toDateString();
      }
    );

    localStorage.setItem('history', JSON.stringify(history));

    return history;
  }

  addBooking(booking: ResponseDto) {
    let history: HistoryBooking[] = JSON.parse(localStorage.getItem('history') ?? '[]');

    history.push({
      timestamp: new Date(),
      booking: booking,
    });

    localStorage.setItem('history', JSON.stringify(history));
  }

}
