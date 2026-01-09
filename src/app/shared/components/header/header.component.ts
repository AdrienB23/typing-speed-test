import { Component, inject, Input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ScreenService } from '../../services/screen.service';

@Component({
  selector: 'app-header',
  imports: [
    TranslatePipe
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  @Input() personalBest: number | undefined;

  screen = inject(ScreenService);
}
