import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PersonalBestService {
  get(): number | null {
    const value = localStorage.getItem("personal-best");
    return value ? parseInt(value) : null;
  }

  set(value: number) {
    localStorage.setItem("personal-best", String(value));
  }
}
