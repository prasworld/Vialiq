# EDC Platform Development Plan — Part 4B: Compliance & Audit

**Date:** May 31, 2026  
**Version:** 1.0  
**Status:** 📋 Planning Phase  
**Coverage:** Platform Phase 3 — Compliance (Weeks 15-17)
  
**Prerequisites:** [Part 1-4](development-plan-part-4-release.md) must be complete

---

## 🎯 Part 4B Overview

This plan covers **regulatory compliance features** required for FDA/EMA submissions:

- ✅ **P3.1** — Audit Trail (21 CFR Part 11 §11.10)
- ✅ **P3.2** — Query Management System with Translation
- ✅ **P3.3** — Electronic Signature Component
- ✅ **P3.4** — Field-Level Encryption (GDPR/HIPAA + 21 CFR Part 11 §11.10(c))

**Goal:** Full 21 CFR Part 11 compliance with:
- Complete audit trail for all data changes
- Query lifecycle with multi-lingual translation
- Canvas-based electronic signature
- ALCOA+ principles (Attributable, Legible, Contemporaneous, Original, Accurate)

---

## 📚 Document Reference Map

| Document | Lines | Key Sections for Part 4B |
|----------|-------|--------------------------|
| [form-builder-roadmap.md](form-builder-roadmap.md) | 539 | Platform Phase 3 (L465-L502) |
| [form-builder-technical-debt.md](form-builder-technical-debt.md) | 413 | TD-08 Audit Trail (L307-L335), TD-09 Query Management (L337-L370) |
| [multilingual-frontend-implementation.md](multilingual-frontend-implementation.md) | 4,312 | §6 Translation Provider Plugin (L1086-L1373), §7.1 Google Translate (L1375-L1519) |

---

## Platform Phase 3.1 — Audit Trail (21 CFR Part 11)

**Duration:** Week 15 (5 days)

**Goal:** Complete audit logging for all data changes with regulatory compliance

