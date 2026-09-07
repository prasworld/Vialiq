import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { PaletteSearchComponent } from './palette-search.component';

describe('PaletteSearchComponent', () => {
  let component: PaletteSearchComponent;
  let fixture: ComponentFixture<PaletteSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaletteSearchComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaletteSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit search on input', () => {
    const emitSpy = vi.spyOn(component.search, 'emit');
    
    const event = { target: { value: 'test query' } } as unknown as Event;
    component.onInput(event);
    
    expect(emitSpy).toHaveBeenCalledWith('test query');
  });
});
