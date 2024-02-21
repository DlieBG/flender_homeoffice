import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';

import { FleIconModule, FleButtonModule, FleNavigationModule, flenderIconSet, FleCategoryModule, FleIconButtonModule } from '@flender/ngx-ui-components';
import { heroArrowLeftOnRectangle, heroArrowRightOnRectangle, heroArrowPath, heroCog8Tooth, heroLockClosed, heroShieldExclamation, heroClock, heroPlay, heroInformationCircle, heroPause, heroQrCode, heroFire, heroXMark } from "@ng-icons/heroicons/outline";

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { FormsModule } from '@angular/forms';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ServiceWorkerModule } from '@angular/service-worker';
import { HttpClientModule } from '@angular/common/http';
import { TimeAmountPipe } from './pipes/time-amount.pipe';
import { ConfirmComponent } from './components/confirm/confirm.component';
import { QrComponent } from './components/qr/qr.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    TimeAmountPipe,
    ConfirmComponent,
    QrComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatBottomSheetModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
    FleIconModule.forRoot({
      heroArrowLeftOnRectangle,
      heroArrowRightOnRectangle,
      heroArrowPath,
      heroCog8Tooth,
      heroLockClosed,
      heroShieldExclamation,
      heroClock,
      heroPlay,
      heroInformationCircle,
      heroPause,
      heroQrCode,
      heroFire,
      heroXMark,
    }, [
      ...flenderIconSet
    ]),
    FleButtonModule,
    FleNavigationModule,
    FleCategoryModule,
    FleIconButtonModule,
  ],
  providers: [
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
