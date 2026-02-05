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
  errorDistinctValues = 0;
  frequencyDistinctValues = 0;

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
    console.log(this.keyStats);
  }

  showErrorsHeatmap() {
    if (!this.keyboardError || !this.keyStats) return;

    const errorValues = Object.values(this.keyStats)
      .map(k => k.incorrect)
      .filter(v => v > 0);

    if (errorValues.length === 0) return;

    const distinctErrors = Array.from(new Set(errorValues));
    this.errorDistinctValues = distinctErrors.length;

    const maxErrors = Math.max(...errorValues);

    this.errorLow  = Math.ceil(maxErrors / 3);
    this.errorHigh = Math.ceil((2 * maxErrors) / 3);

    Object.values(this.keyStats).forEach(stat => {
      if (stat.incorrect === 0 || maxErrors === 0) return;

      const key = stat.key;
      const v = stat.incorrect;

      if (v >= this.errorHigh) {
        this.keyboardError.addButtonTheme(key, 'error-high');
      } else if (v >= this.errorLow) {
        this.keyboardError.addButtonTheme(key, 'error-medium');
      } else {
        this.keyboardError.addButtonTheme(key, 'error-low');
      }
    });
  }

  showFrequencyHeatmap() {
    if (!this.keyboardFrequency || !this.keyStats) return;

    const frequencyValues = Object.values(this.keyStats)
      .map(k => k.pressed)
      .filter(v => v > 0);

    if (frequencyValues.length === 0) return;

    const distinctFrequencies = Array.from(new Set(frequencyValues));
    this.frequencyDistinctValues = distinctFrequencies.length;

    const maxPressed = Math.max(...frequencyValues);

    if (maxPressed === 0) return;

    this.frequencyLow  = Math.ceil(maxPressed / 3);
    this.frequencyHigh = Math.ceil((2 * maxPressed) / 3);

    Object.values(this.keyStats).forEach(stat => {
      if (stat.pressed === 0 || maxPressed === 0) return;

      const key = stat.key;
      const v = stat.pressed;

      if (v >= this.frequencyHigh) {
        this.keyboardFrequency.addButtonTheme(key, 'key-high');
      } else if (v >= this.frequencyLow) {
        this.keyboardFrequency.addButtonTheme(key, 'key-medium');
      } else {
        this.keyboardFrequency.addButtonTheme(key, 'key-low');
      }
    })
  }
}
