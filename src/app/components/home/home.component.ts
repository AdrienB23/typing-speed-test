import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { SelectButton } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { DataTextService } from '../../shared/services/data-text.service';
import { DataText } from '../../shared/models/data-text';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { HomeState } from '../../shared/models/home-state.enum';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ScreenService } from '../../shared/services/screen.service';
import { Select } from 'primeng/select';
import { RadioButton } from 'primeng/radiobutton';

@Component({
  selector: 'app-home',
  imports: [
    SelectButton,
    FormsModule,
    AsyncPipe,
    TranslatePipe,
    Select,
    RadioButton
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnChanges, OnDestroy {
  @Input() wpm: number = 0;
  @Input() accuracy: number = 100;
  @Input() time: number = 60;
  @Input() homeState!: HomeState;
  @Output() homeStateChange = new EventEmitter<HomeState>();
  @ViewChild('hiddenInput') hiddenInput!: ElementRef<HTMLInputElement>;

  difficultyOptions!: { label: string, value: string }[];
  modeOptions!: { label: string, value: string }[];
  selectedDifficulty: 'easy' | 'medium' | 'hard' = "easy";
  selectedMode: 'time' | 'passage' = "time";
  selectedTime = 60;
  screen = inject(ScreenService);

  skipChars = ["—", ".", ":", ","];

  currentText$!: Observable<DataText>;
  currentIndex = 0;
  textTyped = "";
  wordCount = 0;
  wrongChars = 0;
  startTime!: number;
  timerId: any = null;
  isTimerRunning = false;
  protected readonly HomeState = HomeState;

  constructor(
    private dataTextService: DataTextService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) {
  }

  @HostListener('document:click')
  onDocumentClick() {
    if (this.homeState !== HomeState.STARTED) return;

    this.hiddenInput?.nativeElement.focus();
  }

  ngOnInit() {
    this.loadText();
    this.buildDifficultyOptions();
    this.buildModeOptions();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['homeState'] && changes['homeState'].currentValue === HomeState.NOT_STARTED) {
      this.textTyped = "";
      this.currentIndex = 0;
      this.wordCount = 0;
      this.time = this.selectedTime;
      this.wpm = 0;
      this.accuracy = 0;
      this.loadText();
    }
  }

  ngOnDestroy() {
    if (this.timerId) clearInterval(this.timerId);
  }

  loadText() {
    this.currentText$ = this.dataTextService.getRandomText(this.selectedDifficulty);
  }

  difficultyChange() {
    if (this.homeState === HomeState.NOT_STARTED) {
      this.loadText();
    }
  }

  modeChange() {
    console.log("Mode change");
  }

  startTest() {
    this.homeState = HomeState.STARTED;
    this.homeStateChange.emit(this.homeState);

    setTimeout(() => {
      this.hiddenInput.nativeElement.focus();
    });

    this.startTime = Date.now();
    this.wordCount = 0;
  }

  onKeyPress(event: KeyboardEvent, currentText: DataText) {
    if (this.homeState === HomeState.NOT_STARTED || this.isTestFinished(currentText)) return;
    console.log(this.textTyped, this.wrongChars, this.textTyped.length);

    if (event.key === "Backspace") {
      if (this.currentIndex > 0) {
        const lastTypedIndex = this.currentIndex - 1;
        const expectedChar = currentText.text[lastTypedIndex];
        const typedChar = this.textTyped[lastTypedIndex];

        if (!this.isCorrect(expectedChar, typedChar)) {
          this.wrongChars = Math.max(0, this.wrongChars - 1);
        }

        if (expectedChar === " " && typedChar === " ") {
          this.wordCount = Math.max(0, this.wordCount - 1);
        }

        this.currentIndex--;
        this.textTyped = this.textTyped.slice(0, -1);

        this.updateAccuracy();
      }
      return;
    }
    if (event.key.length !== 1) return;

    if (!this.isTimerRunning) {
      this.startTimer();
    }

    if (this.currentIndex >= currentText.text.length) return;

    const expectedChar = currentText.text[this.currentIndex];
    const typedChar = event.key;

    if (expectedChar === " " && typedChar === " ") {
      this.wordCount++;
    }

    if (!this.isCorrect(expectedChar, typedChar)) {
      this.wrongChars++;
    }

    this.textTyped += typedChar;
    this.currentIndex++;

    if (this.skipChars.includes(currentText.text[this.currentIndex])) {
      this.textTyped += currentText.text[this.currentIndex];
      this.currentIndex++;
    }

    if (this.textTyped.length === currentText.text.length) {
      this.stopTimer();
    }

    this.updateAccuracy();

    event.preventDefault();
  }

  isCorrect(keyPressed: string, correctKey: string) {
    if (keyPressed && correctKey) {
      return keyPressed.toLowerCase() === correctKey.toLowerCase();
    }
    return false;
  }

  startTimer() {
    if (this.homeState === HomeState.NOT_STARTED) return;
    this.isTimerRunning = true;

    this.timerId = setInterval(() => {
      this.time--;

      this.cdr.detectChanges();
      this.updateWpm()

      if (this.time <= 0) {
        this.stopTimer();
      }
    }, 1000);
  }

  stopTimer() {
    clearInterval(this.timerId);
    this.timerId = null;
    this.isTimerRunning = false;
  }

  updateAccuracy() {
    if (this.textTyped.length === 0) {
      this.accuracy = 100;
      return;
    }

    this.accuracy = Math.max(
      0,
      Math.min(100, (1 - this.wrongChars / this.textTyped.length) * 100)
    );
  }

  updateWpm() {
    const elapsedMinutes = (Date.now() - this.startTime) / (this.selectedTime * 1000);
    if (elapsedMinutes === 0) return;

    const hasStartedTyping = this.textTyped.trim().length > 0;
    const totalWords = this.wordCount + (hasStartedTyping ? 1 : 0);

    this.wpm = Math.round(totalWords / elapsedMinutes);
  }

  isTestFinished(currentText: DataText) {
    return this.time <= 0 || this.textTyped.length === currentText.text.length;
  }

  private buildDifficultyOptions() {
    this.translate
      .get([
        'DIFFICULTY.EASY',
        'DIFFICULTY.MEDIUM',
        'DIFFICULTY.HARD',
      ])
      .subscribe(t => {
        this.difficultyOptions = [
          { label: t['DIFFICULTY.EASY'], value: 'easy' },
          { label: t['DIFFICULTY.MEDIUM'], value: 'medium' },
          { label: t['DIFFICULTY.HARD'], value: 'hard' },
        ];
      });
  }

  private buildModeOptions() {
    this.translate
      .get(['MODE.TIMED', 'MODE.PASSAGE'])
      .subscribe(t => {
        this.modeOptions = [
          { label: t['MODE.TIMED'] + ' (' + this.selectedTime + 's)', value: 'time' },
          { label: t['MODE.PASSAGE'], value: 'passage' },
        ];
      });
  }
}
