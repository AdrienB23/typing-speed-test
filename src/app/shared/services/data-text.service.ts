import { Injectable } from '@angular/core';
import { DataText } from '../models/data-text';
import { map, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DataTextByDifficulty } from '../models/data-text-by-difficulty';

const FILE_URL = 'assets/data/'

@Injectable({
  providedIn: 'root',
})
export class DataTextService {

  constructor(private http: HttpClient) { }

  getRandomText(difficulty: 'easy' | 'medium' | 'hard'): Observable<DataText> {
    return this.http.get<DataTextByDifficulty>(FILE_URL + 'data.json').pipe(
      map(data => {
        const texts = data[difficulty];
        return texts[Math.floor(Math.random() * texts.length)];
      })
    );
  }
}
