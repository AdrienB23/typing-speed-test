import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HomeState } from '../../models/enums/home-state.enum';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  imports: [
    TranslatePipe
  ],
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
