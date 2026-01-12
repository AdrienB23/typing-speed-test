import { Component, signal } from '@angular/core';
import { HomeComponent } from './components/home/home.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { HomeState } from './shared/models/enums/home-state.enum';
import { I18nService } from './shared/services/i18n.service';
import { AppView } from './shared/models/enums/app-view.enum';
import { ResultsComponent } from './components/results/results.component';
import { TranslateService } from '@ngx-translate/core';

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
  lang: 'en' | 'fr' = 'en';

  protected readonly HomeState = HomeState;

  constructor(
    private i18n: I18nService,
    private translate: TranslateService
  ) {
    i18n.init();
  }

  onTestFinished() {
    this.appView = AppView.RESULTS;
  }

  changeLang(lang: 'en' | 'fr') {
    this.lang = lang;
    this.translate.use(lang);
  }

  protected readonly AppView = AppView;
}
