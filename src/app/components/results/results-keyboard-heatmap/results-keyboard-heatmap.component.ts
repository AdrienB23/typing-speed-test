import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import Keyboard from 'simple-keyboard';
import { KeyStats } from '../../../shared/models/key-stats';
import { TranslatePipe } from '@ngx-translate/core';
import { KEYBOARD_LAYOUTS } from '../../../shared/models/keyboard-layouts';

@Component({
  selector: 'app-results-keyboard-heatmap',
  imports: [
    TranslatePipe
  ],
  templateUrl: './results-keyboard-heatmap.component.html',
  styleUrl: './results-keyboard-heatmap.component.scss',
})
export class ResultsKeyboardHeatmapComponent implements AfterViewInit, OnChanges {
  @Input() keyStats!: Record<string, KeyStats>;
  @Input() lang: 'en' | 'fr' = 'en';
  @ViewChild('keyboardErrorContainer', { static: false }) keyboardErrorContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('keyboardFrequencyContainer', { static: false }) keyboardFrequencyContainer!: ElementRef<HTMLDivElement>;

  keyboardError!: Keyboard;
  keyboardFrequency!: Keyboard;
  errorLow = 0;
  errorHigh = 0;
  frequencyLow = 0;
  frequencyHigh = 0;

  constructor(
    private cdr: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['lang'] && this.keyboardError && this.keyboardFrequency) {
      const layoutName = this.lang === 'fr' ? 'azerty': 'qwerty';

      this.keyboardError.setOptions({ layoutName });
      this.keyboardFrequency.setOptions({ layoutName });

      this.showErrorsHeatmap();
      this.showFrequencyHeatmap();
    }
  }

  ngAfterViewInit() {
    this.keyboardError = new Keyboard(this.keyboardErrorContainer.nativeElement, {
      layout: KEYBOARD_LAYOUTS,
      layoutName: this.lang === 'fr' ? 'azerty' : 'qwerty',
      physicalKeyboardHighlight: false
    });
    this.keyboardFrequency = new Keyboard(this.keyboardFrequencyContainer.nativeElement, {
      layout: KEYBOARD_LAYOUTS,
      layoutName: this.lang === 'fr' ? 'azerty' : 'qwerty',
      physicalKeyboardHighlight: false
    });
    this.showErrorsHeatmap();
    this.showFrequencyHeatmap();
    this.cdr.detectChanges();
  }

  showErrorsHeatmap() {
    if (!this.keyboardError || !this.keyStats) return;

    const maxErrors = Math.max(
      ...Object.values(this.keyStats).map(k => k.incorrect)
    );

    if (maxErrors === 0) return;

    this.errorLow = Math.floor(maxErrors * 0.33);
    this.errorHigh = Math.floor((maxErrors + 1)* 0.66);

    Object.values(this.keyStats).forEach(stat => {
      if (stat.incorrect === 0 || maxErrors === 0) return;

      const errorRatio = stat.incorrect / maxErrors;
      const key = stat.key;

      if (errorRatio > 0.66) {
        this.keyboardError.addButtonTheme(key, 'error-high');
      } else if (errorRatio > 0.33) {
        this.keyboardError.addButtonTheme(key, 'error-medium');
      } else {
        this.keyboardError.addButtonTheme(key, 'error-low');
      }
    })
  }

  showFrequencyHeatmap() {
    if (!this.keyboardFrequency || !this.keyStats) return;

    const maxPressed = Math.max(
      ...Object.values(this.keyStats).map(k => k.pressed)
    );
    console.log(this.keyStats);
    if (maxPressed === 0) return;

    this.frequencyLow = Math.floor(maxPressed * 0.33);
    this.frequencyHigh = Math.floor((maxPressed + 1) * 0.66);

    Object.values(this.keyStats).forEach(stat => {
      if (stat.pressed === 0 || maxPressed === 0) return;

      const ratio = stat.pressed / maxPressed;
      const key = stat.key;

      if (ratio >= 0.66) {
        this.keyboardFrequency.addButtonTheme(key, 'key-high');
      } else if (ratio > 0.33) {
        this.keyboardFrequency.addButtonTheme(key, 'key-medium');
      } else {
        this.keyboardFrequency.addButtonTheme(key, 'key-low');
      }
    })
  }
}
