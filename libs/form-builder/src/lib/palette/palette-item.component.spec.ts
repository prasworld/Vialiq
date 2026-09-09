import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentRef } from '@angular/core';
import { By } from '@angular/platform-browser';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { PaletteItemComponent } from './palette-item.component';
import { BuilderStateService } from '../services/builder-state.service';
import { DndService } from '../services/dnd.service';
import { FormSchemaService } from '../services/form-schema.service';
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';

vi.mock('@atlaskit/pragmatic-drag-and-drop/element/adapter', () => ({
  draggable: vi.fn(() => () => {}) // return a cleanup function
}));

vi.mock('@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview', () => ({
  setCustomNativeDragPreview: vi.fn()
}));

describe('PaletteItemComponent', () => {
  let component: PaletteItemComponent;
  let fixture: ComponentFixture<PaletteItemComponent>;
  let componentRef: ComponentRef<PaletteItemComponent>;
  
  const mockDescriptor = {
    type: 'text-input',
    label: 'Text Input',
    category: 'basic',
    icon: 'type',
    defaultSchema: { type: 'text-input', label: 'Text Input' },
    canvasElement: 'div',
    canvasProps: () => ({})
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [PaletteItemComponent],
      providers: [
        BuilderStateService,
        { provide: DndService, useValue: { addFromPalette: vi.fn() } },
        { provide: FormSchemaService, useValue: { getNode: vi.fn() } }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaletteItemComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    
    fixture.componentRef.setInput('descriptor', mockDescriptor);
    fixture.detectChanges();
  });

  it('should create and initialize draggable', () => {
    expect(component).toBeTruthy();
    expect(draggable).toHaveBeenCalledWith(expect.objectContaining({
      element: fixture.debugElement.query(By.css('.palette-item')).nativeElement
    }));
  });

  it('should provide correct data to draggable', () => {
    const config = vi.mocked(draggable).mock.calls[0][0];
    const data = config.getInitialData!({ input: null, element: document.createElement('div'), source: {} as any });
    
    expect(data).toEqual(expect.objectContaining({
      source: 'palette',
      descriptorType: 'text-input'
    }));
  });

  it('should update isDragging state on drag start and drop', () => {
    const config = vi.mocked(draggable).mock.calls[0][0];
    
    expect(component.isDragging()).toBe(false);
    
    if (config.onDragStart) {
      config.onDragStart({} as any);
    }
    expect(component.isDragging()).toBe(true);
    
    if (config.onDrop) {
      config.onDrop({} as any);
    }
    expect(component.isDragging()).toBe(false);
  });

  it('should generate custom drag preview', () => {
    const config = vi.mocked(draggable).mock.calls[0][0];
    
    if (config.onGenerateDragPreview) {
      config.onGenerateDragPreview({ nativeSetDragImage: {} } as any);
    }
    
    expect(setCustomNativeDragPreview).toHaveBeenCalledOnce();
    const previewConfig = vi.mocked(setCustomNativeDragPreview).mock.calls[0][0];
    
    const container = document.createElement('div');
    previewConfig.render({ container } as any);
    
    expect(container.textContent).toContain('Text Input');
  });

  it('should cleanup on destroy', () => {
    const cleanupMock = vi.fn();
    vi.mocked(draggable).mockReturnValueOnce(cleanupMock);
    
    // recreate to get the new mock
    fixture = TestBed.createComponent(PaletteItemComponent);
    componentRef = fixture.componentRef;
    componentRef.setInput('descriptor', { type: 'test', label: 'Test', icon: 'test' } as any);
    fixture.detectChanges();
    
    fixture.componentInstance.ngOnDestroy();
    expect(cleanupMock).toHaveBeenCalledOnce();
  });

  describe('getIconColor', () => {
    it('should return orange for layout types', () => {
      componentRef.setInput('descriptor', { type: 'layout', icon: 'layout' } as any);
      expect(component.getIconColor()).toBe('#f59e0b');

      componentRef.setInput('descriptor', { type: 'test', icon: 'columns' } as any);
      expect(component.getIconColor()).toBe('#f59e0b');
    });

    it('should return green for basic info types', () => {
      componentRef.setInput('descriptor', { type: 'email', icon: 'mail' } as any);
      expect(component.getIconColor()).toBe('#10b981');
    });

    it('should return purple for number types', () => {
      componentRef.setInput('descriptor', { type: 'number', icon: 'hash' } as any);
      expect(component.getIconColor()).toBe('#a855f7');
    });

    it('should return blue for default text box', () => {
      componentRef.setInput('descriptor', { type: 'text', icon: 'type' } as any);
      expect(component.getIconColor()).toBe('#3b82f6');
    });
  });
});
