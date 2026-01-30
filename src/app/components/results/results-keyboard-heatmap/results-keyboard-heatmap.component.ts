import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import Keyboard from 'simple-keyboard';
import { KeyStats } from '../../../shared/models/key-stats';

@Component({
  selector: 'app-results-keyboard-heatmap',
  imports: [],
  templateUrl: './results-keyboard-heatmap.component.html',
  styleUrl: './results-keyboard-heatmap.component.scss',
})
export class ResultsKeyboardHeatmapComponent implements AfterViewInit, OnInit {
  @Input() keyStats!: Record<string, KeyStats>;
  @Input() layout: 'azerty' | 'qwerty' = 'qwerty';
  @Input() totalKeystrokes!: number;
  @Input() totalErrors!: number;
  @ViewChild('keyboardContainer', { static: false }) keyboardContainer!: ElementRef<HTMLDivElement>;

  value = "";
  keyboard!: Keyboard;

  ngOnInit() {
    this.showErrorsHeatmap();
  }

  ngAfterViewInit() {
    this.keyboard = new Keyboard(this.keyboardContainer.nativeElement, {
      onKeyPress: button => this.onKeyPress(button),


    });
  }

  showErrorsHeatmap() {
    Object.values(this.keyStats).forEach(stat => {
      const key = stat.key;
      console.log(key);
      // if (code[0] === 'K') {
      //   const
      // }
    })
  }

  onKeyPress(button: string){
    console.log("Button pressed", button);
  }
}
