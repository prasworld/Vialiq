import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CanvasComponent } from './canvas.component';
import { FormSchemaService } from '../services/form-schema.service';
import { BuilderStateService } from '../services/builder-state.service';
import { KeyGeneratorService } from '../services/key-generator.service';
import { Component, input, Output, EventEmitter } from '@angular/core';
import { CanvasFormTitleComponent } from './canvas-form-title.component';
import { CanvasEmptyStateComponent } from './canvas-empty-state.component';
import { CanvasDropZoneComponent } from './canvas-drop-zone.component';
import { CanvasNodeComponent } from './canvas-node.component';

// Mock components
@Component({ selector: 'vi-canvas-form-title', standalone: true, template: '' })
class MockCanvasFormTitle {
  title = input('');
  @Output() titleChange = new EventEmitter<string>();
}

@Component({ selector: 'vi-canvas-empty-state', standalone: true, template: '' })
class MockCanvasEmptyState {}

@Component({ selector: 'vi-canvas-drop-zone', standalone: true, template: '' })
class MockCanvasDropZone {
  parentId = input<>();
  index = input(0);
  expandToFill = input(false);
}

@Component({ selector: 'vi-canvas-node', standalone: true, template: '' })
class MockCanvasNode {
  node = input<any>();
  parentId = input<>();
  index = input(0);
}

describe('CanvasComponent', () => {
  let component: CanvasComponent;
  let fixture: ComponentFixture<CanvasComponent>;
  let schemaService: FormSchemaService;
  let stateService: BuilderStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CanvasComponent],
      providers: [
        FormSchemaService,
        BuilderStateService,
        KeyGeneratorService
      ]
    })
    .overrideComponent(CanvasComponent, {
      remove: { imports: [CanvasFormTitleComponent, CanvasEmptyStateComponent, CanvasDropZoneComponent, CanvasNodeComponent] },
      add: { imports: [MockCanvasFormTitle, MockCanvasEmptyState, MockCanvasDropZone, MockCanvasNode] }
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CanvasComponent);
    component = fixture.componentInstance;
    schemaService = TestBed.inject(FormSchemaService);
    stateService = TestBed.inject(BuilderStateService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reflect empty state', () => {
    expect(component.isEmpty()).toBe(true);
    
    schemaService.addComponent(null, 0, { id: '1', type: 'text', label: 'Test' });
    fixture.detectChanges();
    
    expect(component.isEmpty()).toBe(false);
  });

  it('should update schema title', () => {
    component.onTitleChange('New Form Title');
    expect(schemaService.schema().title).toBe('New Form Title');
  });

  it('should clear selection', () => {
    stateService.setActiveNode('123');
    expect(stateService.activeNodeId()).toBe('123');
    
    component.clearSelection();
    expect(stateService.activeNodeId()).toBeNull();
  });
});
