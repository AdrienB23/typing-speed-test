import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ScreenService {
  private _width = signal(window.innerWidth);

  isMobile = signal(this._width() <= 600);
  isTablet = signal(this._width() > 600 && this._width() <= 991);

  constructor() {
    window.addEventListener('resize', () => {
      this._width.set(window.innerWidth);
      this.isMobile.set(window.innerWidth <= 600);
      this.isTablet.set(window.innerWidth > 600 && window.innerWidth <= 991);
    });
  }

  get width() {
    return this._width;
  }
}
