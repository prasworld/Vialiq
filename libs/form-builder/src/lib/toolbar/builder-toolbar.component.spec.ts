import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { BuilderToolbarComponent } from './builder-toolbar.component';
import { BuilderStateService } from '../services/builder-state.service';
import { HistoryService } from '../services/history.service';
import { FormSchemaService } from '../services/form-schema.service';
import { KeyGeneratorService } from '../services/key-generator.service';

describe('BuilderToolbarComponent', () => {
  let component: BuilderToolbarComponent;
  let fixture: ComponentFixture<BuilderToolbarComponent>;
  let stateService: BuilderStateService;
  let historyService: HistoryService;
  let schemaService: FormSchemaService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuilderToolbarComponent],
      providers: [BuilderStateService, HistoryService, FormSchemaService, KeyGeneratorService]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BuilderToolbarComponent);
    component = fixture.componentInstance;
    stateService = TestBed.inject(BuilderStateService);
    historyService = TestBed.inject(HistoryService);
    schemaService = TestBed.inject(FormSchemaService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set view mode and clear active node when switching away from design mode', () => {
    stateService.setActiveNode('123');
    expect(stateService.activeNodeId()).toBe('123');

    component.setViewMode('json');
    expect(stateService.viewMode()).toBe('json');
    expect(stateService.activeNodeId()).toBeNull();
  });

  it('should set view mode but not clear active node when switching to design mode', () => {
    stateService.setActiveNode('123');
    component.setViewMode('design');
    expect(stateService.viewMode()).toBe('design');
    expect(stateService.activeNodeId()).toBe('123');
  });

  it('should log save output', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    component.save();
    expect(consoleSpy).toHaveBeenCalledWith('Saving Form Schema:', schemaService.schema());
    consoleSpy.mockRestore();
  });
});
