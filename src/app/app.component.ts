import { Component, signal } from '@angular/core';
import { HomeComponent } from './components/home/home.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { HomeState } from './shared/models/enums/home-state.enum';
import { I18nService } from './shared/services/i18n.service';
import { AppView } from './shared/models/enums/app-view.enum';
import { ResultsComponent } from './components/results/results.component';

@Component({
  selector: 'app-root',
  imports: [
    HomeComponent,
    HeaderComponent,
    FooterComponent,
    ResultsComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class App {
  protected readonly title = signal('typing-speed-test');
  personalBest: number | undefined;
  homeState = HomeState.NOT_STARTED;
  appView = AppView.HOME;

  protected readonly HomeState = HomeState;

  constructor(i18n: I18nService) {
    i18n.init();
  }

  onTestFinished() {
    this.appView = AppView.RESULTS;
  }

  protected readonly AppView = AppView;
}
