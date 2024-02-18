import { Component, OnInit } from '@angular/core';
import { StorageService } from '../../services/storage/storage.service';
import { Credentials } from '../../types/storage.types';
import { AtossService } from '../../services/atoss/atoss.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {

  credentials!: Credentials;

  loading: boolean = false;

  constructor(
    private snackbar: MatSnackBar,
    private router: Router,
    private storageService: StorageService,
    private atossService: AtossService,
  ) { }

  ngOnInit(): void {
    this.credentials = this.storageService.getCredentials();
  }

  save() {
    this.loading = true;

    this.atossService
      .getBalance({
        personal_number: this.credentials.personal_number,
        pin: this.credentials.pin,
      })
      .subscribe({
        next: (balance) => {
          this.storageService.setCredentials(this.credentials);

          this.snackbar.open(
            `Willkommen ${balance.name.split(', ')[1]}!`,
            '',
            {
              duration: 3000,
            }
          );

          this.router.navigate(['/']);

          this.loading = false;
        },
        error: () => {
          this.snackbar.open(
            'Falsche Credentials!',
            '',
            {
              duration: 4000,
            }
          );

          this.loading = false;
        }
      });
  }

}
