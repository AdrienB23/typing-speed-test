import { Component, Input } from '@angular/core';
import { SelectButton } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  imports: [
    SelectButton,
    FormsModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  @Input() wpm: number = 0;
  @Input() accuracy: number = 100;
  @Input() time: number = 60;
  difficultyOptions = [{ label: "Easy", value: "easy" }, { label: "Medium", value: "medium" }, { label: "Hard", value: "hard" }]
  modeOptions = [{ label: "Timed(60s)", value: "time" }, { label: "Passage", value: "passage" }]

  selectedDifficulty: string = "easy";
  selectedMode: string = "time";

}
