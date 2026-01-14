import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { ResultState } from '../../shared/models/result-state.enum';
import { TranslatePipe } from '@ngx-translate/core';
import { ScreenService } from '../../shared/services/screen.service';

@Component({
  selector: 'app-results',
  imports: [
    TranslatePipe
  ],
  templateUrl: './results.component.html',
  styleUrl: './results.component.scss',
})
export class ResultsComponent {
  @Input() resultState = ResultState.DEFAULT;
  @Input() wpm!: number;
  @Input() accuracy!: number;
  @Input() correctChars!: number;
  @Input() wrongChars!: number;
  @Output() restartTest = new EventEmitter<void>();

  screen = inject(ScreenService);

  restart() {
    this.restartTest.emit();
  }

  protected readonly ResultState = ResultState;
}
