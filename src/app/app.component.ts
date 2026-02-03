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
import { ResultState } from './shared/models/result-state.enum';
import { KeyStats } from './shared/models/key-stats';

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
  wpm: number = 0;
  accuracy: number = 100;
  correctChar = 0;
  wrongChars = 0;
  personalBest: number | null = null;
  homeState = HomeState.NOT_STARTED;
  resultState = ResultState.DEFAULT;
  appView = AppView.HOME;
  lang: 'en' | 'fr' = 'en';
  keyStats!: Record<string, KeyStats>;

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
      this.resultState = personalBest == null ? ResultState.FIRST_TEST : ResultState.NEW_BEST;
    } else {
      this.resultState = ResultState.DEFAULT;
    }
  }

  restartTest() {
    this.wpm = 0;
    this.accuracy = 100;
    this.homeState = HomeState.NOT_STARTED;
    this.appView = AppView.HOME;
    this.correctChar = 0;
    this.wrongChars = 0;
  }

  changeLang(lang: 'en' | 'fr') {
    this.lang = lang;
    this.translate.use(lang);
  }

  onKeyStatsChange(keyStats: Record<string, KeyStats>) {
    this.keyStats = keyStats;
  }

  protected readonly AppView = AppView;
}
