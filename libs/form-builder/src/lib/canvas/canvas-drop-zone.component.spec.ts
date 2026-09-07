import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentRef } from '@angular/core';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { CanvasDropZoneComponent } from './canvas-drop-zone.component';
import { BuilderStateService } from '../services/builder-state.service';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

vi.mock('@atlaskit/pragmatic-drag-and-drop/element/adapter', () => ({
  dropTargetForElements: vi.fn(() => () => {}) // return a cleanup function
}));

describe('CanvasDropZoneComponent', () => {
  let component: CanvasDropZoneComponent;
  let fixture: ComponentFixture<CanvasDropZoneComponent>;
  let componentRef: ComponentRef<CanvasDropZoneComponent>;
  let stateService: BuilderStateService;

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [CanvasDropZoneComponent],
      providers: [BuilderStateService]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CanvasDropZoneComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    stateService = TestBed.inject(BuilderStateService);
    
    // Provide inputs
    componentRef.setInput('index', 0);
    componentRef.setInput('parentId', 'test-parent');
    
    fixture.detectChanges();
  });

  it('should create and initialize drop target', () => {
    expect(component).toBeTruthy();
    expect(dropTargetForElements).toHaveBeenCalledOnce();
  });

  it('should provide correct data to drop target', () => {
    const config = vi.mocked(dropTargetForElements).mock.calls[0][0];
    const data = config.getData({ input: null, element: document.createElement('div'), source: {} as any });
    
    expect(data).toEqual({
      parentId: 'test-parent',
      index: 0
    });
  });

  it('should update isDragOver state on drag enter and leave', () => {
    const config = vi.mocked(dropTargetForElements).mock.calls[0][0];
    
    expect(component.isDragOver).toBe(false);
    
    if (config.onDragEnter) {
      config.onDragEnter({} as any);
    }
    expect(component.isDragOver).toBe(true);
    
    if (config.onDragLeave) {
      config.onDragLeave({} as any);
    }
    expect(component.isDragOver).toBe(false);
  });

  it('should reset isDragOver on drop', () => {
    const config = vi.mocked(dropTargetForElements).mock.calls[0][0];
    
    component.isDragOver = true;
    
    if (config.onDrop) {
      config.onDrop({} as any);
    }
    expect(component.isDragOver).toBe(false);
  });

  it('should cleanup on destroy', () => {
    const cleanupMock = vi.fn();
    vi.mocked(dropTargetForElements).mockReturnValueOnce(cleanupMock);
    
    // recreate to get the new mock
    fixture = TestBed.createComponent(CanvasDropZoneComponent);
    componentRef = fixture.componentRef;
    componentRef.setInput('index', 0);
    fixture.detectChanges();
    
    fixture.componentInstance.ngOnDestroy();
    expect(cleanupMock).toHaveBeenCalledOnce();
  });
});
