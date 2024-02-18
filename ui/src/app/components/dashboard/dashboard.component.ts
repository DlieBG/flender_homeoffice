import { Component, OnInit } from '@angular/core';
import { ActionEnum, ResponseDto, TypeEnum } from '../../types/atoss.types';
import { AtossService } from '../../services/atoss/atoss.service';
import { Observable, catchError, combineLatest, combineLatestWith, map, of, timer } from 'rxjs';
import { StorageService } from '../../services/storage/storage.service';
import { Router } from '@angular/router';
import { Credentials, HistoryBooking } from '../../types/storage.types';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CalculatedHistoryItem, CalculatedTypeEnum } from '../../types/history.types';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  type: TypeEnum = this.isTrip() ? TypeEnum.trip : TypeEnum.homeoffice;

  balance$!: Observable<ResponseDto>;

  history!: CalculatedHistoryItem[];
  sum$!: Observable<number>;

  ActionEnum = ActionEnum;
  TypeEnum = TypeEnum;
  CalculatedTypeEnum = CalculatedTypeEnum;

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
    this.calculateHistory();
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
          this.calculateHistory();

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

  clear() {
    localStorage.setItem('history', '[]');
    this.calculateHistory();
  }

  calculateHistory() {
    let calculated_history: CalculatedHistoryItem[] = [];
    let history: HistoryBooking[] = this.storageService.getBookingHistory();

    for (let i = 0; i < history.length; i++) {
      calculated_history.push({
        type: CalculatedTypeEnum.booking,
        ongoing: false,
        booking: history[i],
      });

      if (history[i].booking.action == ActionEnum.start) {
        if (history.length > i + 1 && history[i + 1].booking.action == ActionEnum.stop) {
          calculated_history.push({
            type: CalculatedTypeEnum.calculation,
            ongoing: false,
            amount$: of(
              (new Date(history[i + 1].timestamp).getTime() - new Date(history[i].timestamp).getTime()) / 3600000
            ),
          });
        }
        else if (history.length == i + 1) {
          calculated_history.push({
            type: CalculatedTypeEnum.calculation,
            ongoing: true,
            amount$: timer(0, 250).pipe(
              map(
                () => {
                  return (new Date().getTime() - new Date(history[i].timestamp).getTime()) / 3600000 as number;
                }
              ),
            ),
          });
        }
      }
    }

    this.history = calculated_history.reverse();
    this.sum$ = of(0).pipe(
      combineLatestWith(
        calculated_history.filter(
          (ch) => {
            return !!ch.amount$;
          }
        ).map(
          (ch) => {
            return ch.amount$;
          }
        )
      ),
      map(
        (amounts: any[]) => {
          return amounts.reduce(
            (partial, a) => {
              return partial + a;
            }
          );
        }
      )
    );
  }

  isActive(): boolean {
    try {
      return this.storageService.getBookingHistory().reverse()[0].booking.action == ActionEnum.start;
    } catch {
      return false;
    }
  }

  isTrip(): boolean {
    try {
      return this.storageService.getBookingHistory().reverse()[0].booking.action == ActionEnum.start
        && this.storageService.getBookingHistory().reverse()[0].booking.type == TypeEnum.trip;
    } catch {
      return false;
    }
  }

}