**Reference:** 
- [form-builder-technical-debt.md](form-builder-technical-debt.md#L307-L335)
- FDA 21 CFR Part 11 §11.10(e): "Use of secure, computer-generated, time-stamped audit trails"

### 📋 Task P3.1.1: Audit Trail Service Architecture

**Location:** `libs/shared/src/lib/services/audit-trail.service.ts`

**Requirements (21 CFR Part 11):**
- ✅ Time-stamped (ISO 8601 with timezone)
- ✅ Attributable (user ID, name, role)
- ✅ Immutable (append-only, no deletion)
- ✅ Location tracking (IP address, geo-location if available)
- ✅ Reason for change (mandatory for certain actions)
- ✅ Original and new values
- ✅ Action type (CREATE, UPDATE, DELETE, SIGN, etc.)

**Audit Event Types:**

```typescript
// libs/shared/src/lib/audit/audit-event.types.ts
export enum AuditEventType {
  // Form Designer Events
  FORM_CREATED = 'FORM_CREATED',
  FORM_UPDATED = 'FORM_UPDATED',
  FORM_DELETED = 'FORM_DELETED',
  FORM_PUBLISHED = 'FORM_PUBLISHED',
  FORM_VERSIONED = 'FORM_VERSIONED',
  
  FIELD_ADDED = 'FIELD_ADDED',
  FIELD_UPDATED = 'FIELD_UPDATED',
  FIELD_REMOVED = 'FIELD_REMOVED',
  
  VALIDATION_RULE_ADDED = 'VALIDATION_RULE_ADDED',
  VALIDATION_RULE_UPDATED = 'VALIDATION_RULE_UPDATED',
  VALIDATION_RULE_REMOVED = 'VALIDATION_RULE_REMOVED',
  
  // Data Entry Events
  DATA_CREATED = 'DATA_CREATED',
  DATA_UPDATED = 'DATA_UPDATED',
  DATA_DELETED = 'DATA_DELETED',
  
  // Edit Check Events
  EDIT_CHECK_TRIGGERED = 'EDIT_CHECK_TRIGGERED',
  EDIT_CHECK_RESOLVED = 'EDIT_CHECK_RESOLVED',
  EDIT_CHECK_OVERRIDDEN = 'EDIT_CHECK_OVERRIDE',
  
  // Query Events
  QUERY_RAISED = 'QUERY_RAISED',
  QUERY_RESPONDED = 'QUERY_RESPONDED',
  QUERY_CLOSED = 'QUERY_CLOSED',
  QUERY_REOPENED = 'QUERY_REOPENED',
  
  // Signature Events
  ESIGNATURE_APPLIED = 'ESIGNATURE_APPLIED',
  ESIGNATURE_VERIFIED = 'ESIGNATURE_VERIFIED',
  
  // User Events
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  USER_ROLE_CHANGED = 'USER_ROLE_CHANGED',
  
  // System Events
  SYSTEM_CONFIG_CHANGED = 'SYSTEM_CONFIG_CHANGED',
  PERMISSION_CHANGED = 'PERMISSION_CHANGED'
}

export enum AuditSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL'
}

export interface AuditEventMetadata {
  // User context
  userId: string;
  userName: string;
  userRole: string;
  userEmail?: string;
  
  // Timestamp (ISO 8601 with timezone)
  timestamp: string;  // e.g., "2026-05-31T14:23:45.123Z"
  
  // Location tracking
  ipAddress: string;
  userAgent: string;
  locationTimestamp?: string;  // Separate location-specific timestamp if needed
  geoLocation?: {
    latitude?: number;
    longitude?: number;
    city?: string;
    country?: string;
  };
  
  // Device information
  deviceId?: string;
  deviceType?: 'desktop' | 'tablet' | 'mobile';
  
  // Session tracking
  sessionId: string;
}

export interface AuditEvent {
  // Event identification
  eventId: string;  // UUID
  eventType: AuditEventType;
  severity: AuditSeverity;
  
  // Context
  studyId?: string;
  siteId?: string;
  subjectId?: string;
  visitId?: string;
  formId?: string;
  fieldName?: string;
  
  // Change details
  oldValue?: any;  // Original value (null for CREATE)
  newValue?: any;  // New value (null for DELETE)
  
  // Reason for change (required for certain actions)
  reasonForChange?: string;
  reasonCategory?: 'correction' | 'clarification' | 'administrative' | 'protocol-deviation';
  
  // Edit Check context (if triggered by EC)
  editCheck?: {
    ecName: string;        // Edit check rule name
    ecId: string;          // Edit check ID
    ecDescription: string; // Human-readable description
    ecSeverity: 'error' | 'warning' | 'info';
  };
  
  // User metadata
  metadata: AuditEventMetadata;
  
  // Additional context (JSON)
  additionalData?: Record<string, any>;
}

export interface AuditTrailQuery {
  studyId?: string;
  siteId?: string;
  subjectId?: string;
  userId?: string;
  eventTypes?: AuditEventType[];
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface AuditTrailResponse {
  events: AuditEvent[];
  totalCount: number;
  hasMore: boolean;
}
```

**Audit Trail Service Implementation:**

```typescript
// libs/shared/src/lib/services/audit-trail.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  AuditEvent,
  AuditEventType,
  AuditSeverity,
  AuditEventMetadata,
  AuditTrailQuery,
  AuditTrailResponse
} from '../audit/audit-event.types';

@Injectable({
  providedIn: 'root'
})
export class AuditTrailService {
  private readonly API_BASE = '/api/audit';
  
  // Current user context (injected from auth service)
  private currentUserMetadata?: AuditEventMetadata;
  
  constructor(private http: HttpClient) {
    this.initializeMetadata();
  }
  
  /**
   * Initialize user metadata for audit logging
   */
  private async initializeMetadata(): Promise<void> {
    // Get current user from auth service
    const user = await this.getCurrentUser();
    
    // Get device/location info
    const deviceInfo = this.getDeviceInfo();
    const location = await this.getLocationInfo();
    
    this.currentUserMetadata = {
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      userRole: user.role,
      userEmail: user.email,
      timestamp: new Date().toISOString(),
      ipAddress: location.ipAddress,
      userAgent: navigator.userAgent,
      locationTimestamp: new Date().toISOString(),
      geoLocation: location.geoLocation,
      deviceId: deviceInfo.deviceId,
      deviceType: deviceInfo.deviceType,
      sessionId: this.getSessionId()
    };
  }
  
  /**
   * Log an audit event
   * 
   * @example
   * auditTrail.logEvent({
   *   eventType: AuditEventType.DATA_UPDATED,
   *   studyId: 'STUDY-001',
   *   subjectId: 'SUBJ-123',
   *   formId: 'vital_signs_v1',
   *   fieldName: 'weight',
   *   oldValue: 70,
   *   newValue: 72,
   *   reasonForChange: 'Correction: measurement taken with shoes',
   *   reasonCategory: 'correction'
   * });
   */
  logEvent(event: Partial<AuditEvent>): Observable<AuditEvent> {
    // Generate event ID
    const eventId = crypto.randomUUID();
    
    // Build complete audit event
    const auditEvent: AuditEvent = {
      eventId,
      eventType: event.eventType!,
      severity: event.severity || AuditSeverity.INFO,
      studyId: event.studyId,
      siteId: event.siteId,
      subjectId: event.subjectId,
      visitId: event.visitId,
      formId: event.formId,
      fieldName: event.fieldName,
      oldValue: event.oldValue,
      newValue: event.newValue,
      reasonForChange: event.reasonForChange,
      reasonCategory: event.reasonCategory,
      editCheck: event.editCheck,
      metadata: {
        ...this.currentUserMetadata!,
        timestamp: new Date().toISOString() // Current timestamp
      },
      additionalData: event.additionalData
    };
    
    // Send to backend (append-only)
    return this.http.post<AuditEvent>(`${this.API_BASE}/events`, auditEvent).pipe(
      tap(savedEvent => {
        console.log(`[Audit] Event logged: ${savedEvent.eventType}`, savedEvent);
      })
    );
  }
  
  /**
   * Log form designer change
   */
  logFormDesignerChange(
    eventType: AuditEventType,
    formId: string,
    oldValue: any,
    newValue: any,
    fieldName?: string,
    reasonForChange?: string
  ): Observable<AuditEvent> {
    return this.logEvent({
      eventType,
      formId,
      fieldName,
      oldValue,
      newValue,
      reasonForChange,
      severity: AuditSeverity.INFO,
      additionalData: {
        source: 'form-designer'
      }
    });
  }
  
  /**
   * Log edit check triggered change
   * 
   * @example
   * auditTrail.logEditCheckChange({
   *   studyId: 'STUDY-001',
   *   subjectId: 'SUBJ-123',
   *   formId: 'vital_signs_v1',
   *   fieldName: 'weight',
   *   oldValue: 250,
   *   newValue: 75,
   *   editCheck: {
   *     ecName: 'EC_WEIGHT_RANGE',
   *     ecId: 'ec-123',
   *     ecDescription: 'Weight must be between 30-200 kg',
   *     ecSeverity: 'error'
   *   },
   *   reasonForChange: 'Corrected data entry error (transposed digits)'
   * });
   */
  logEditCheckChange(params: {
    studyId: string;
    subjectId: string;
    formId: string;
    fieldName: string;
    oldValue: any;
    newValue: any;
    editCheck: {
      ecName: string;
      ecId: string;
      ecDescription: string;
      ecSeverity: 'error' | 'warning' | 'info';
    };
    reasonForChange: string;
  }): Observable<AuditEvent> {
    return this.logEvent({
      eventType: AuditEventType.EDIT_CHECK_RESOLVED,
      severity: AuditSeverity.WARNING,
      studyId: params.studyId,
      subjectId: params.subjectId,
      formId: params.formId,
      fieldName: params.fieldName,
      oldValue: params.oldValue,
      newValue: params.newValue,
      editCheck: params.editCheck,
      reasonForChange: params.reasonForChange,
      reasonCategory: 'correction',
      additionalData: {
        source: 'edit-check',
        editCheckTriggeredAt: new Date().toISOString()
      }
    });
  }
  
  /**
   * Query audit trail
   */
  queryAuditTrail(query: AuditTrailQuery): Observable<AuditTrailResponse> {
    return this.http.post<AuditTrailResponse>(`${this.API_BASE}/query`, query);
  }
  
  /**
   * Export audit trail (PDF/CSV for regulatory submission)
   */
  exportAuditTrail(
    query: AuditTrailQuery,
    format: 'pdf' | 'csv' | 'xml'
  ): Observable<Blob> {
    return this.http.post(
      `${this.API_BASE}/export`,
      { ...query, format },
      { responseType: 'blob' }
    );
  }
  
  /**
   * Get device information
   */
  private getDeviceInfo(): { deviceId: string; deviceType: 'desktop' | 'tablet' | 'mobile' } {
    // Get or generate device ID
    let deviceId = localStorage.getItem('device-id');
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem('device-id', deviceId);
    }
    
    // Detect device type
    const userAgent = navigator.userAgent.toLowerCase();
    let deviceType: 'desktop' | 'tablet' | 'mobile' = 'desktop';
    
    if (/mobile/i.test(userAgent)) {
      deviceType = 'mobile';
    } else if (/tablet|ipad/i.test(userAgent)) {
      deviceType = 'tablet';
    }
    
    return { deviceId, deviceType };
  }
  
  /**
   * Get location information (IP + geolocation)
   */
  private async getLocationInfo(): Promise<{
    ipAddress: string;
    geoLocation?: { city?: string; country?: string };
  }> {
    try {
      // Call backend to get IP address (can't get from client reliably)
      const response = await this.http.get<any>(`${this.API_BASE}/client-info`).toPromise();
      return {
        ipAddress: response.ipAddress,
        geoLocation: response.geoLocation
      };
    } catch (error) {
      console.error('[Audit] Failed to get location info', error);
      return {
        ipAddress: 'unknown'
      };
    }
  }
  
  /**
   * Get current user (stub - replace with actual auth service)
   */
  private async getCurrentUser(): Promise<any> {
    // TODO: Inject AuthService and get current user
    return {
      id: 'user-123',
      firstName: 'John',
      lastName: 'Doe',
      role: 'Data Manager',
      email: 'john.doe@example.com'
    };
  }
  
  /**
   * Get session ID
   */
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('session-id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('session-id', sessionId);
    }
    return sessionId;
  }
}
```

**Integration Example (Form Designer):**

```typescript
// libs/form-builder/src/lib/services/form-schema.service.ts
import { AuditTrailService } from '@edc-platform/shared';

@Injectable()
export class FormSchemaService {
  constructor(private auditTrail: AuditTrailService) {}
  
  updateFieldLabel(formId: string, fieldName: string, newLabel: string): FormSchema {
    const oldSchema = this.getSchema();
    const field = this.findField(oldSchema, fieldName);
    const oldLabel = field.label;
    
    // Update schema
    const newSchema = this.updateField(oldSchema, fieldName, { label: newLabel });
    
    // Log audit event
    this.auditTrail.logFormDesignerChange(
      AuditEventType.FIELD_UPDATED,
      formId,
      { label: oldLabel },
      { label: newLabel },
      fieldName
    ).subscribe();
    
    return newSchema;
  }
}
```

**Acceptance Criteria:**
- ✅ All form designer changes logged
- ✅ All data entry changes logged
- ✅ Edit check changes include EC_NAME, ISO datetime, location
- ✅ Events are immutable (append-only)
- ✅ Timestamp in ISO 8601 format with timezone
- ✅ User attribution complete (ID, name, role, email)
- ✅ IP address and device tracking
- ✅ Reason for change captured for critical actions
- ✅ Export to PDF/CSV/XML for regulatory submission

**Estimated Effort:** 3 days

---

### 📋 Task P3.1.2: Audit Trail Viewer Component

**Location:** `libs/shared/src/lib/components/audit-trail-viewer/`

**Purpose:** Display audit trail with filtering and export capabilities

```typescript
// audit-trail-viewer.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuditTrailService, AuditEvent, AuditEventType } from '../../services/audit-trail.service';
import { Observable } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-audit-trail-viewer',
  templateUrl: './audit-trail-viewer.component.html',
  styleUrls: ['./audit-trail-viewer.component.scss']
})
export class AuditTrailViewerComponent implements OnInit {
  @Input() studyId?: string;
  @Input() subjectId?: string;
  @Input() formId?: string;
  
  auditEvents$: Observable<AuditEvent[]>;
  filterForm: FormGroup;
  
  eventTypes = Object.values(AuditEventType);
  
  constructor(
    private auditTrail: AuditTrailService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      eventTypes: [[]],
      startDate: [null],
      endDate: [null],
      userId: [''],
      searchText: ['']
    });
  }
  
  ngOnInit(): void {
    // Load audit events with filters
    this.auditEvents$ = this.filterForm.valueChanges.pipe(
      debounceTime(300),
      switchMap(filters => {
        return this.auditTrail.queryAuditTrail({
          studyId: this.studyId,
          subjectId: this.subjectId,
          eventTypes: filters.eventTypes,
          startDate: filters.startDate,
          endDate: filters.endDate,
          userId: filters.userId,
          limit: 100
        });
      })
    );
    
    // Initial load
    this.filterForm.patchValue({});
  }
  
  exportAuditTrail(format: 'pdf' | 'csv' | 'xml'): void {
    const filters = this.filterForm.value;
    
    this.auditTrail.exportAuditTrail(
      {
        studyId: this.studyId,
        subjectId: this.subjectId,
        eventTypes: filters.eventTypes,
        startDate: filters.startDate,
        endDate: filters.endDate
      },
      format
    ).subscribe(blob => {
      // Download file
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-trail-${this.studyId}-${new Date().toISOString()}.${format}`;
      link.click();
      window.URL.revokeObjectURL(url);
    });
  }
}
```

**Template:**

```html
<!-- audit-trail-viewer.component.html -->
<div class="audit-trail-viewer">
  <div class="filters">
    <form [formGroup]="filterForm">
      <!-- Event Type Filter -->
      <div class="filter-group">
        <label>Event Types</label>
        <select formControlName="eventTypes" multiple>
          <option *ngFor="let type of eventTypes" [value]="type">
            {{ type }}
          </option>
        </select>
      </div>
      
      <!-- Date Range -->
      <div class="filter-group">
        <label>Date Range</label>
        <input type="date" formControlName="startDate" placeholder="Start Date">
        <input type="date" formControlName="endDate" placeholder="End Date">
      </div>
      
      <!-- User Filter -->
      <div class="filter-group">
        <label>User ID</label>
        <input type="text" formControlName="userId" placeholder="Filter by user">
      </div>
      
      <!-- Search -->
      <div class="filter-group">
        <label>Search</label>
        <input type="text" formControlName="searchText" placeholder="Search events...">
      </div>
    </form>
    
    <!-- Export Actions -->
    <div class="export-actions">
      <button (click)="exportAuditTrail('pdf')">Export PDF</button>
      <button (click)="exportAuditTrail('csv')">Export CSV</button>
      <button (click)="exportAuditTrail('xml')">Export XML</button>
    </div>
  </div>
  
  <!-- Audit Events Table -->
  <div class="audit-events">
    <table>
      <thead>
        <tr>
          <th>Timestamp</th>
          <th>Event Type</th>
          <th>User</th>
          <th>Field</th>
          <th>Old Value</th>
          <th>New Value</th>
          <th>Reason</th>
          <th>Edit Check</th>
          <th>Location</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let event of auditEvents$ | async">
          <td>{{ event.metadata.timestamp | date:'yyyy-MM-dd HH:mm:ss z' }}</td>
          <td>
            <span class="badge" [class.critical]="event.severity === 'CRITICAL'">
              {{ event.eventType }}
            </span>
          </td>
          <td>
            <div class="user-info">
              <strong>{{ event.metadata.userName }}</strong>
              <small>{{ event.metadata.userRole }}</small>
            </div>
          </td>
          <td>{{ event.fieldName || '—' }}</td>
          <td>
            <code>{{ event.oldValue | json }}</code>
          </td>
          <td>
            <code>{{ event.newValue | json }}</code>
          </td>
          <td>
            <div *ngIf="event.reasonForChange" class="reason">
              <span class="category">{{ event.reasonCategory }}</span>
              <p>{{ event.reasonForChange }}</p>
            </div>
          </td>
          <td>
            <div *ngIf="event.editCheck" class="edit-check">
              <strong>{{ event.editCheck.ecName }}</strong>
              <small>{{ event.editCheck.ecDescription }}</small>
            </div>
          </td>
          <td>
            <div class="location">
              <small>IP: {{ event.metadata.ipAddress }}</small>
              <small *ngIf="event.metadata.geoLocation">
                {{ event.metadata.geoLocation.city }}, {{ event.metadata.geoLocation.country }}
              </small>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

