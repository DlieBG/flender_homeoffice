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

  loading: boolean = false;

  history!: CalculatedHistoryItem[];
  sum$!: Observable<number>;
  automatic_break$!: Observable<number>;

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
    this.loading = true;
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

          this.loading = false;
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

          this.loading = false;
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
    let homeoffice_history = history.filter(
      (booking) => {
        return booking.booking.type == TypeEnum.homeoffice;
      }
    );

    history.forEach(
      (booking) => {
        calculated_history.push({
          timestamp: new Date(booking.timestamp),
          type: CalculatedTypeEnum.booking,
          ongoing: false,
          booking: booking,
        });
      }
    );

    for (let i = 0; i < homeoffice_history.length; i++) {
      if (homeoffice_history[i].booking.action == ActionEnum.start) {
        if (homeoffice_history.length > i + 1 && homeoffice_history[i + 1].booking.action == ActionEnum.stop) {
          calculated_history.push({
            timestamp: new Date(homeoffice_history[i + 1].timestamp),
            type: CalculatedTypeEnum.active_time,
            ongoing: false,
            amount$: of(
              (new Date(homeoffice_history[i + 1].timestamp).getTime() - new Date(homeoffice_history[i].timestamp).getTime()) / 3600000
            ),
          });
        }
        else if (homeoffice_history.length == i + 1) {
          calculated_history.push({
            timestamp: new Date(),
            type: CalculatedTypeEnum.active_time,
            ongoing: true,
            amount$: timer(0, 250).pipe(
              map(
                () => {
                  return (new Date().getTime() - new Date(homeoffice_history[i].timestamp).getTime()) / 3600000 as number;
                }
              ),
            ),
          });
        }
      }
      else if (homeoffice_history[i].booking.action == ActionEnum.stop) {
        if (homeoffice_history.length > i + 1 && homeoffice_history[i + 1].booking.action == ActionEnum.start) {
          calculated_history.push({
            timestamp: new Date(homeoffice_history[i + 1].timestamp),
            type: CalculatedTypeEnum.break_time,
            ongoing: false,
            amount$: of(
              (new Date(homeoffice_history[i + 1].timestamp).getTime() - new Date(homeoffice_history[i].timestamp).getTime()) / 3600000
            ),
          });
        }
      }
    }

    this.history = calculated_history.sort(
      (a, b) => {
        if (a.timestamp.getTime() == b.timestamp.getTime())
          return a.ongoing ? 1 : 0;

        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
    );

    this.sum$ = of(0).pipe(
      combineLatestWith(
        calculated_history.filter(
          (ch) => {
            return ch.type == CalculatedTypeEnum.active_time;
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

    this.automatic_break$ = of(0).pipe(
      combineLatestWith(
        calculated_history.filter(
          (ch) => {
            return ch.type == CalculatedTypeEnum.break_time;
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
      ),
      map(
        (sum: number) => {
          if (sum < .75)
            return Math.ceil(45 - sum * 60) / 60;

          return 0;
        }
      )
    );
  }

  isActive(filter_homeoffice: boolean = false): boolean {
    try {
      return this.storageService
        .getBookingHistory()
        .filter(
          (booking) => {
            if (filter_homeoffice)
              return booking.booking.type == TypeEnum.homeoffice;

            return true;
          }
        )
        .reverse()
      [0].booking.action == ActionEnum.start;
    } catch {
      return false;
    }
  }

  isTrip(): boolean {
    try {
      return this.storageService.getBookingHistory().reverse()[0].booking.action == ActionEnum.stop
        && this.storageService.getBookingHistory().reverse()[0].booking.type == TypeEnum.trip;
    } catch {
      return false;
    }
  }

}
