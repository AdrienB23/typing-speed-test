import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { SelectButton } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { DataTextService } from '../../shared/services/data-text.service';
import { DataText } from '../../shared/models/data-text';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { HomeState } from '../../shared/models/home-state.enum';

@Component({
  selector: 'app-home',
  imports: [
    SelectButton,
    FormsModule,
    AsyncPipe
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnChanges {
  @Input() wpm: number = 0;
  @Input() accuracy: number = 100;
  @Input() time: number = 60;
  @Input() homeState!: HomeState;
  @Output() homeStateChange = new EventEmitter<HomeState>();

  difficultyOptions = [{ label: "Easy", value: "easy" }, { label: "Medium", value: "medium" }, {
    label: "Hard",
    value: "hard"
  }]
  modeOptions = [{ label: "Timed(60s)", value: "time" }, { label: "Passage", value: "passage" }]
  selectedDifficulty: 'easy' | 'medium' | 'hard' = "easy";
  selectedMode: 'time' | 'passage' = "time";

  currentText$!: Observable<DataText>;
  protected readonly HomeState = HomeState;

  constructor(private dataTextService: DataTextService) {
  }

  ngOnInit() {
    this.loadText();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['homeState'] && changes['homeState'].currentValue === HomeState.NOT_STARTED) {
      this.loadText();
    }
  }

  loadText() {
    this.currentText$ = this.dataTextService.getRandomText(this.selectedDifficulty);
  }

  startTest() {
    this.homeState = HomeState.STARTED;
    this.homeStateChange.emit(this.homeState);
  }
}