**Acceptance Criteria:**
- ✅ Display all audit events in table
- ✅ Filter by event type, date range, user
- ✅ Export to PDF/CSV/XML
- ✅ Show edit check details when applicable
- ✅ Display location and timestamp
- ✅ Highlight critical events

**Estimated Effort:** 2 days

---

## Platform Phase 3.2 — Query Management System

**Duration:** Week 16 (5 days)

**Goal:** Complete query lifecycle with role-based permissions and multi-lingual translation

**Reference:** 
- [form-builder-technical-debt.md](form-builder-technical-debt.md#L337-L370)
- [multilingual-frontend-implementation.md](multilingual-frontend-implementation.md#L1086-L1373)

### 📋 Task P3.2.1: Query Management Service

**Location:** `libs/shared/src/lib/services/query-management.service.ts`

**Query Lifecycle:**

```typescript
// libs/shared/src/lib/query/query.types.ts
export enum QueryStatus {
  OPEN = 'OPEN',           // Newly raised
  RESPONDED = 'RESPONDED', // Site responded
  CLOSED = 'CLOSED',       // Resolved and closed
  REOPENED = 'REOPENED'    // Re-opened after closure
}

export enum QuerySeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum QueryType {
  MANUAL = 'MANUAL',         // Manually raised by user
  AUTOMATIC = 'AUTOMATIC',   // Auto-generated by edit check
  SYSTEM = 'SYSTEM'          // System-generated (e.g., missing data)
}

export interface QueryMessage {
  messageId: string;
  queryId: string;
  
  // Message content
  text: string;              // Original text (in user's language)
  textTranslated?: string;   // Translated text (to base study language)
  translationApproved: boolean; // Requires explicit approval
  translationApprovedBy?: string;
  translationApprovedAt?: string;
  
  // Author
  authorId: string;
  authorName: string;
  authorRole: string;
  
  // Metadata
  createdAt: string;         // ISO 8601
  isResponse: boolean;       // true if response from site
  attachments?: string[];    // File URLs
}

export interface Query {
  queryId: string;
  
  // Context
  studyId: string;
  siteId: string;
  subjectId: string;
  visitId?: string;
  formId: string;
  fieldName: string;
  
  // Query details
  queryType: QueryType;
  severity: QuerySeverity;
  status: QueryStatus;
  
  // Content
  queryText: string;         // Original query text
  queryTextTranslated?: string; // Translated to base language
  
  // Lifecycle
  raisedBy: string;          // User ID
  raisedByName: string;
  raisedByRole: string;
  raisedAt: string;          // ISO 8601
  
  closedBy?: string;
  closedByName?: string;
  closedAt?: string;
  
  reopenedBy?: string;
  reopenedByName?: string;
  reopenedAt?: string;
  
  // Translation workflow
  requiresTranslation: boolean;
  translationLanguage?: string; // Site language (e.g., "fr")
  baseLanguage: string;         // Study base language (e.g., "en")
  
  // Messages (query + responses)
  messages: QueryMessage[];
  
  // Additional metadata
  metadata?: Record<string, any>;
}

export interface QueryFilter {
  studyId?: string;
  siteId?: string;
  subjectId?: string;
  status?: QueryStatus[];
  severity?: QuerySeverity[];
  raisedBy?: string;
  startDate?: Date;
  endDate?: Date;
  requiresTranslation?: boolean;
  limit?: number;
  offset?: number;
}
```

**Query Management Service:**

```typescript
// libs/shared/src/lib/services/query-management.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Query, QueryMessage, QueryStatus, QuerySeverity, QueryType, QueryFilter } from '../query/query.types';
import { AuditTrailService, AuditEventType } from './audit-trail.service';

@Injectable({
  providedIn: 'root'
})
export class QueryManagementService {
  private readonly API_BASE = '/api/queries';
  
  constructor(
    private http: HttpClient,
    private auditTrail: AuditTrailService
  ) {}
  
  /**
   * Raise a new query
   * 
   * Allowed roles: Data Manager, CDM, Investigator
   * 
   * @example
   * queryService.raiseQuery({
   *   studyId: 'STUDY-001',
   *   siteId: 'SITE-123',
   *   subjectId: 'SUBJ-456',
   *   formId: 'vital_signs_v1',
   *   fieldName: 'weight',
   *   queryType: QueryType.MANUAL,
   *   severity: QuerySeverity.MEDIUM,
   *   queryText: 'Please confirm weight measurement is correct',
   *   requiresTranslation: true
   * });
   */
  raiseQuery(params: {
    studyId: string;
    siteId: string;
    subjectId: string;
    visitId?: string;
    formId: string;
    fieldName: string;
    queryType: QueryType;
    severity: QuerySeverity;
    queryText: string;
    requiresTranslation?: boolean;
  }): Observable<Query> {
    const query: Partial<Query> = {
      queryId: crypto.randomUUID(),
      ...params,
      status: QueryStatus.OPEN,
      messages: [],
      raisedAt: new Date().toISOString()
    };
    
    return this.http.post<Query>(`${this.API_BASE}`, query).pipe(
      tap(createdQuery => {
        // Log audit event
        this.auditTrail.logEvent({
          eventType: AuditEventType.QUERY_RAISED,
          studyId: createdQuery.studyId,
          subjectId: createdQuery.subjectId,
          formId: createdQuery.formId,
          fieldName: createdQuery.fieldName,
          newValue: createdQuery.queryText,
          additionalData: {
            queryId: createdQuery.queryId,
            severity: createdQuery.severity
          }
        }).subscribe();
      })
    );
  }
  
  /**
   * Respond to a query
   * 
   * Allowed roles: Site Data Entry Operator, Data Manager
   * 
   * @example
   * queryService.respondToQuery('query-123', {
   *   text: 'Weight is correct, measured without shoes',
   *   requiresTranslation: true
   * });
   */
  respondToQuery(
    queryId: string,
    response: {
      text: string;
      attachments?: string[];
      requiresTranslation?: boolean;
    }
  ): Observable<Query> {
    const message: Partial<QueryMessage> = {
      messageId: crypto.randomUUID(),
      queryId,
      text: response.text,
      isResponse: true,
      translationApproved: false, // Must be explicitly approved
      createdAt: new Date().toISOString(),
      attachments: response.attachments
    };
    
    return this.http.post<Query>(`${this.API_BASE}/${queryId}/respond`, message).pipe(
      tap(updatedQuery => {
        // Update status to RESPONDED
        this.updateQueryStatus(queryId, QueryStatus.RESPONDED).subscribe();
        
        // Log audit event
        this.auditTrail.logEvent({
          eventType: AuditEventType.QUERY_RESPONDED,
          studyId: updatedQuery.studyId,
          subjectId: updatedQuery.subjectId,
          formId: updatedQuery.formId,
          fieldName: updatedQuery.fieldName,
          newValue: response.text,
          additionalData: {
            queryId: updatedQuery.queryId
          }
        }).subscribe();
      })
    );
  }
  
  /**
   * Close a query
   * 
   * Allowed roles: Data Manager, CDM, Investigator
   */
  closeQuery(queryId: string, resolution?: string): Observable<Query> {
    return this.http.post<Query>(`${this.API_BASE}/${queryId}/close`, { resolution }).pipe(
      tap(closedQuery => {
        // Log audit event
        this.auditTrail.logEvent({
          eventType: AuditEventType.QUERY_CLOSED,
          studyId: closedQuery.studyId,
          subjectId: closedQuery.subjectId,
          formId: closedQuery.formId,
          fieldName: closedQuery.fieldName,
          additionalData: {
            queryId: closedQuery.queryId,
            resolution
          }
        }).subscribe();
      })
    );
  }
  
  /**
   * Reopen a query
   * 
   * Allowed roles: Data Manager, CDM, Investigator
   */
  reopenQuery(queryId: string, reason: string): Observable<Query> {
    return this.http.post<Query>(`${this.API_BASE}/${queryId}/reopen`, { reason }).pipe(
      tap(reopenedQuery => {
        // Log audit event
        this.auditTrail.logEvent({
          eventType: AuditEventType.QUERY_REOPENED,
          studyId: reopenedQuery.studyId,
          subjectId: reopenedQuery.subjectId,
          formId: reopenedQuery.formId,
          fieldName: reopenedQuery.fieldName,
          additionalData: {
            queryId: reopenedQuery.queryId,
            reason
          }
        }).subscribe();
      })
    );
  }
  
  /**
   * Update query status (internal)
   */
  private updateQueryStatus(queryId: string, status: QueryStatus): Observable<Query> {
    return this.http.patch<Query>(`${this.API_BASE}/${queryId}`, { status });
  }
  
  /**
   * Get query by ID
   */
  getQuery(queryId: string): Observable<Query> {
    return this.http.get<Query>(`${this.API_BASE}/${queryId}`);
  }
  
  /**
   * Query queries (with filters)
   */
  queryQueries(filter: QueryFilter): Observable<{ queries: Query[]; totalCount: number }> {
    return this.http.post<{ queries: Query[]; totalCount: number }>(
      `${this.API_BASE}/search`,
      filter
    );
  }
  
  /**
   * Get queries for subject
   */
  getQueriesForSubject(studyId: string, subjectId: string): Observable<Query[]> {
    return this.http.get<Query[]>(`${this.API_BASE}/subject/${studyId}/${subjectId}`);
  }
}
```

**Acceptance Criteria:**
- ✅ Data Managers/CDM/Investigators can raise queries
- ✅ Site operators can only respond
- ✅ Status lifecycle (OPEN → RESPONDED → CLOSED → REOPENED)
- ✅ All actions audit logged
- ✅ Query metadata complete

**Estimated Effort:** 2 days

---

### 📋 Task P3.2.2: Query Translation Service

**Location:** `libs/shared/src/lib/services/query-translation.service.ts`

**Purpose:** Translate queries from site language to base study language with approval workflow

**Reference:** [multilingual-frontend-implementation.md](multilingual-frontend-implementation.md#L1266-L1373)

```typescript
// libs/shared/src/lib/services/query-translation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AutoTranslationService } from './auto-translation.service';
import { TranslationProviderRegistry } from '../translation-providers/translation-provider.registry';
import { Query, QueryMessage } from '../query/query.types';

export interface TranslationRequest {
  text: string;
  sourceLanguage: string;  // Site language (e.g., "fr")
  targetLanguage: string;  // Base study language (e.g., "en")
  queryId: string;
  messageId: string;
}

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  provider: string;          // "google" | "aws" | "deepl" | "custom"
  confidence?: number;       // 0-1
  requiresReview: true;      // Always true (no auto-approval)
  translatedAt: string;
}

export interface TranslationApproval {
  messageId: string;
  translatedText: string;
  approvedBy: string;
  approvedAt: string;
  corrections?: string;       // Optional translator corrections
}

@Injectable({
  providedIn: 'root'
})
export class QueryTranslationService {
  private readonly API_BASE = '/api/query-translations';
  
  constructor(
    private http: HttpClient,
    private autoTranslationService: AutoTranslationService,
    private providerRegistry: TranslationProviderRegistry
  ) {}
  
  /**
   * Auto-translate query text
   * 
   * Uses configured translation provider from study settings
   * 
   * @example
   * queryTranslation.translateQuery({
   *   text: 'Veuillez confirmer que le poids est correct',
   *   sourceLanguage: 'fr',
   *   targetLanguage: 'en',
   *   queryId: 'query-123',
   *   messageId: 'msg-456'
   * });
   */
  async translateQuery(request: TranslationRequest): Promise<TranslationResult> {
    console.log(`[QueryTranslation] Translating from ${request.sourceLanguage} to ${request.targetLanguage}`);
    
    // Get active translation provider
    const provider = this.providerRegistry.getActiveProvider();
    
    if (!provider) {
      throw new Error('No translation provider configured');
    }
    
    // Perform translation
    const translatedText = await provider.translate(
      request.text,
      request.sourceLanguage,
      request.targetLanguage
    );
    
    const result: TranslationResult = {
      originalText: request.text,
      translatedText,
      sourceLanguage: request.sourceLanguage,
      targetLanguage: request.targetLanguage,
      provider: provider.providerId,
      requiresReview: true,  // ⚠️ Always requires manual review
      translatedAt: new Date().toISOString()
    };
    
    // Save translation (pending approval)
    await this.http.post(`${this.API_BASE}/pending`, {
      ...result,
      queryId: request.queryId,
      messageId: request.messageId
    }).toPromise();
    
    return result;
  }
  
  /**
   * Approve translation
   * 
   * Only users with "Translator" role can approve
   * 
   * @example
   * queryTranslation.approveTranslation({
   *   messageId: 'msg-456',
   *   translatedText: 'Please confirm weight is correct', // Can be corrected
   *   approvedBy: 'translator-123',
   *   approvedAt: new Date().toISOString(),
   *   corrections: 'Changed "le poids" to "weight" (more accurate)'
   * });
   */
  approveTranslation(approval: TranslationApproval): Observable<void> {
    console.log(`[QueryTranslation] Approving translation for message ${approval.messageId}`);
    
    return this.http.post<void>(`${this.API_BASE}/approve`, approval).pipe(
      tap(() => {
        console.log(`[QueryTranslation] Translation approved by ${approval.approvedBy}`);
      })
    );
  }
  
  /**
   * Reject translation (request manual translation)
   */
  rejectTranslation(
    messageId: string,
    reason: string,
    rejectedBy: string
  ): Observable<void> {
    return this.http.post<void>(`${this.API_BASE}/reject`, {
      messageId,
      reason,
      rejectedBy,
      rejectedAt: new Date().toISOString()
    });
  }
  
  /**
   * Get pending translations for translator review
   */
  getPendingTranslations(studyId: string): Observable<TranslationResult[]> {
    return this.http.get<TranslationResult[]>(`${this.API_BASE}/pending/${studyId}`);
  }
  
  /**
   * Batch translate multiple messages
   */
  async batchTranslate(
    messages: Array<{ text: string; sourceLanguage: string; targetLanguage: string }>
  ): Promise<TranslationResult[]> {
    const provider = this.providerRegistry.getActiveProvider();
    
    if (!provider) {
      throw new Error('No translation provider configured');
    }
    
    // Translate in parallel (respect rate limits in production)
    const translations = await Promise.all(
      messages.map(async msg => {
        const translatedText = await provider!.translate(
          msg.text,
          msg.sourceLanguage,
          msg.targetLanguage
        );
        
        return {
          originalText: msg.text,
          translatedText,
          sourceLanguage: msg.sourceLanguage,
          targetLanguage: msg.targetLanguage,
          provider: provider!.providerId,
          requiresReview: true,
          translatedAt: new Date().toISOString()
        };
      })
    );
    
    return translations;
  }
}
```

**Acceptance Criteria:**
- ✅ Auto-translate using configured provider (Google/AWS/DeepL/Custom)
- ✅ Translation requires explicit approval (no auto-approval)
- ✅ Translator role can approve/reject translations
- ✅ Translators can correct auto-translations
- ✅ Pending translations queue for review
- ✅ Batch translation support

**Estimated Effort:** 2 days

---

### 📋 Task P3.2.3: Query Management UI Components

**Location:** `libs/shared/src/lib/components/query-management/`

```typescript
// query-list.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { QueryManagementService, Query, QueryStatus } from '../../services/query-management.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-query-list',
  template: `
    <div class="query-list">
      <div class="query-filters">
        <label>
          <input type="checkbox" [(ngModel)]="showOpen"> Open
        </label>
        <label>
          <input type="checkbox" [(ngModel)]="showResponded"> Responded
        </label>
        <label>
          <input type="checkbox" [(ngModel)]="showClosed"> Closed
        </label>
      </div>
      
      <table class="queries-table">
        <thead>
          <tr>
            <th>Query ID</th>
            <th>Subject</th>
            <th>Form</th>
            <th>Field</th>
            <th>Status</th>
            <th>Severity</th>
            <th>Raised By</th>
            <th>Raised At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let query of queries$ | async" (click)="selectQuery(query)">
            <td>{{ query.queryId }}</td>
            <td>{{ query.subjectId }}</td>
            <td>{{ query.formId }}</td>
            <td>{{ query.fieldName }}</td>
            <td>
              <span class="badge status-{{query.status}}">{{ query.status }}</span>
            </td>
            <td>
              <span class="badge severity-{{query.severity}}">{{ query.severity }}</span>
            </td>
            <td>{{ query.raisedByName }}</td>
            <td>{{ query.raisedAt | date:'short' }}</td>
            <td>
              <button *ngIf="canRespond()" (click)="respondToQuery(query)">Respond</button>
              <button *ngIf="canClose()" (click)="closeQuery(query)">Close</button>
              <button *ngIf="canReopen()" (click)="reopenQuery(query)">Reopen</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class QueryListComponent implements OnInit {
  @Input() studyId: string;
  @Input() subjectId?: string;
  
  queries$: Observable<Query[]>;
  showOpen = true;
  showResponded = true;
  showClosed = false;
  
  constructor(private queryService: QueryManagementService) {}
  
  ngOnInit(): void {
    this.loadQueries();
  }
  
  loadQueries(): void {
    const statuses: QueryStatus[] = [];
    if (this.showOpen) statuses.push(QueryStatus.OPEN);
    if (this.showResponded) statuses.push(QueryStatus.RESPONDED);
    if (this.showClosed) statuses.push(QueryStatus.CLOSED);
    
    this.queries$ = this.queryService.queryQueries({
      studyId: this.studyId,
      subjectId: this.subjectId,
      status: statuses
    }).pipe(map(result => result.queries));
  }
  
  canRespond(): boolean {
    // Check if user has Site Data Entry or Data Manager role
    return true; // TODO: Implement role check
  }
  
  canClose(): boolean {
    // Check if user has Data Manager/CDM/Investigator role
    return true; // TODO: Implement role check
  }
  
  canReopen(): boolean {
    // Check if user has Data Manager/CDM/Investigator role
    return true; // TODO: Implement role check
  }
  
  selectQuery(query: Query): void {
    // Navigate to query details
  }
  
  respondToQuery(query: Query): void {
    // Open response modal
  }
  
  closeQuery(query: Query): void {
    this.queryService.closeQuery(query.queryId).subscribe();
  }
  
  reopenQuery(query: Query): void {
    // Open reopen modal with reason
  }
}
```

**Query Translation Review Component:**

```typescript
// query-translation-review.component.ts
import { Component, OnInit } from '@angular/core';
import { QueryTranslationService, TranslationResult } from '../../services/query-translation.service';

@Component({
  selector: 'app-query-translation-review',
  template: `
    <div class="translation-review">
      <h2>Pending Translations</h2>
      
      <div *ngFor="let translation of pendingTranslations" class="translation-item">
        <div class="original">
          <label>Original ({{ translation.sourceLanguage }})</label>
          <p>{{ translation.originalText }}</p>
        </div>
        
        <div class="translated">
          <label>Translated ({{ translation.targetLanguage }})</label>
          <textarea [(ngModel)]="translation.translatedText" rows="3"></textarea>
          <small>Provider: {{ translation.provider }}</small>
        </div>
        
        <div class="actions">
          <button (click)="approve(translation)">Approve</button>
          <button (click)="reject(translation)">Reject</button>
        </div>
      </div>
    </div>
  `
})
export class QueryTranslationReviewComponent implements OnInit {
  pendingTranslations: TranslationResult[] = [];
  
  constructor(private translationService: QueryTranslationService) {}
  
  ngOnInit(): void {
    this.loadPendingTranslations();
  }
  
  loadPendingTranslations(): void {
    // TODO: Get studyId from context
    const studyId = 'STUDY-001';
    
    this.translationService.getPendingTranslations(studyId).subscribe(
      translations => {
        this.pendingTranslations = translations;
      }
    );
  }
  
  approve(translation: TranslationResult): void {
    this.translationService.approveTranslation({
      messageId: translation.messageId,
      translatedText: translation.translatedText,
      approvedBy: 'current-user-id', // TODO: Get from auth
      approvedAt: new Date().toISOString()
    }).subscribe(() => {
      // Remove from pending list
      this.pendingTranslations = this.pendingTranslations.filter(
        t => t.messageId !== translation.messageId
      );
    });
  }
  
  reject(translation: TranslationResult): void {
    const reason = prompt('Reason for rejection:');
    if (!reason) return;
    
    this.translationService.rejectTranslation(
      translation.messageId,
      reason,
      'current-user-id' // TODO: Get from auth
    ).subscribe(() => {
      // Remove from pending list
      this.pendingTranslations = this.pendingTranslations.filter(
        t => t.messageId !== translation.messageId
      );
    });
  }
}
```

**Acceptance Criteria:**
- ✅ Query list with filters (status, severity)
- ✅ Role-based action buttons
- ✅ Translation review UI for translators
- ✅ Approve/reject workflow
- ✅ Real-time updates

**Estimated Effort:** 1 day

---

## Platform Phase 3.3 — Electronic Signature Component

**Duration:** Week 17 (5 days)

**Goal:** Canvas-based signature component for regulatory compliance

**Reference:** [form-builder-roadmap.md](form-builder-roadmap.md#L493-L502)

### 📋 Task P3.3.1: `<vi-signature>` Web Component

**Location:** `libs/web-components/src/components/vi-signature/`

**Purpose:** Canvas-based signature capture with mouse/touchpad support

**Note:** Signature pad/device support (e.g., Wacom tablets) requires further discussion and is **out of scope** for v1.0

```typescript
// vi-signature.ts
import { LitElement, html, css } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';

@customElement('vi-signature')
export class ViSignature extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100%;
    }
    
    .signature-container {
      border: 2px solid var(--border-color, #ccc);
      border-radius: 4px;
      background: var(--background-color, #fff);
      position: relative;
    }
    
    canvas {
      display: block;
      width: 100%;
      height: 100%;
      cursor: crosshair;
      touch-action: none;
    }
    
    .signature-controls {
      display: flex;
      gap: 8px;
      margin-top: 8px;
      justify-content: flex-end;
    }
    
    button {
      padding: 8px 16px;
      border: 1px solid #ccc;
      border-radius: 4px;
      background: #fff;
      cursor: pointer;
    }
    
    button:hover {
      background: #f5f5f5;
    }
    
    .clear-btn {
      color: #d32f2f;
    }
    
    .placeholder {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #999;
      pointer-events: none;
      font-size: 14px;
    }
    
    :host([disabled]) canvas {
      cursor: not-allowed;
      opacity: 0.6;
    }
  `;
  
  @property({ type: Number }) width = 400;
  @property({ type: Number }) height = 200;
  @property({ type: String }) strokeColor = '#000000';
  @property({ type: Number }) strokeWidth = 2;
  @property({ type: Boolean }) disabled = false;
  @property({ type: String }) placeholder = 'Sign here';
  
  @state() private isEmpty = true;
  @state() private isDrawing = false;
  
  @query('canvas') canvas!: HTMLCanvasElement;
  
  private ctx: CanvasRenderingContext2D | null = null;
  private lastX = 0;
  private lastY = 0;
  
  firstUpdated() {
    this.ctx = this.canvas.getContext('2d');
    this.setupCanvas();
    this.attachEventListeners();
  }
  
  private setupCanvas() {
    // Set canvas size (use device pixel ratio for sharp rendering)
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    
    this.ctx!.scale(dpr, dpr);
    
    // Configure drawing style
    this.ctx!.strokeStyle = this.strokeColor;
    this.ctx!.lineWidth = this.strokeWidth;
    this.ctx!.lineCap = 'round';
    this.ctx!.lineJoin = 'round';
  }
  
  private attachEventListeners() {
    // Mouse events
    this.canvas.addEventListener('mousedown', this.handleStart.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handleEnd.bind(this));
    this.canvas.addEventListener('mouseleave', this.handleEnd.bind(this));
    
    // Touch events (for touchpads/tablets)
    this.canvas.addEventListener('touchstart', this.handleStart.bind(this));
    this.canvas.addEventListener('touchmove', this.handleMove.bind(this));
    this.canvas.addEventListener('touchend', this.handleEnd.bind(this));
  }
  
  private handleStart(e: MouseEvent | TouchEvent) {
    if (this.disabled) return;
    
    e.preventDefault();
    this.isDrawing = true;
    
    const coords = this.getCoordinates(e);
    this.lastX = coords.x;
    this.lastY = coords.y;
    
    // Begin path
    this.ctx!.beginPath();
    this.ctx!.moveTo(this.lastX, this.lastY);
  }
  
  private handleMove(e: MouseEvent | TouchEvent) {
    if (!this.isDrawing || this.disabled) return;
    
    e.preventDefault();
    
    const coords = this.getCoordinates(e);
    
    // Draw line
    this.ctx!.lineTo(coords.x, coords.y);
    this.ctx!.stroke();
    
    this.lastX = coords.x;
    this.lastY = coords.y;
    
    this.isEmpty = false;
  }
  
  private handleEnd(e: MouseEvent | TouchEvent) {
    if (!this.isDrawing) return;
    
    e.preventDefault();
    this.isDrawing = false;
    
    // Dispatch change event
    this.dispatchEvent(new CustomEvent('signature-change', {
      detail: {
        isEmpty: this.isEmpty,
        dataUrl: this.toDataURL()
      }
    }));
  }
  
  private getCoordinates(e: MouseEvent | TouchEvent): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    
    if (e instanceof MouseEvent) {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    } else {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    }
  }
  
  /**
   * Clear signature
   */
  clear() {
    this.ctx!.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.isEmpty = true;
    
    this.dispatchEvent(new CustomEvent('signature-cleared'));
  }
  
  /**
   * Get signature as PNG data URL
   */
  toDataURL(format: 'image/png' | 'image/jpeg' = 'image/png'): string {
    return this.canvas.toDataURL(format);
  }
  
  /**
   * Get signature as Blob
   */
  async toBlob(format: 'image/png' | 'image/jpeg' = 'image/png'): Promise<Blob> {
    return new Promise((resolve, reject) => {
      this.canvas.toBlob(blob => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      }, format);
    });
  }
  
  /**
   * Get signature as SVG (for scalability)
   */
  toSVG(): string {
    // TODO: Implement SVG export if needed
    // Would require tracking all path data
    return '';
  }
  
  /**
   * Check if signature is empty
   */
  get signatureIsEmpty(): boolean {
    return this.isEmpty;
  }
  
  render() {
    return html`
      <div class="signature-container">
        <canvas 
          width="${this.width}" 
          height="${this.height}"
        ></canvas>
        
        ${this.isEmpty ? html`
          <div class="placeholder">${this.placeholder}</div>
        ` : ''}
      </div>
      
      <div class="signature-controls">
        <button 
          class="clear-btn" 
          @click="${this.clear}"
          ?disabled="${this.disabled || this.isEmpty}"
        >
          Clear
        </button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-signature': ViSignature;
  }
}
```

**Usage Example:**

```typescript
// In Angular component
<vi-signature
  width="500"
  height="200"
  strokeColor="#000"
  strokeWidth="2"
  placeholder="Sign here"
  (signature-change)="onSignatureChange($event)"
  (signature-cleared)="onSignatureCleared()"
></vi-signature>

// Component logic
onSignatureChange(event: CustomEvent) {
  const { isEmpty, dataUrl } = event.detail;
  
  if (!isEmpty) {
    // Save signature
    this.signatureDataUrl = dataUrl;
  }
}

async saveSignature() {
  const signatureEl = document.querySelector('vi-signature') as ViSignature;
  
  // Get as blob
  const blob = await signatureEl.toBlob('image/png');
  
  // Upload to server
  const formData = new FormData();
  formData.append('signature', blob, 'signature.png');
  
  this.http.post('/api/signatures', formData).subscribe();
}
```

**Acceptance Criteria:**
- ✅ Canvas-based signature capture
- ✅ Mouse and touchpad support
- ✅ Clear button
- ✅ Export as PNG/JPEG
- ✅ Data URL and Blob export
- ✅ Placeholder text when empty
- ✅ Disabled state
- ✅ WDIO tests for signature capture

**Estimated Effort:** 3 days

---

### 📋 Task P3.3.2: Electronic Signature Service

**Location:** `libs/shared/src/lib/services/esignature.service.ts`

**Purpose:** Manage electronic signatures with audit trail integration

```typescript
// libs/shared/src/lib/services/esignature.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditTrailService, AuditEventType } from './audit-trail.service';

export interface ElectronicSignature {
  signatureId: string;
  
  // Context
  studyId: string;
  subjectId?: string;
  formId?: string;
  documentId?: string;  // For signing documents/consents
  
  // Signer
  signerId: string;
  signerName: string;
  signerRole: string;
  signerEmail: string;
  
  // Signature data
  signatureDataUrl: string;  // PNG data URL
  signatureBlob?: Blob;      // Original blob
  
  // Metadata
  signedAt: string;          // ISO 8601
  meaning: string;           // What the signature represents (e.g., "Investigator approval")
  ipAddress: string;
  deviceId: string;
  
  // Verification
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ESignatureService {
  private readonly API_BASE = '/api/esignatures';
  
  constructor(
    private http: HttpClient,
    private auditTrail: AuditTrailService
  ) {}
  
  /**
   * Apply electronic signature
   */
  applySignature(params: {
    studyId: string;
    subjectId?: string;
    formId?: string;
    documentId?: string;
    signatureBlob: Blob;
    meaning: string;
  }): Observable<ElectronicSignature> {
    const formData = new FormData();
    formData.append('signature', params.signatureBlob, 'signature.png');
    formData.append('studyId', params.studyId);
    if (params.subjectId) formData.append('subjectId', params.subjectId);
    if (params.formId) formData.append('formId', params.formId);
    if (params.documentId) formData.append('documentId', params.documentId);
    formData.append('meaning', params.meaning);
    
    return this.http.post<ElectronicSignature>(`${this.API_BASE}`, formData).pipe(
      tap(signature => {
        // Log audit event
        this.auditTrail.logEvent({
          eventType: AuditEventType.ESIGNATURE_APPLIED,
          studyId: signature.studyId,
          subjectId: signature.subjectId,
          formId: signature.formId,
          additionalData: {
            signatureId: signature.signatureId,
            meaning: signature.meaning,
            signer: signature.signerName
          }
        }).subscribe();
      })
    );
  }
  
  /**
   * Verify signature
   */
  verifySignature(signatureId: string): Observable<ElectronicSignature> {
    return this.http.post<ElectronicSignature>(
      `${this.API_BASE}/${signatureId}/verify`,
      {}
    ).pipe(
      tap(signature => {
        // Log audit event
        this.auditTrail.logEvent({
          eventType: AuditEventType.ESIGNATURE_VERIFIED,
          studyId: signature.studyId,
          additionalData: {
            signatureId: signature.signatureId,
            verifier: signature.verifiedBy
          }
        }).subscribe();
      })
    );
  }
  
  /**
   * Get signatures for subject/form/document
   */
  getSignatures(params: {
    studyId: string;
    subjectId?: string;
    formId?: string;
    documentId?: string;
  }): Observable<ElectronicSignature[]> {
    return this.http.get<ElectronicSignature[]>(`${this.API_BASE}`, { params: params as any });
  }
}
```

**Acceptance Criteria:**
- ✅ Apply signature with context (study, subject, form, document)
- ✅ Store signature as PNG blob
- ✅ Audit trail integration
- ✅ Verification workflow
- ✅ Retrieve signatures by context

**Estimated Effort:** 2 days

---

## Platform Phase 3.4 — Field-Level Encryption

**Duration:** Week 18 (5 days)

**Goal:** AES-256-GCM field-level encryption with KMS-managed keys, versioning lock, GDPR crypto-shredding, and edit check exclusion.

**Reference:** [field-level-encryption-clinical-edc.md](./field-level-encryption-clinical-edc.md) §12–15 for .NET implementation

---

### 📋 Task P3.4.1: KMS Integration — `IKeyManagementService`

**Location:** `backend/src/Encryption/KeyManagement/`

**Purpose:** Abstract over AWS KMS / Azure Key Vault. Implements envelope encryption — fetch/generate a Data Encryption Key (DEK) per tenant, wrap it with the KMS master key. DEK is cached in-memory for 5 minutes (never persisted to disk).

```csharp
public interface IKeyManagementService
{
    Task<DataEncryptionKey> GetOrCreateDekAsync(string tenantId, CancellationToken ct = default);
    Task DeleteDekAsync(string tenantId, CancellationToken ct = default);  // GDPR crypto-shredding
}

public sealed record DataEncryptionKey(byte[] KeyBytes, string KeyId, DateTimeOffset CreatedAt);
```

**Key design decisions:**
- One DEK per tenant (not per study or per field — see §5 of FLE doc for rationale)
- DEK is wrapped by KMS and stored as `encryptedDek` blob in the `TenantKeys` collection
- In-memory cache uses `IMemoryCache` with 5-minute sliding expiration

**Acceptance Criteria:**
- ✅ AWS KMS and Azure Key Vault implementations behind `IKeyManagementService`
- ✅ DEK fetch verified against performance budget (< 5ms from cache, < 100ms from KMS)
- ✅ DEK never written to application database unencrypted
- ✅ Unit tests with in-memory mock KMS

**Estimated Effort:** 1 day

---

### 📋 Task P3.4.2: `AesGcmFieldEncryptionService`

**Location:** `backend/src/Encryption/Services/AesGcmFieldEncryptionService.cs`

**Purpose:** Encrypt / decrypt individual field values using AES-256-GCM with a random 96-bit nonce. Produces an `EncryptedFieldValue` envelope stored in MongoDB.

```csharp
public interface IFieldEncryptionService
{
    Task<EncryptedFieldValue> EncryptAsync(string tenantId, string plaintext, CancellationToken ct = default);
    Task<string> DecryptAsync(string tenantId, EncryptedFieldValue cipherEnvelope, CancellationToken ct = default);
}

// MongoDB storage model
public sealed record EncryptedFieldValue(
    string Algorithm,    // "AES-256-GCM"
    string Nonce,        // base64, 12 bytes random
    string CipherText,   // base64
    string Tag,          // base64, 16-byte GCM authentication tag
    string KeyId         // DEK identifier from KMS
);
```

**Acceptance Criteria:**
- ✅ AES-256-GCM with random 96-bit nonce (no nonce reuse)
- ✅ GCM authentication tag validated on every decrypt
- ✅ `ArgumentException` thrown (not silently ignored) if GCM tag verification fails
- ✅ Unit tests: encrypt→decrypt round-trip, tamper detection, nonce uniqueness

**Estimated Effort:** 1 day

---

### 📋 Task P3.4.3: Save/Read Pipeline Middleware

**Location:** `backend/src/Forms/Pipelines/`

**Purpose:** Pre/post processors that transparently encrypt on save and decrypt on read for fields with `encryption.enabled = true`.

```csharp
// Pre-save: encrypt plaintext fields
public class EncryptFieldsPipelineBehavior<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : ISubmissionCommand
{
    // For each field in submission where schema.encryption.enabled == true:
    //   1. Call IFieldEncryptionService.EncryptAsync(tenantId, plaintext)
    //   2. Replace plaintext value with EncryptedFieldValue envelope
    //   3. Set encryption.lockedAt on schema field if not already set
}

// Post-read: decrypt for authorised roles
public class DecryptFieldsPipelineBehavior<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
    where TResponse : ISubmissionQueryResult
{
    // For each encrypted field:
    //   1. Check caller's role is in schema.encryption.authorisedRoles
    //   2. If authorised: decrypt and return plaintext
    //   3. If not authorised: return "***ENCRYPTED***" sentinel
}
```

**Acceptance Criteria:**
- ✅ Encrypted fields are never stored as plaintext in MongoDB
- ✅ Role-based decryption ACL enforced (see FLE doc §24)
- ✅ `encryption.lockedAt` stamped on first save
- ✅ Integration test: save encrypted field → read with/without authorised role

**Estimated Effort:** 1.5 days

---

### 📋 Task P3.4.4: Builder UI — Lock Icon + Field Picker Exclusion

**Location:** `libs/web-components/src/components/form-builder/`

**Purpose:** Two UI changes to enforce FLE constraints in the form builder:
1. Encryption toggle is greyed out (disabled) when `encryption.lockedAt` is non-null
2. Encrypted fields are excluded from the edit check field picker (JsonLogic condition builder)

```typescript
// In field properties panel — encryption toggle
get isEncryptionLocked(): boolean {
  return !!this.field.encryption?.lockedAt;
}

// In edit check field picker
get availableFields(): FieldDescriptor[] {
  return this.form.allFields.filter(f => !f.encryption?.enabled);
}
```

**Acceptance Criteria:**
- ✅ Encryption toggle disabled with tooltip when `lockedAt` is set
- ✅ Encrypted fields absent from edit check field picker
- ✅ `validateNoEncryptedFieldsInEditChecks()` runs at publish time (see form-builder-validation.md §26)
- ✅ No visual regression (Storybook stories)

**Estimated Effort:** 1 day

---

### 📋 Task P3.4.5: GDPR Crypto-Shredding Endpoint

**Location:** `backend/src/Tenants/Controllers/TenantGdprController.cs`

**Purpose:** GDPR Art. 17 "right to erasure" — delete the tenant's DEK, making all encrypted field values unreadable. MongoDB records are retained intact for FDA 21 CFR Part 11 audit trail requirements.

```csharp
[HttpDelete("api/tenants/{tenantId}/gdpr/dek")]
[Authorize(Roles = "PlatformAdmin,DataPrivacyOfficer")]
public async Task<IActionResult> DeleteDataEncryptionKey(string tenantId)
{
    await _keyManagementService.DeleteDekAsync(tenantId);
    await _auditTrailService.LogAsync(new AuditEvent(
        EventType: "GDPR_CRYPTO_SHRED",
        TenantId: tenantId,
        Actor: User.Identity!.Name!,
        Timestamp: DateTimeOffset.UtcNow,
        Details: "DEK deleted — all encrypted fields are now unreadable"
    ));
    return NoContent();
}
```

**Acceptance Criteria:**
- ✅ DEK deletion confirmed from KMS (not just in-memory cache)
- ✅ Audit trail entry recorded for the shred event itself (the event metadata is not encrypted)
- ✅ Post-shred read: encrypted fields return appropriate error (GCM tag failure or key-not-found)
- ✅ Accessible only to `PlatformAdmin` or `DataPrivacyOfficer` roles
- ✅ Integration test: shred → attempt decrypt → verify failure

**Estimated Effort:** 0.5 days

---

## Platform Phase 3 Summary

**Total Duration:** Weeks 15-18 (20 days)

**Deliverables:**
- ✅ **P3.1**: Audit Trail Service (21 CFR Part 11 compliant)
  - Immutable, time-stamped, attributable
  - Edit check logging with EC_NAME + ISO datetime + location
  - Audit viewer with export (PDF/CSV/XML)
  
- ✅ **P3.2**: Query Management System
  - Full lifecycle (raise, respond, close, reopen)
  - Role-based permissions (Data Manager, CDM, Investigator, Site Operator)
  - Translation module (site language → base language)
  - Auto-translate via configured provider (requires approval)
  - Translator role for review/approval
  
- ✅ **P3.3**: Electronic Signature Component
  - `<vi-signature>` web component (canvas-based)
  - Mouse/touchpad support
  - PNG/JPEG export
  - E-signature service with audit trail

- ✅ **P3.4**: Field-Level Encryption
  - AES-256-GCM per-field encryption via KMS-managed DEKs
  - Builder UI: encryption toggle + lock-on-submit behaviour
  - GDPR crypto-shredding endpoint (delete DEK → data unreadable)
  - Edit check exclusion enforced at design time and runtime
  - See [field-level-encryption-clinical-edc.md](./field-level-encryption-clinical-edc.md) for full specification

**Validation:**
```bash
# Run unit tests
npx nx test shared --coverage

# Run E2E tests for signatures
npx nx e2e web-components-e2e --spec=vi-signature.spec.ts

# Verify audit trail export
curl -X POST http://localhost:3000/api/audit/export \
  -H "Content-Type: application/json" \
  -d '{"studyId":"STUDY-001","format":"pdf"}' \
  --output audit-trail.pdf
```

---

## Next Steps

**Part 4C: Platform Phase 4 — Persistence & Versioning** *(to be created next)*
- Schema versioning strategy (form migrations)
- Draft persistence architecture (partial saves)
- Offline mode implementation (IndexedDB + service worker)
- Sync conflict resolution

---

**END OF PART 4B (Platform Phase 3 — Compliance)**

*Ready to continue with Part 4C...*
