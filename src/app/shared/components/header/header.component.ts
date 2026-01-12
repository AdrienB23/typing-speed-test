import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ScreenService } from '../../services/screen.service';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  imports: [
    TranslatePipe,
    ToggleSwitch,
    FormsModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  @Input() personalBest: number | undefined;
  @Input() lang!: 'en' | 'fr';
  @Output() onLangChange = new EventEmitter<'en' | 'fr'>();

  screen = inject(ScreenService);

  toggleLang() {
    const newLang = this.lang === 'en' ? 'fr' : 'en';
    this.onLangChange.emit(newLang);
  }
}
