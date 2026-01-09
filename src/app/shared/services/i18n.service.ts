import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class I18nService {
  constructor(private translate: TranslateService) {}

  init() {
    const lang = localStorage.getItem('lang') ?? 'en';
    this.translate.use(lang);
  }

  change(lang: 'fr' | 'en') {
    localStorage.setItem('lang', lang);
    this.translate.use(lang);
  }
}
