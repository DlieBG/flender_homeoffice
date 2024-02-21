import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { ActionEnum, BookingRequestDto, TypeEnum } from '../../types/atoss.types';

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styleUrl: './confirm.component.scss'
})
export class ConfirmComponent {

  ActionEnum = ActionEnum;
  TypeEnum = TypeEnum;

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA)
    public booking: BookingRequestDto,
    private bottomsheet: MatBottomSheetRef<ConfirmComponent>,
  ) { }

  cancel() {
    this.bottomsheet.dismiss(false);
  }

  confirm() {
    this.bottomsheet.dismiss(true);
  }

}
