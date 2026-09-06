import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HistoryService } from './history.service';
import { FormSchemaService } from './form-schema.service';
import { BUILDER_CONFIG } from '../tokens';

describe('HistoryService', () => {
  let service: HistoryService;
  let schemaService: FormSchemaService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FormSchemaService,
        {
          provide: BUILDER_CONFIG,
          useValue: { historyDebounceMs: 100, maxHistorySize: 10, allowCustomJs: false }
        }
      ]
    });
    service = TestBed.inject(HistoryService);
    schemaService = TestBed.inject(FormSchemaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
