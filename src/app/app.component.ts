import { Component, signal } from '@angular/core';
import { HomeComponent } from './components/home/home.component';
import { HeaderComponent } from './core/header/header.component';

@Component({
  selector: 'app-root',
  imports: [
    HomeComponent,
    HeaderComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class App {
  protected readonly title = signal('typing-speed-test');
  personalBest: number | undefined;
}
