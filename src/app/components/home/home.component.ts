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
import { Subject, takeUntil } from 'rxjs';
import { HomeState } from '../../shared/models/enums/home-state.enum';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ScreenService } from '../../shared/services/screen.service';
import { Select } from 'primeng/select';
import { RadioButton } from 'primeng/radiobutton';
import { ProgressSpinner } from 'primeng/progressspinner';

@Component({
  selector: 'app-home',
  imports: [
    SelectButton,
    FormsModule,
    TranslatePipe,
    Select,
    RadioButton,
    ProgressSpinner
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnChanges, OnDestroy {
  @Input() wpm!: number;
  @Input() accuracy!: number;
  @Input() homeState!: HomeState;
  @Input() lang!: 'en' | 'fr';
  @Input() correctChars!: number;
  @Input() wrongChars!: number;
  @Output() homeStateChange = new EventEmitter<HomeState>();
  @Output() accuracyChange = new EventEmitter<number>();
  @Output() correctCharsChange = new EventEmitter<number>();
  @Output() wrongCharsChange = new EventEmitter<number>();
  @Output() testFinished = new EventEmitter<void>();
  @Output() personalBestChange = new EventEmitter<number>();
  @ViewChild('hiddenInput') hiddenInput!: ElementRef<HTMLInputElement>;

  time: number = 60;
  difficultyOptions!: { label: string, value: string }[];
  modeOptions!: { label: string, value: string }[];
  selectedDifficulty: 'easy' | 'medium' | 'hard' = "easy";
  selectedMode: 'time' | 'passage' = "time";
  selectedTime = 60;
  screen = inject(ScreenService);

  currentText: DataText | null = null;
  currentIndex = 0;
  textTyped = "";
  errorsTextTyped = "";
  wordCount = 0;
  startTime!: number;
  timerId: any = null;
  isTimerRunning = false;
  protected readonly HomeState = HomeState;

  private destroy$ = new Subject<void>();

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
    this.translate.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.buildDifficultyOptions();
        this.buildModeOptions();
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['homeState'] && changes['homeState'].currentValue === HomeState.NOT_STARTED) {
      this.stopTimer();
      this.textTyped = "";
      this.errorsTextTyped = "";
      this.currentIndex = 0;
      this.wordCount = 0;
      this.time = this.selectedTime;
      this.wpm = 0;
      this.accuracy = 0;
      this.correctChars = 0;
      this.loadText();
    }
  }

  ngOnDestroy() {
    if (this.timerId) clearInterval(this.timerId);
  }

  loadText() {
    this.dataTextService.getRandomText(this.selectedDifficulty).subscribe(text => {
      this.currentText = text;
      this.cdr.detectChanges();
    });
  }

  getWords(text: string) {
    const words: { char: string; index: number }[][] = [];
    let currentWord: { char: string; index: number }[] = [];

    [...text].forEach((char, index) => {
      currentWord.push({ char, index });

      if (char === ' ') {
        words.push(currentWord);
        currentWord = [];
      }
    });

    if (currentWord.length) {
      words.push(currentWord);
    }

    return words;
  }

  difficultyChange() {
    if (this.homeState === HomeState.NOT_STARTED) {
      this.loadText();
    }
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
    if (this.homeState === HomeState.NOT_STARTED) return;

    if (event.key === "Backspace") {
      if (this.currentIndex > 0) {
        const lastTypedIndex = this.currentIndex - 1;
        const expectedChar = currentText.text[lastTypedIndex];
        const typedChar = this.textTyped[lastTypedIndex];

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
    if (this.textTyped.length > this.errorsTextTyped.length) {
      this.errorsTextTyped += typedChar;
    }
    this.currentIndex++;

    if (this.textTyped.length === currentText.text.length) {
      this.finishTest();
    }

    this.updateWrongChars(currentText);
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
      if (this.selectedMode === "time") {
        this.time--;
      }
      this.updateWpm();
      this.cdr.detectChanges();

      if (this.selectedMode === "time" && this.time <= 0) {
        this.finishTest();
      }
    }, 1000);
  }

  stopTimer() {
    clearInterval(this.timerId);
    this.timerId = null;
    this.isTimerRunning = false;
  }

  finishTest() {
    this.stopTimer();
    this.updateCorrectChars();
    this.accuracyChange.emit(this.accuracy);
    this.wrongCharsChange.emit(this.wrongChars);
    this.testFinished.emit();
    this.personalBestChange.emit(this.wpm);
  }

  updateCorrectChars() {
    if (!this.currentText) return;

    this.correctChars = 0;
    for (let i = 0; i < this.errorsTextTyped.length; i++) {
      if (this.isCorrect(this.currentText.text[i], this.errorsTextTyped[i])) {
        this.correctChars++;
      }
    }
    this.correctCharsChange.emit(this.correctChars);
  }

  updateWrongChars(currentText: DataText) {
    this.wrongChars = 0;
    for (let i = 0; i < this.errorsTextTyped.length; i++) {
      if (!this.isCorrect(currentText.text[i], this.errorsTextTyped[i])) {
        this.wrongChars ++;
      }
    }
  }

  updateAccuracy() {
    if (this.errorsTextTyped.length === 0) {
      this.accuracy = 100;
      return;
    }

    this.accuracy = Math.max(
      0,
      Math.min(100, (1 - this.wrongChars / this.errorsTextTyped.length) * 100)
    );
  }

  updateWpm() {
    const elapsedMinutes = (Date.now() - this.startTime) / 60000;

    if (elapsedMinutes === 0) return;

    const hasStartedTyping = this.errorsTextTyped.trim().length > 0;
    const totalWords = this.wordCount + (hasStartedTyping ? 1 : 0);

    this.wpm = Math.round(totalWords / elapsedMinutes);
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
