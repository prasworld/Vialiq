import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentRef } from '@angular/core';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { CanvasFormTitleComponent } from './canvas-form-title.component';

describe('CanvasFormTitleComponent', () => {
  let component: CanvasFormTitleComponent;
  let fixture: ComponentFixture<CanvasFormTitleComponent>;
  let componentRef: ComponentRef<CanvasFormTitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CanvasFormTitleComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CanvasFormTitleComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    
    componentRef.setInput('title', 'Initial Title');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.title()).toBe('Initial Title');
  });

  it('should emit titleChange on input change', () => {
    const emitSpy = vi.spyOn(component.titleChange, 'emit');
    
    const event = { target: { value: 'New Title' } } as unknown as Event;
    component.onTitleChange(event);
    
    expect(emitSpy).toHaveBeenCalledWith('New Title');
  });
});
