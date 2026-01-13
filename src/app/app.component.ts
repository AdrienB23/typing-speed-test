import { Component, OnInit, signal } from '@angular/core';
import { HomeComponent } from './components/home/home.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { HomeState } from './shared/models/enums/home-state.enum';
import { I18nService } from './shared/services/i18n.service';
import { AppView } from './shared/models/enums/app-view.enum';
import { ResultsComponent } from './components/results/results.component';
import { TranslateService } from '@ngx-translate/core';
import { PersonalBestService } from './shared/services/personal-best.service';

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
export class App implements OnInit {
  protected readonly title = signal('typing-speed-test');
  personalBest: number | null = null;
  homeState = HomeState.NOT_STARTED;
  appView = AppView.HOME;
  lang: 'en' | 'fr' = 'en';

  protected readonly HomeState = HomeState;

  constructor(
    private i18n: I18nService,
    private translate: TranslateService,
    private personalBestService: PersonalBestService
  ) {
    i18n.init();
  }

  ngOnInit() {
    this.personalBest = this.personalBestService.get();
  }

  onTestFinished() {
    this.appView = AppView.RESULTS;
  }

  onPersonalBestChange(wpm: number) {
    const personalBest = this.personalBestService.get();
    if (personalBest == null || personalBest < wpm) {
      this.personalBestService.set(wpm);
      this.personalBest = wpm;
    }
  }

  changeLang(lang: 'en' | 'fr') {
    this.lang = lang;
    this.translate.use(lang);
  }

  protected readonly AppView = AppView;
}
