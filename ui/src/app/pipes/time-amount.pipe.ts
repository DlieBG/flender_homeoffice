import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAmount'
})
export class TimeAmountPipe implements PipeTransform {

  transform(value: number | null = 0): string {
    if (!value || value < 0)
      return '-';

    let hours = Math.floor(value);
    let minutes = (value - hours) * 60;

    return `${hours}:${minutes < 10 ? '0' : ''}${Math.floor(minutes)}`;
  }

}
