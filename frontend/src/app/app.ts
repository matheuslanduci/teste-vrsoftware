import { Component } from '@angular/core';
import { Notification } from './components/notification/notification';

@Component({
  selector: 'app-root',
  imports: [Notification],
  template: `
    <div class="app-container">
      <app-notification></app-notification>
    </div>
  `,
  styles: [
    `
      .app-container {
        min-height: 100vh;
        background-color: #f5f5f5;
        padding: 20px 0;
      }
    `,
  ],
})
export class App {
  protected title = 'frontend';
}
