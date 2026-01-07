import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HomeState } from '../../models/home-state.enum';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  @Input() homeState!: HomeState;
  @Output() homeStateChange = new EventEmitter<HomeState>();

  restart() {
    this.homeState = HomeState.NOT_STARTED;
    this.homeStateChange.emit(this.homeState);
  }
}
