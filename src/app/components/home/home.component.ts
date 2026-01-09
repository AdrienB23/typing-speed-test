import { Component, EventEmitter, Input, inject, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
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
export class HomeComponent implements OnInit, OnChanges {
  @Input() wpm: number = 0;
  @Input() accuracy: number = 100;
  @Input() time: number = 60;
  @Input() homeState!: HomeState;
  @Output() homeStateChange = new EventEmitter<HomeState>();

  difficultyOptions!: { label: string, value: string }[];
  modeOptions!: { label: string, value: string }[];
  selectedDifficulty: 'easy' | 'medium' | 'hard' = "easy";
  selectedMode: 'time' | 'passage' = "time";
  screen = inject(ScreenService);

  currentText$!: Observable<DataText>;
  protected readonly HomeState = HomeState;

  constructor(
    private dataTextService: DataTextService,
    private translate: TranslateService
  ) {
  }

  ngOnInit() {
    this.loadText();
    this.buildDifficultyOptions();
    this.buildModeOptions();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['homeState'] && changes['homeState'].currentValue === HomeState.NOT_STARTED) {
      this.loadText();
    }
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
          { label: t['MODE.TIMED'] + ' (60s)', value: 'time' },
          { label: t['MODE.PASSAGE'], value: 'passage' },
        ];
      });
  }
}
