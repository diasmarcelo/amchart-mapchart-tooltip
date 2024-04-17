import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TooltipDefectMapComponent } from './tooltip-defect-map.component';

describe('TooltipDefectMapComponent', () => {
  let component: TooltipDefectMapComponent;
  let fixture: ComponentFixture<TooltipDefectMapComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TooltipDefectMapComponent]
    });
    fixture = TestBed.createComponent(TooltipDefectMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
