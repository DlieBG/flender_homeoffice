import { Component } from '@angular/core';
import { ImageLink, ToolbarItem } from '@flender/ngx-ui-components';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'ui';

  homeImageLink: ImageLink = {
    imageUrl: 'assets/flender.svg',
    link: {
      routerLink: '/'
    }
  }

}
