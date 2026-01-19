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
  @Output() wpmChange = new EventEmitter<number>();
  @Output() accuracyChange = new EventEmitter<number>();
  @Output() correctCharsChange = new EventEmitter<number>();
  @Output() wrongCharsChange = new EventEmitter<number>();
  @Output() testFinished = new EventEmitter<void>();
  @Output() personalBestChange = new EventEmitter<number>();
  @ViewChild('hiddenInput') hiddenInput!: ElementRef<HTMLInputElement>;
  @ViewChild('textBox') textBox!: ElementRef<HTMLDivElement>;
  @ViewChild('currentSpan') charSpan!: ElementRef<HTMLSpanElement>;

  time: number = 60;
  difficultyOptions!: { label: string, value: string }[];
  modeOptions!: { label: string, value: string }[];
  timeOptions!: { label: string, value: number }[];
  selectedDifficulty!: 'easy' | 'medium' | 'hard';
  selectedMode: 'time' | 'passage' = "time";
  selectedTime = 60;
  screen = inject(ScreenService);
  skipChars = ["—"];

  currentText: DataText | null = null;
  currentIndex = 0;
  textTyped = "";
  typedHistory = "";
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
    this.restoreSettings();
    this.initOptions();
    this.listenToLangChange();
    this.loadText();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['homeState'] && changes['homeState'].currentValue === HomeState.NOT_STARTED) {
      this.stopTimer();
      this.textTyped = "";
      this.typedHistory = "";
      this.currentIndex = 0;
      this.time = this.selectedTime;
      this.wpm = 0;
      this.accuracy = 100;
      this.correctChars = 0;
      this.loadText();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopTimer();
  }

  loadText() {
    this.dataTextService.getRandomText(this.selectedDifficulty)
      .pipe(takeUntil(this.destroy$))
      .subscribe(text => {
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

  onDifficultyChange() {
    if (this.homeState === HomeState.NOT_STARTED) {
      this.loadText();
      localStorage.setItem("difficulty", this.selectedDifficulty);
    }
  }

  onModeChange() {
    localStorage.setItem("mode", this.selectedMode);

    if (this.selectedMode === 'passage') {
      localStorage.removeItem('time');
    }
    else if (localStorage.getItem('time') === null) {
      localStorage.setItem('time', String(this.selectedTime));
    }
  }

  onTimeChange() {
    this.time = this.selectedTime;
    localStorage.setItem("time", String(this.selectedTime));
  }

  startTest() {
    this.homeState = HomeState.STARTED;
    this.homeStateChange.emit(this.homeState);

    setTimeout(() => {
      this.hiddenInput.nativeElement.focus();
    });

    this.accuracy = 0;
    this.startTime = Date.now();
  }

  scrollToActiveChar(): void {
    const charEl = this.charSpan.nativeElement;
    const container = this.textBox.nativeElement;

    const charTop = charEl.offsetTop;
    const charBottom = charTop + charEl.offsetHeight;

    const containerScrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;

    if (charTop < containerScrollTop || charBottom > containerScrollTop + containerHeight) {
      container.scrollTo({ top: charTop - containerHeight / 2, behavior: 'smooth' });
    }
  }

  onKeyPress(event: KeyboardEvent, currentText: DataText) {
    if (this.homeState === HomeState.NOT_STARTED) return;

    if (event.key === "Backspace") {
      if (this.currentIndex > 0) {
        this.currentIndex--;
        this.textTyped = this.textTyped.slice(0, -1);

      }
      return;
    }
    if (event.key.length !== 1) return;

    if (!this.isTimerRunning) {
      this.startTimer();
    }

    if (this.currentIndex >= currentText.text.length) return;

    const typedChar = event.key;

    this.textTyped += typedChar;
    if (this.textTyped.length > this.typedHistory.length) {
      this.typedHistory += typedChar;
    }
    this.currentIndex++;

    const currentChar = currentText.text[this.currentIndex];
    if (this.skipChars.includes(currentChar)) {
      this.textTyped += currentChar;
      this.typedHistory += currentChar;
      this.currentIndex++;
    }
    this.scrollToActiveChar();

    if (this.textTyped.length === currentText.text.length) {
      this.finishTest();
    }

    this.recomputeStats(currentText);

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
    this.wpmChange.emit(this.wpm);
    this.accuracyChange.emit(this.accuracy);
    this.wrongCharsChange.emit(this.wrongChars);
    this.testFinished.emit();
    this.personalBestChange.emit(this.wpm);
  }

  updateCorrectChars() {
    if (!this.currentText) return;

    this.correctChars = 0;
    for (let i = 0; i < this.typedHistory.length; i++) {
      if (this.isCorrect(this.currentText.text[i], this.typedHistory[i])) {
        this.correctChars++;
      }
    }
    this.correctCharsChange.emit(this.correctChars);
  }

  updateWrongChars(currentText: DataText) {
    this.wrongChars = 0;
    for (let i = 0; i < this.typedHistory.length; i++) {
      if (!this.isCorrect(currentText.text[i], this.typedHistory[i])) {
        this.wrongChars ++;
      }
    }
  }

  updateAccuracy() {
    if (this.typedHistory.length === 0) {
      this.accuracy = 100;
      return;
    }

    this.accuracy = Math.max(
      0,
      Math.min(100, (1 - this.wrongChars / this.typedHistory.length) * 100)
    );
  }

  updateWpm() {
    if (!this.currentText) return;

    const elapsedMinutes = (Date.now() - this.startTime) / 60000;
    if (elapsedMinutes <= 0) return;

    const correctWords = this.countCorrectWords(this.currentText.text, this.typedHistory.trim());

    this.wpm = Math.round(correctWords / elapsedMinutes);
  }

  countCorrectWords(text: string, typed: string): number {
    const originalWords = text.split(' ');
    const typedWords = typed.split(' ');

    let correctWords = 0;

    for (let i = 0; i < typedWords.length; i++) {
      if (!originalWords[i]) break;

      if (typedWords[i] === originalWords[i]) {
        correctWords++;
      }
    }

    return correctWords;
  }

  private recomputeStats(currentText: DataText) {
    this.updateWrongChars(currentText);
    this.updateAccuracy();
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
          { label: t['MODE.TIMED'], value: 'time' },
          { label: t['MODE.PASSAGE'], value: 'passage' },
        ];
      });
  }

  private buildTimeOptions() {
    this.timeOptions = [
      { label: '15s', value: 15 },
      { label: '30s', value: 30 },
      { label: '60s', value: 60 },
      { label: '120s', value: 120 },
    ];
  }

  private restoreSettings() {
    this.selectedDifficulty = this.getFromStorage('difficulty', 'easy');
    this.selectedMode = this.getFromStorage('mode', 'time');
    this.time = this.selectedTime = Number(this.getFromStorage('time', 60));
  }

  private initOptions() {
    this.buildDifficultyOptions();
    this.buildModeOptions();
    this.buildTimeOptions();
  }

  private listenToLangChange() {
    this.translate.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.buildDifficultyOptions();
        this.buildModeOptions();
      });
  }

  private getFromStorage<T>(key: string, fallback: T): T {
    const value = localStorage.getItem(key);
    return value !== null ? (value as T) : fallback;
  }
}
