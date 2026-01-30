import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { ResultState } from '../../shared/models/result-state.enum';
import { TranslatePipe } from '@ngx-translate/core';
import { ScreenService } from '../../shared/services/screen.service';
import { Dialog } from 'primeng/dialog';
import { ResultsKeyboardHeatmapComponent } from './results-keyboard-heatmap/results-keyboard-heatmap.component';
import { KeyStats } from '../../shared/models/key-stats';

@Component({
  selector: 'app-results',
  imports: [
    TranslatePipe,
    Dialog,
    ResultsKeyboardHeatmapComponent
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
  @Input() keyStats!: Record<string, KeyStats>;
  @Output() restartTest = new EventEmitter<void>();

  heatmapVisible = false;

  screen = inject(ScreenService);

  restart() {
    this.restartTest.emit();
  }

  showHeatmap() {
    this.heatmapVisible = true;
  }

  protected readonly ResultState = ResultState;
}
