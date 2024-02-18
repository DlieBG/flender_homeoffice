import { Component, OnInit } from '@angular/core';
import { ActionEnum, ResponseDto, TypeEnum } from '../../types/atoss.types';
import { AtossService } from '../../services/atoss/atoss.service';
import { Observable, catchError, of } from 'rxjs';
import { StorageService } from '../../services/storage/storage.service';
import { Router } from '@angular/router';
import { Credentials } from '../../types/storage.types';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  type: TypeEnum = TypeEnum.homeoffice;

  balance$!: Observable<ResponseDto>;

  ActionEnum = ActionEnum;
  TypeEnum = TypeEnum;

  constructor(
    private snackbar: MatSnackBar,
    private router: Router,
    private storageService: StorageService,
    private atossSerivce: AtossService,
  ) { }

  ngOnInit(): void {
    if (!this.storageService.hasCredentials())
      this.logout();

    this.getBalance();
  }

  logout() {
    this.storageService.resetCredentials();
    this.router.navigate(['/', 'login']);
  }

  getBalance() {
    const credentials: Credentials = this.storageService.getCredentials();

    this.balance$ = this.atossSerivce
      .getBalance({
        personal_number: credentials.personal_number,
        pin: credentials.pin,
      })
      .pipe(
        catchError((e) => {
          this.logout();

          return of(e);
        }),
      );
  }

  postBooking(action: ActionEnum) {
    const credentials: Credentials = this.storageService.getCredentials();

    this.atossSerivce
      .postBooking({
        personal_number: credentials.personal_number,
        pin: credentials.pin,
        action: action,
        type: this.type,
      })
      .subscribe({
        next: (booking) => {
          this.storageService.addBooking(booking);

          this.snackbar.open(
            'Erfolgreich gebucht!',
            '',
            {
              duration: 3000,
            }
          );
        },
        error: (e) => {
          this.snackbar.open(
            'Ein Fehler ist aufgetreten! :(',
            '',
            {
              duration: 3000,
            }
          );

          this.logout();
        },
      });
  }

  calculateHistory() {
    return this.storageService.getBookingHistory().reverse();
  }

  isActive(): boolean {
    return this.storageService.getBookingHistory().reverse()[0].booking.action == ActionEnum.start;
  }

}
