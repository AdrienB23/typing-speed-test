import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultsKeyboardHeatmapComponent } from './results-keyboard-heatmap.component';

describe('ResultsKeyboardHeatmapComponent', () => {
  let component: ResultsKeyboardHeatmapComponent;
  let fixture: ComponentFixture<ResultsKeyboardHeatmapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultsKeyboardHeatmapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResultsKeyboardHeatmapComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
