# Server-Side Validator Configuration — IntelliSense Research

> **Date:** 2026-05-30  
> **Status:** ✅ Production Architecture Defined | 📚 Future Enhancements Documented  
> **Purpose:** Comprehensive research on validator configuration UX and developer tooling

---

## 🎯 Key Decision

### ✅ APPROVED: Web UI with Dynamic Forms (No Code Editor)

**Study designers configure validators via visual forms only.**

- **UI:** Angular dynamic forms generated from validator metadata
- **Backend:** C# DLL plugin system for custom validators
- **Loading:** Lazy load via Module Federation (not in main bundle)
- **Security:** Multi-tenant isolation (client validators not visible to others)

**Implementation:** Q2 2026 (12 weeks)

### 📚 DOCUMENTED (FOR FUTURE): Online Code Editor

**Detailed technical implementations preserved for when/if code editing is required:**

- JSON Schema + Monaco Editor for VS Code-style IntelliSense
- TypeScript type generation from C# metadata
- Zod runtime validation + type inference
- Custom IntelliSense providers with context-aware suggestions

**Implementation:** Only if user feedback demands code-based configuration (95% of users won't need this)

---

## Document Structure

### 📦 Part I: Production Architecture (Sections 12-18)

**Status:** ✅ APPROVED for Q2 2026 implementation

**What's Included:**
- DLL plugin discovery and loading system
- Multi-tenant validator registry
- Lazy loading with Module Federation
- Dynamic form generation from metadata
- Client development workflow (C# → DLL → Deploy)
- Complete architecture diagrams
- Implementation roadmap and checklist

**Target Audience:** Implementation teams, deployment engineers, client developers

**Jump to:** [Section 12: Production Architecture](#12-production-architecture-revised)

---

### 📖 Part II: Technical Reference (Sections 1-11)

**Status:** 📚 OPTIONAL — Documented for future consideration

**What's Included:**
- 5 technical approaches for code-based configuration
- JSON Schema generation and validation
- TypeScript type generation from C# metadata
- Zod schema for runtime validation
- Monaco Editor integration with custom IntelliSense
- Comparison matrices and decision frameworks

**When to Use:** If user feedback indicates need for online code editor, JSON/YAML editing, or programmatic configuration

**Target Audience:** Senior architects, platform engineers (when/if implementing code editor)

**Jump to:** [Section 1: Problem Statement](#1-problem-statement)

---

### 📋 Appendices (A-D)

**Status:** 📚 Reference material

**What's Included:**
- Decision framework for when to implement code editor
- Complete implementation checklists (current + future)
- Technology stack summary
- External references and internal documentation links

**Jump to:** [Appendices](#appendices)

---

## Table of Contents

### Part I: Production Architecture (Q2 2026) — APPROVED

- [Executive Summary](#executive-summary)
- [12. Production Architecture](#12-production-architecture-revised)
  - 12.1 Clarified Requirements
  - 12.2 Revised Recommendation
- [13. DLL Plugin Architecture](#13-dll-plugin-architecture)
  - 13.1 Plugin Discovery System
  - 13.2 Multi-Tenant Registry
  - 13.3 Hot Reload Support
- [14. Lazy Loading Strategy](#14-lazy-loading-strategy-microfrontend)
  - 14.1 Module Federation Setup
  - 14.2 Lazy Load Validator Metadata
  - 14.3 API Endpoint for Client-Scoped Catalog
- [15. Revised Implementation Roadmap](#15-revised-implementation-roadmap)
- [16. Client Development Workflow](#16-client-development-workflow)
  - 16.1 Create Custom Validator
  - 16.2 Build and Deploy
  - 16.3 Vialiq Deployment Process
- [17. Final Architecture Diagram](#17-final-architecture-diagram)
- [18. Conclusion](#18-conclusion)
  - 18.1 Final Recommendation
  - 18.2 Benefits
  - 18.3 Next Steps

### Part II: Technical Reference (OPTIONAL FUTURE)

- [1. Problem Statement](#1-problem-statement)
  - 1.1 Current Challenge
  - 1.2 Desired Developer Experience
  - 1.3 Goals
- [2. Approach Comparison](#2-approach-comparison)
- [3. Approach 1: JSON Schema](#3-approach-1-json-schema)
  - 3.1 Overview
  - 3.2 Implementation
  - 3.3 Enhanced Field Reference Validation
  - 3.4 Pros & Cons
- [4. Approach 2: TypeScript Type Generation](#4-approach-2-typescript-type-generation)
  - 4.1 Overview
  - 4.2 Implementation
  - 4.3 Enhanced Branded Types
  - 4.4 Pros & Cons
- [5. Approach 3: Zod Schema](#5-approach-3-zod-schema)
  - 5.1 Overview
  - 5.2 Implementation
  - 5.3 Pros & Cons
- [6. Approach 4: Dynamic Form Generation](#6-approach-4-dynamic-form-generation)
  - 6.1 Overview
  - 6.2 Implementation
  - 6.3 Pros & Cons
- [7. Approach 5: Monaco Editor Integration](#7-approach-5-monaco-editor-integration)
  - 7.1 Overview
  - 7.2 Implementation
  - 7.3 Pros & Cons
- [8. Recommended: Hybrid Approach](#8-recommended-hybrid-approach)
  - 8.1 Strategy
  - 8.2 Architecture
  - 8.3 Implementation Steps
- [9. Comparison Matrix](#9-comparison-matrix)
- [10. Recommendations](#10-recommendations)
  - 10.1 For MVP
  - 10.2 For Production
- [11. Technical Considerations](#11-technical-considerations)
  - 11.1 Schema Synchronization
  - 11.2 Field Reference Validation
  - 11.3 Cross-Form References

### Appendices

- [Appendix A: When to Implement Code Editor](#appendix-a-when-to-implement-code-editor-part-ii)
  - A.1 Decision Framework
  - A.2 Implementation Guide
  - A.3 Bundle Size Considerations
  - A.4 User Experience Comparison
  - A.5 Alternative: Hybrid Approach
- [Appendix B: Implementation Checklist](#appendix-b-implementation-checklist)
  - B.1 Current Production Architecture
  - B.2 Optional Future Enhancements
- [Appendix C: Technology Stack Summary](#appendix-c-technology-stack-summary)
  - C.1 Current Architecture
  - C.2 Optional Enhancements
- [Appendix D: References & Resources](#appendix-d-references--resources)
  - D.1 External Articles
  - D.2 Internal Documentation

---

---

## Executive Summary

### Production Architecture (Current - Q2 2026)

**✅ APPROVED FOR IMPLEMENTATION:**

1. **Web UI Configuration Only** — Study designers configure validators via visual forms
2. **Lazy Loading** — Validator catalog and forms loaded on-demand via Module Federation
3. **DLL Plugin System** — Clients write C# validators, deploy as DLLs, auto-discovered at runtime
4. **Multi-Tenant Isolation** — Client validators visible only to their deployments

**No code editing required for study designers.**

**Jump to:** [Section 12: Production Architecture](#12-production-architecture-revised)

---

### Optional Future Enhancement (Code Editor)

**⚠️ FOR FUTURE CONSIDERATION:**

If later requirements demand **power users** to edit validator configurations as code (JSON/TypeScript), detailed technical implementations are documented in **Sections 1-11**:

1. **JSON Schema** (Section 3) — VS Code-style IntelliSense in Monaco Editor
2. **TypeScript Types** (Section 4) — Compile-time type safety for developers
3. **Zod Schema** (Section 5) — Runtime validation + type inference
4. **Monaco Editor** (Section 7) — Full online code editor with custom IntelliSense

**Use Cases for Code Editor:**
- Power users who prefer YAML/JSON editing over forms
- Bulk import/export of validator configurations
- Version control integration (Git diffs for JSON configs)
- Advanced users who want to see/edit raw configuration
- CI/CD pipelines that generate validator configs programmatically

**When to implement:** Only if user feedback indicates need for code-based configuration. Forms should suffice for 95% of users.

**Jump to:** [Section 1: Technical Approaches](#1-problem-statement)

---

## 📊 Quick Reference: Technical Decisions

| Aspect | Current Decision | Alternative (Future) |
|--------|------------------|----------------------|
| **Configuration UI** | ✅ Visual Forms (Angular) | Monaco Editor (Sections 3, 7) |
| **Custom Validators** | ✅ C# DLL Plugin System | N/A (C# is required) |
| **IntelliSense** | ✅ Form dropdowns, validation | JSON Schema + Monaco (Section 3) |
| **Type Safety** | ✅ Runtime (C# metadata validation) | Compile-time (TypeScript types, Section 4) |
| **Loading Strategy** | ✅ Lazy load via Module Federation | Same (Section 14) |
| **Multi-Tenancy** | ✅ DLL isolation per client | Same (Section 13.2) |
| **Bundle Size** | ✅ Small (~50 KB forms) | Large (3-5 MB Monaco, Section 7) |
| **Development Effort** | ✅ 12 weeks (Q2 2026) | +6-10 weeks for code editor |
| **User Experience** | ✅ Non-technical friendly | Technical users only |

---

---

# PART I: PRODUCTION ARCHITECTURE (CURRENT)

**Status:** Approved for Q2 2026 implementation  
**Target Users:** Study designers, deployment teams, client developers  
**Sections:** 12-18

---

[Content continues with sections 12-18...]

---

---

# PART II: TECHNICAL REFERENCE (OPTIONAL FUTURE ENHANCEMENTS)

**Status:** Detailed technical documentation for optional code editor implementation  
**Target Users:** Platform architects, senior developers  
**When to Implement:** If/when code-based configuration is required  
**Sections:** 1-11

---

## 1. Problem Statement

### 1.1 Current Challenge

From [validator library doc](./form-builder-server-side-validator-library.md), study designers configure validators via JSON:

```json
{
  "checkId": "sae-notification-timeline",
  "parameters": {
    "aeOnsetField": "AESTDTC",           // ← How do they know these keys?
    "notificationDateField": "SAENOTDT",  // ← What type is expected?
    "maxHours": 24                        // ← Is this required?
  },
  "severity": "error"
}
```

**Pain points:**
- No autocomplete for `parameters` keys
- No type checking (string vs. number vs. boolean)
- No inline documentation for what each parameter does
- Easy to make typos (`notificationDateField` vs `notificationDateFld`)
- No awareness of required vs. optional parameters

### 1.2 Desired Developer Experience

**Scenario 1: Visual Form Builder (Primary UX)**
```
Study designer clicks "Add Validator" → Modal with generated form:
┌────────────────────────────────────────────────┐
│ Configure: SAE Notification Timeline          │
├────────────────────────────────────────────────┤
│ AE Onset Date Field *                         │
│ [AESTDTC                     ▼] ← Dropdown    │
│ Help: Field containing AE onset date          │
│                                                │
│ Notification Date Field *                     │
│ [SAENOTDT                    ▼]               │
│                                                │
│ Maximum Hours                                  │
│ [24      ] (default: 24)                      │
└────────────────────────────────────────────────┘
```

**Scenario 2: JSON/Code Editor (Power Users)**
```typescript
// In VS Code extension or Monaco editor
const config: ServerValidationRule = {
  checkId: "sae-notification-timeline",
  parameters: {
    aeOnsetField: "AESTDTC",  // ← IntelliSense suggests valid keys
    //              ^^^^^^^^ ← Autocomplete from form fields
    maxHours: 24  // ← Hover shows: "Maximum hours (default: 24)"
  }
};
```

### 1.3 Goals

1. **Type Safety** — Prevent invalid configurations at design time
2. **Discoverability** — Show available parameters without reading docs
3. **Context Help** — Inline documentation for each parameter
4. **Field Validation** — Validate parameter types before save
5. **Cross-References** — Link `FieldReference` parameters to actual form fields

---

## 2. Approach Comparison

| Approach | Type Safety | IntelliSense | Dynamic | Complexity | Best For |
|----------|-------------|--------------|---------|------------|----------|
| **JSON Schema** | ✅ Validation | ✅ VS Code | ✅ Runtime | 🟢 Low | Config files, Monaco Editor |
| **TypeScript Types** | ✅ Compile-time | ✅ Full | ❌ Static | 🟡 Medium | Code editors, API contracts |
| **Zod Schema** | ✅ Runtime | ✅ Inferred | ✅ Runtime | 🟡 Medium | Frontend validation, type inference |
| **Dynamic Form Gen** | ⚠️ Runtime only | ❌ None | ✅ Runtime | 🟢 Low | UI forms, no code editing |
| **Monaco Editor** | ✅ Full | ✅ Custom | ✅ Custom | 🔴 High | In-app code editing |
| **Hybrid** | ✅ All | ✅ All | ✅ All | 🟡 Medium | Production (recommended) |

---

## 3. Approach 1: JSON Schema

### 3.1 Overview

**JSON Schema** is an industry-standard format for describing JSON structure. VS Code, Monaco Editor, and most IDEs provide built-in IntelliSense for JSON files with schemas.

### 3.2 Implementation

**Step 1: Generate JSON Schema from C# Metadata**

```csharp
// Server-side: Generate JSON Schema from ValidatorMetadata
public class ValidatorSchemaGenerator
{
    public JsonSchema GenerateSchema(IServerEditCheck validator)
    {
        var schema = new JsonSchema
        {
            Type = "object",
            Title = validator.Metadata.Name,
            Description = validator.Metadata.Description,
            Properties = new Dictionary<string, JsonSchemaProperty>(),
            Required = new List<string>()
        };
        
        foreach (var param in validator.Metadata.Parameters)
        {
            schema.Properties[param.Key] = new JsonSchemaProperty
            {
                Type = MapParameterType(param.Type),
                Description = param.HelpText,
                Default = param.DefaultValue,
                Enum = param.AllowedValues
            };
            
            if (param.Required)
                schema.Required.Add(param.Key);
        }
        
        return schema;
    }
    
    private string MapParameterType(ParameterType type) => type switch
    {
        ParameterType.Integer => "integer",
        ParameterType.Decimal => "number",
        ParameterType.String => "string",
        ParameterType.Boolean => "boolean",
        ParameterType.FieldReference => "string",  // Reference types as strings
        ParameterType.VisitReference => "string",
        _ => "string"
    };
}
```

**Step 2: Expose JSON Schema via API**

```csharp
[ApiController]
[Route("api/validators")]
public class ValidatorSchemaController : ControllerBase
{
    [HttpGet("{checkId}/schema")]
    public IActionResult GetValidatorSchema(string checkId)
    {
        var validator = _registry.GetValidator(checkId);
        if (validator == null) return NotFound();
        
        var schema = _generator.GenerateSchema(validator);
        return Ok(schema);
    }
    
    [HttpGet("schemas")]
    public IActionResult GetAllSchemas()
    {
        var schemas = _registry.GetAllValidators()
            .Select(v => new {
                checkId = v.CheckId,
                schema = _generator.GenerateSchema(v)
            });
        return Ok(schemas);
    }
}
```

**Step 3: Client-Side JSON Schema Store**

```typescript
// Angular service to fetch and cache schemas
@Injectable({ providedIn: 'root' })
export class ValidatorSchemaService {
  private schemas = new Map<string, JSONSchema7>();
  
  constructor(private http: HttpClient) {}
  
  async getSchema(checkId: string): Promise<JSONSchema7> {
    if (!this.schemas.has(checkId)) {
      const schema = await firstValueFrom(
        this.http.get<JSONSchema7>(`/api/validators/${checkId}/schema`)
      );
      this.schemas.set(checkId, schema);
    }
    return this.schemas.get(checkId)!;
  }
  
  async getAllSchemas(): Promise<Map<string, JSONSchema7>> {
    const response = await firstValueFrom(
      this.http.get<Array<{ checkId: string; schema: JSONSchema7 }>>(
        '/api/validators/schemas'
      )
    );
    
    response.forEach(({ checkId, schema }) => {
      this.schemas.set(checkId, schema);
    });
    
    return this.schemas;
  }
}
```

**Step 4: Monaco Editor Integration**

```typescript
import * as monaco from 'monaco-editor';

@Component({
  selector: 'app-validator-config-editor',
  template: `
    <div #editorContainer style="height: 400px;"></div>
  `
})
export class ValidatorConfigEditorComponent implements AfterViewInit {
  @ViewChild('editorContainer') editorContainer!: ElementRef;
  @Input() checkId!: string;
  
  private editor?: monaco.editor.IStandaloneCodeEditor;
  
  constructor(private schemaService: ValidatorSchemaService) {}
  
  async ngAfterViewInit() {
    const schema = await this.schemaService.getSchema(this.checkId);
    
    // Register JSON schema for IntelliSense
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemas: [{
        uri: `vialiq://validators/${this.checkId}.json`,
        fileMatch: ['*'],
        schema: schema as any
      }]
    });
    
    this.editor = monaco.editor.create(this.editorContainer.nativeElement, {
      value: JSON.stringify({
        checkId: this.checkId,
        parameters: {},
        severity: 'error'
      }, null, 2),
      language: 'json',
      theme: 'vs-dark',
      automaticLayout: true,
      minimap: { enabled: false }
    });
  }
}
```

**Result:**

```json
{
  "checkId": "sae-notification-timeline",
  "parameters": {
    "aeOnsetField": "AESTDTC",        // ← Hover shows help text
    "notificationDateField": "",       // ← Red underline if empty (required)
    "maxHours": 24                     // ← Autocomplete suggests this key
  },
  "severity": "error"  // ← Enum autocomplete: "error" | "warning"
}
```

### 3.3 Enhanced: Field Reference Validation

JSON Schema can validate that `FieldReference` parameters reference real fields:

```typescript
// Generate schema with field enum
async generateSchemaForForm(checkId: string, formSchema: FormSchema): Promise<JSONSchema7> {
  const baseSchema = await this.schemaService.getSchema(checkId);
  const fieldNames = formSchema.fields.map(f => f.fieldId);
  
  // Enhance FieldReference parameters with field list
  for (const [key, prop] of Object.entries(baseSchema.properties || {})) {
    const param = validator.Metadata.Parameters.find(p => p.Key === key);
    if (param?.Type === ParameterType.FieldReference) {
      (prop as any).enum = fieldNames;  // Autocomplete from actual fields
    }
  }
  
  return baseSchema;
}
```

**Result:**

```json
{
  "parameters": {
    "aeOnsetField": "AEST"  // ← Autocomplete shows: AESTDTC, AESEV, AETERM...
  }
}
```

### 3.4 Pros & Cons

**✅ Pros:**
- Industry standard, widely supported
- Works in VS Code, Monaco Editor, WebStorm, etc.
- Can generate TypeScript types from schema (json-schema-to-typescript)
- Validation libraries (Ajv) for runtime checks
- Low complexity — existing tooling

**❌ Cons:**
- Limited to JSON files (not TypeScript code)
- Enum suggestions limited (can't compute dynamically in editor)
- No compile-time TypeScript checking
- Requires Monaco Editor for in-app usage

---

## 4. Approach 2: TypeScript Type Generation

### 4.1 Overview

Generate **TypeScript types** from C# `ValidatorMetadata` to provide compile-time type safety.

### 4.2 Implementation

**Step 1: Generate TypeScript from C#**

```csharp
public class TypeScriptGenerator
{
    public string GenerateTypes(IEnumerable<IServerEditCheck> validators)
    {
        var sb = new StringBuilder();
        
        sb.AppendLine("// Auto-generated from server validator metadata");
        sb.AppendLine("// DO NOT EDIT MANUALLY");
        sb.AppendLine();
        
        foreach (var validator in validators)
        {
            var typeName = ToPascalCase(validator.CheckId) + "Parameters";
            
            sb.AppendLine($"/**");
            sb.AppendLine($" * {validator.Metadata.Name}");
            sb.AppendLine($" * {validator.Metadata.Description}");
            sb.AppendLine($" */");
            sb.AppendLine($"export interface {typeName} {{");
            
            foreach (var param in validator.Metadata.Parameters)
            {
                var tsType = MapToTypeScriptType(param.Type);
                var optional = param.Required ? "" : "?";
                
                sb.AppendLine($"  /** {param.HelpText} */");
                sb.AppendLine($"  {param.Key}{optional}: {tsType};");
            }
            
            sb.AppendLine("}");
            sb.AppendLine();
        }
        
        // Generate discriminated union
        sb.AppendLine("export type ValidatorParameters = ");
        foreach (var validator in validators)
        {
            var typeName = ToPascalCase(validator.CheckId) + "Parameters";
            sb.AppendLine($"  | {{ checkId: '{validator.CheckId}'; parameters: {typeName} }}");
        }
        sb.AppendLine(";");
        
        return sb.ToString();
    }
    
    private string MapToTypeScriptType(ParameterType type) => type switch
    {
        ParameterType.Integer => "number",
        ParameterType.Decimal => "number",
        ParameterType.String => "string",
        ParameterType.Boolean => "boolean",
        ParameterType.Date => "string",  // ISO date string
        ParameterType.FieldReference => "string",
        ParameterType.VisitReference => "string",
        ParameterType.EnumValue => "string",
        _ => "unknown"
    };
}
```

**Step 2: Expose TypeScript Generator via CLI/API**

```bash
# Build-time code generation
npx vialiq-validators codegen --output src/app/validators/types.ts
```

Or runtime fetch:

```typescript
// Fetch generated types at build time
fetch('/api/validators/types.ts')
  .then(res => res.text())
  .then(code => fs.writeFileSync('src/validators.generated.ts', code));
```

**Step 3: Use Generated Types**

```typescript
// src/app/validators/types.ts (generated)
export interface SaeNotificationTimelineParameters {
  /** Field containing AE onset date */
  aeOnsetField: string;
  /** Field containing SAE notification date */
  notificationDateField: string;
  /** Maximum hours allowed (default: 24) */
  maxHours?: number;
}

export interface MeddraPtValidationParameters {
  /** MedDRA PT code field (8-digit) */
  ptCodeField: string;
  /** MedDRA version (e.g., "26.1") */
  meddraVersion: string;
  /** Optional PT text field for consistency check */
  ptTextField?: string;
}

export type ValidatorConfig =
  | { checkId: 'sae-notification-timeline'; parameters: SaeNotificationTimelineParameters }
  | { checkId: 'meddra-pt-validation'; parameters: MeddraPtValidationParameters }
  | { checkId: 'visit-window-compliance'; parameters: VisitWindowComplianceParameters }
  // ... all validators
;

// Usage with full type safety
const config: ValidatorConfig = {
  checkId: 'sae-notification-timeline',
  parameters: {
    aeOnsetField: 'AESTDTC',
    notificationDateField: 'SAENOTDT',
    maxHours: 24  // ← TypeScript knows this is optional number
  }
};

// Type error if wrong parameters
const bad: ValidatorConfig = {
  checkId: 'sae-notification-timeline',
  parameters: {
    wrongKey: 'value'  // ❌ TypeScript error: Property 'wrongKey' does not exist
  }
};
```

### 4.3 Enhanced: Branded Types for References

```typescript
// Use branded types for type-safe field references
export type FieldId = string & { __brand: 'FieldId' };
export type VisitId = string & { __brand: 'VisitId' };

export interface SaeNotificationTimelineParameters {
  aeOnsetField: FieldId;  // ← Only accepts FieldId, not any string
  notificationDateField: FieldId;
  maxHours?: number;
}

// Helper to create branded types
function fieldId(id: string): FieldId {
  return id as FieldId;
}

// Usage
const config = {
  checkId: 'sae-notification-timeline',
  parameters: {
    aeOnsetField: fieldId('AESTDTC'),  // ✅ Type-safe
    notificationDateField: 'SAENOTDT'  // ❌ TypeScript error: string not assignable to FieldId
  }
};
```

### 4.4 Pros & Cons

**✅ Pros:**
- **Full TypeScript IntelliSense** in code editors
- Compile-time type checking
- Discriminated unions prevent parameter mismatches
- Works with existing TypeScript tooling
- No runtime dependencies

**❌ Cons:**
- Only works in TypeScript/JavaScript code (not JSON files)
- Requires code generation step (build-time or CI)
- Types can go stale if server changes (need sync mechanism)
- No dynamic field validation (can't know form fields at type level)

---

## 5. Approach 3: Zod Schema

### 5.1 Overview

**Zod** is a TypeScript-first schema validation library. It provides **runtime validation** + **TypeScript type inference** from a single source of truth.

### 5.2 Implementation

**Step 1: Generate Zod Schemas from C# Metadata**

```typescript
// Generate Zod schema from validator metadata
import { z } from 'zod';

export function generateZodSchema(metadata: ValidatorMetadata): z.ZodObject<any> {
  const shape: Record<string, z.ZodTypeAny> = {};
  
  for (const param of metadata.parameters) {
    let schema: z.ZodTypeAny;
    
    switch (param.type) {
      case 'Integer':
        schema = z.number().int();
        break;
      case 'Decimal':
        schema = z.number();
        break;
      case 'String':
      case 'FieldReference':
      case 'VisitReference':
        schema = z.string();
        break;
      case 'Boolean':
        schema = z.boolean();
        break;
      case 'EnumValue':
        schema = z.enum(param.allowedValues as [string, ...string[]]);
        break;
      default:
        schema = z.unknown();
    }
    
    // Apply constraints
    if (param.minValue !== undefined && param.minValue !== null) {
      schema = (schema as z.ZodNumber).min(param.minValue);
    }
    if (param.maxValue !== undefined && param.maxValue !== null) {
      schema = (schema as z.ZodNumber).max(param.maxValue);
    }
    if (param.defaultValue !== undefined && param.defaultValue !== null) {
      schema = schema.default(param.defaultValue);
    }
    if (!param.required) {
      schema = schema.optional();
    }
    
    // Add description
    schema = schema.describe(param.helpText || param.label);
    
    shape[param.key] = schema;
  }
  
  return z.object(shape);
}

// Example generated schema
export const saeNotificationTimelineSchema = z.object({
  aeOnsetField: z.string().describe('Field containing AE onset date'),
  notificationDateField: z.string().describe('Field containing SAE notification date'),
  maxHours: z.number().int().min(1).default(24).optional()
    .describe('Maximum hours allowed (default: 24)')
});

// Infer TypeScript type from schema
export type SaeNotificationTimelineParameters = z.infer<typeof saeNotificationTimelineSchema>;

// Usage with validation
const result = saeNotificationTimelineSchema.safeParse({
  aeOnsetField: 'AESTDTC',
  notificationDateField: 'SAENOTDT',
  maxHours: 'invalid'  // ← Runtime error caught
});

if (result.success) {
  const params = result.data;  // ← Type-safe, validated
} else {
  console.error(result.error.format());
  // {
  //   maxHours: { _errors: ['Expected number, received string'] }
  // }
}
```

**Step 2: Build Validator Schema Registry**

```typescript
@Injectable({ providedIn: 'root' })
export class ValidatorSchemaRegistry {
  private schemas = new Map<string, z.ZodObject<any>>();
  
  constructor(private http: HttpClient) {}
  
  async loadSchemas() {
    const metadata = await firstValueFrom(
      this.http.get<ValidatorMetadata[]>('/api/validators/metadata')
    );
    
    for (const meta of metadata) {
      const schema = generateZodSchema(meta);
      this.schemas.set(meta.checkId, schema);
    }
  }
  
  getSchema(checkId: string): z.ZodObject<any> | undefined {
    return this.schemas.get(checkId);
  }
  
  validate(checkId: string, parameters: unknown): ValidationResult {
    const schema = this.getSchema(checkId);
    if (!schema) return { success: false, errors: ['Unknown validator'] };
    
    const result = schema.safeParse(parameters);
    return result.success
      ? { success: true, data: result.data }
      : { success: false, errors: result.error.issues.map(i => i.message) };
  }
}
```

**Step 3: Form Generation from Zod Schema**

```typescript
import { zodToJsonSchema } from 'zod-to-json-schema';

@Component({
  selector: 'app-validator-config-form',
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <div *ngFor="let field of formFields" class="form-field">
        <label>{{ field.label }}</label>
        <input [formControlName]="field.key" [type]="field.type" />
        <small>{{ field.help }}</small>
        <div *ngIf="form.get(field.key)?.errors" class="error">
          {{ getErrorMessage(field.key) }}
        </div>
      </div>
      <button type="submit" [disabled]="!form.valid">Save</button>
    </form>
  `
})
export class ValidatorConfigFormComponent implements OnInit {
  @Input() checkId!: string;
  form!: FormGroup;
  formFields: FormField[] = [];
  
  constructor(
    private fb: FormBuilder,
    private registry: ValidatorSchemaRegistry
  ) {}
  
  ngOnInit() {
    const zodSchema = this.registry.getSchema(this.checkId);
    if (!zodSchema) return;
    
    // Convert Zod schema to JSON Schema
    const jsonSchema = zodToJsonSchema(zodSchema);
    
    // Generate form fields from JSON Schema
    const controls: Record<string, FormControl> = {};
    for (const [key, prop] of Object.entries(jsonSchema.properties || {})) {
      const p = prop as any;
      const validators = [];
      
      if (jsonSchema.required?.includes(key)) {
        validators.push(Validators.required);
      }
      if (p.type === 'number') {
        if (p.minimum !== undefined) validators.push(Validators.min(p.minimum));
        if (p.maximum !== undefined) validators.push(Validators.max(p.maximum));
      }
      
      controls[key] = this.fb.control(p.default || '', validators);
      
      this.formFields.push({
        key,
        label: this.toLabel(key),
        help: p.description,
        type: this.mapType(p.type),
        required: jsonSchema.required?.includes(key) || false
      });
    }
    
    this.form = this.fb.group(controls);
  }
  
  onSubmit() {
    const result = this.registry.validate(this.checkId, this.form.value);
    if (result.success) {
      // Save config with validated data
      this.saveConfig(result.data);
    } else {
      // Show errors
      console.error(result.errors);
    }
  }
}
```

### 5.3 Pros & Cons

**✅ Pros:**
- **Single source of truth** for types + validation
- Runtime validation catches errors before server
- TypeScript inference from schemas (no codegen needed)
- Can convert to JSON Schema for Monaco Editor
- Rich validation API (min, max, regex, custom validators)
- Good error messages

**❌ Cons:**
- Additional runtime dependency (~12KB gzipped)
- Schemas still need to be generated from C# metadata
- Not as widely adopted as JSON Schema
- Learning curve for Zod API

---

## 6. Approach 4: Dynamic Form Generation

### 6.1 Overview

Generate **Angular Reactive Forms** dynamically from validator metadata, without manual coding.

### 6.2 Implementation

**Step 1: Fetch Validator Metadata**

```typescript
export interface ValidatorMetadata {
  checkId: string;
  name: string;
  description: string;
  parameters: ValidatorParameter[];
}

export interface ValidatorParameter {
  key: string;
  label: string;
  type: 'FieldReference' | 'Integer' | 'String' | 'Boolean' | 'EnumValue';
  required: boolean;
  defaultValue?: any;
  helpText?: string;
  allowedValues?: string[];
  minValue?: number;
  maxValue?: number;
}

@Injectable({ providedIn: 'root' })
export class ValidatorMetadataService {
  constructor(private http: HttpClient) {}
  
  getMetadata(checkId: string): Observable<ValidatorMetadata> {
    return this.http.get<ValidatorMetadata>(`/api/validators/${checkId}/metadata`);
  }
}
```

**Step 2: Dynamic Form Builder**

```typescript
@Component({
  selector: 'app-validator-config-form',
  template: `
    <h3>{{ metadata?.name }}</h3>
    <p>{{ metadata?.description }}</p>
    
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <div *ngFor="let param of metadata?.parameters" class="form-field">
        <!-- Field Reference (Dropdown) -->
        <ng-container *ngIf="param.type === 'FieldReference'">
          <label>
            {{ param.label }}
            <span *ngIf="param.required" class="required">*</span>
          </label>
          <select [formControlName]="param.key">
            <option value="">Select field...</option>
            <option *ngFor="let field of availableFields" [value]="field.fieldId">
              {{ field.fieldId }} - {{ field.label }}
            </option>
          </select>
          <small class="help">{{ param.helpText }}</small>
        </ng-container>
        
        <!-- Integer/Decimal -->
        <ng-container *ngIf="param.type === 'Integer' || param.type === 'Decimal'">
          <label>
            {{ param.label }}
            <span *ngIf="param.required" class="required">*</span>
          </label>
          <input type="number" [formControlName]="param.key" 
                 [step]="param.type === 'Integer' ? 1 : 0.01"
                 [min]="param.minValue"
                 [max]="param.maxValue" />
          <small class="help">{{ param.helpText }}</small>
        </ng-container>
        
        <!-- Boolean -->
        <ng-container *ngIf="param.type === 'Boolean'">
          <label>
            <input type="checkbox" [formControlName]="param.key" />
            {{ param.label }}
          </label>
          <small class="help">{{ param.helpText }}</small>
        </ng-container>
        
        <!-- Enum -->
        <ng-container *ngIf="param.type === 'EnumValue'">
          <label>
            {{ param.label }}
            <span *ngIf="param.required" class="required">*</span>
          </label>
          <select [formControlName]="param.key">
            <option value="">Select...</option>
            <option *ngFor="let opt of param.allowedValues" [value]="opt">
              {{ opt }}
            </option>
          </select>
          <small class="help">{{ param.helpText }}</small>
        </ng-container>
        
        <!-- String (default) -->
        <ng-container *ngIf="!['FieldReference','Integer','Decimal','Boolean','EnumValue'].includes(param.type)">
          <label>
            {{ param.label }}
            <span *ngIf="param.required" class="required">*</span>
          </label>
          <input type="text" [formControlName]="param.key" />
          <small class="help">{{ param.helpText }}</small>
        </ng-container>
        
        <!-- Validation errors -->
        <div *ngIf="form.get(param.key)?.invalid && form.get(param.key)?.touched" 
             class="error">
          <span *ngIf="form.get(param.key)?.errors?.['required']">
            {{ param.label }} is required
          </span>
          <span *ngIf="form.get(param.key)?.errors?.['min']">
            Minimum value is {{ param.minValue }}
          </span>
          <span *ngIf="form.get(param.key)?.errors?.['max']">
            Maximum value is {{ param.maxValue }}
          </span>
        </div>
      </div>
      
      <div class="actions">
        <button type="button" (click)="onCancel()">Cancel</button>
        <button type="submit" [disabled]="!form.valid">Save Validator</button>
      </div>
    </form>
  `
})
export class ValidatorConfigFormComponent implements OnInit {
  @Input() checkId!: string;
  @Input() formSchema!: FormSchema;  // For field references
  @Output() save = new EventEmitter<ServerValidationRule>();
  @Output() cancel = new EventEmitter<void>();
  
  metadata?: ValidatorMetadata;
  form!: FormGroup;
  availableFields: FieldSchema[] = [];
  
  constructor(
    private fb: FormBuilder,
    private metadataService: ValidatorMetadataService
  ) {}
  
  async ngOnInit() {
    this.availableFields = this.formSchema.fields;
    
    this.metadata = await firstValueFrom(
      this.metadataService.getMetadata(this.checkId)
    );
    
    // Build form dynamically
    const controls: Record<string, FormControl> = {};
    
    for (const param of this.metadata.parameters) {
      const validators: ValidatorFn[] = [];
      
      if (param.required) {
        validators.push(Validators.required);
      }
      
      if (param.type === 'Integer' || param.type === 'Decimal') {
        if (param.minValue !== undefined) {
          validators.push(Validators.min(param.minValue));
        }
        if (param.maxValue !== undefined) {
          validators.push(Validators.max(param.maxValue));
        }
      }
      
      controls[param.key] = this.fb.control(
        param.defaultValue ?? '',
        validators
      );
    }
    
    this.form = this.fb.group(controls);
  }
  
  onSubmit() {
    if (this.form.valid) {
      const config: ServerValidationRule = {
        checkId: this.checkId,
        parameters: this.form.value,
        severity: 'error'  // Default, can add UI control for this
      };
      this.save.emit(config);
    }
  }
  
  onCancel() {
    this.cancel.emit();
  }
}
```

### 6.3 Pros & Cons

**✅ Pros:**
- **No code editing** — pure UI forms
- Perfect for non-technical users
- Full validation feedback (Angular form validators)
- Can enhance with field pickers, dropdowns, date pickers
- No TypeScript knowledge required

**❌ Cons:**
- No IntelliSense (it's a form, not code)
- Power users may prefer code/JSON
- Requires significant UI development
- Harder to version control (JSON output, not source)

---

## 7. Approach 5: Monaco Editor Integration

### 7.1 Overview

Embed **Monaco Editor** (VS Code's editor) into the web app with custom IntelliSense providers.

### 7.2 Implementation

**Step 1: Install Monaco Editor**

```bash
npm install monaco-editor
npm install @types/monaco-editor
```

**Step 2: Configure Webpack/Vite for Monaco**

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import monacoEditorPlugin from 'vite-plugin-monaco-editor';

export default defineConfig({
  plugins: [
    monacoEditorPlugin({
      languageWorkers: ['json', 'typescript']
    })
  ]
});
```

**Step 3: Custom IntelliSense Provider**

```typescript
import * as monaco from 'monaco-editor';

export class ValidatorIntelliSenseProvider {
  private metadata: Map<string, ValidatorMetadata> = new Map();
  
  async loadMetadata() {
    const response = await fetch('/api/validators/metadata');
    const validators = await response.json();
    validators.forEach((v: ValidatorMetadata) => {
      this.metadata.set(v.checkId, v);
    });
  }
  
  registerProviders() {
    // Completion provider for JSON
    monaco.languages.registerCompletionItemProvider('json', {
      provideCompletionItems: (model, position) => {
        const textUntilPosition = model.getValueInRange({
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column
        });
        
        // Parse JSON to find context
        const context = this.parseContext(textUntilPosition);
        
        if (context.inCheckId) {
          // Suggest checkId values
          return {
            suggestions: Array.from(this.metadata.values()).map(m => ({
              label: m.checkId,
              kind: monaco.languages.CompletionItemKind.Value,
              documentation: m.description,
              insertText: `"${m.checkId}"`,
              detail: m.name
            }))
          };
        }
        
        if (context.inParameters && context.checkId) {
          // Suggest parameter keys
          const validator = this.metadata.get(context.checkId);
          if (validator) {
            return {
              suggestions: validator.parameters.map(p => ({
                label: p.key,
                kind: monaco.languages.CompletionItemKind.Property,
                documentation: p.helpText,
                insertText: `"${p.key}": ${this.getDefaultValue(p)}`,
                detail: p.label
              }))
            };
          }
        }
        
        return { suggestions: [] };
      }
    });
    
    // Hover provider for documentation
    monaco.languages.registerHoverProvider('json', {
      provideHover: (model, position) => {
        const word = model.getWordAtPosition(position);
        if (!word) return null;
        
        const context = this.parseContext(
          model.getValueInRange({
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column
          })
        );
        
        if (context.checkId) {
          const validator = this.metadata.get(context.checkId);
          const param = validator?.parameters.find(p => p.key === word.word);
          
          if (param) {
            return {
              contents: [
                { value: `**${param.label}**` },
                { value: param.helpText || '' },
                { value: `Type: \`${param.type}\`` },
                { value: param.required ? '**Required**' : 'Optional' },
                param.defaultValue !== undefined
                  ? { value: `Default: \`${param.defaultValue}\`` }
                  : null
              ].filter(Boolean) as monaco.IMarkdownString[]
            };
          }
        }
        
        return null;
      }
    });
  }
  
  private parseContext(text: string): {
    inCheckId: boolean;
    inParameters: boolean;
    checkId?: string;
  } {
    // Simple JSON parsing to detect context
    // In production, use a proper JSON parser (e.g., jsonc-parser)
    try {
      const partial = text + '}}';  // Close any open braces
      const obj = JSON.parse(partial);
      
      return {
        inCheckId: text.includes('"checkId"') && !text.includes('"parameters"'),
        inParameters: text.includes('"parameters"'),
        checkId: obj.checkId
      };
    } catch {
      return { inCheckId: false, inParameters: false };
    }
  }
  
  private getDefaultValue(param: ValidatorParameter): string {
    if (param.defaultValue !== undefined) {
      return JSON.stringify(param.defaultValue);
    }
    switch (param.type) {
      case 'Integer':
      case 'Decimal':
        return '0';
      case 'Boolean':
        return 'false';
      case 'String':
      case 'FieldReference':
      case 'VisitReference':
        return '""';
      default:
        return '""';
    }
  }
}
```

**Step 4: Integrate in Component**

```typescript
@Component({
  selector: 'app-monaco-validator-editor',
  template: '<div #editor style="height: 600px;"></div>'
})
export class MonacoValidatorEditorComponent implements AfterViewInit {
  @ViewChild('editor') editorElement!: ElementRef;
  
  private editor?: monaco.editor.IStandaloneCodeEditor;
  private intellisenseProvider = new ValidatorIntelliSenseProvider();
  
  async ngAfterViewInit() {
    await this.intellisenseProvider.loadMetadata();
    this.intellisenseProvider.registerProviders();
    
    this.editor = monaco.editor.create(this.editorElement.nativeElement, {
      value: this.getInitialValue(),
      language: 'json',
      theme: 'vs-dark',
      automaticLayout: true,
      quickSuggestions: { other: true, strings: true },
      suggest: { snippetsPreventQuickSuggestions: false }
    });
  }
  
  private getInitialValue(): string {
    return JSON.stringify({
      checkId: '',  // ← IntelliSense will suggest validators here
      parameters: {
        // ← IntelliSense will suggest parameters based on checkId
      },
      severity: 'error'
    }, null, 2);
  }
}
```

### 7.3 Pros & Cons

**✅ Pros:**
- **Full VS Code experience** in the browser
- Custom IntelliSense logic (context-aware suggestions)
- Syntax highlighting, error markers, hover docs
- Familiar to developers
- Can support JSON, TypeScript, or custom DSLs

**❌ Cons:**
- Large bundle size (~3-5 MB for Monaco)
- Requires significant development effort
- Complex integration with Angular/React
- May be overkill for simple configuration
- Web Workers needed for performance

---

## 8. Recommended: Hybrid Approach

### 8.1 Strategy

**Combine multiple approaches** to serve different user personas:

| User Type | Primary UI | Fallback | IntelliSense Method |
|-----------|-----------|----------|---------------------|
| **Study Designer** (non-dev) | Dynamic Form (Approach 4) | - | N/A (visual form) |
| **Data Manager** (power user) | Monaco Editor (Approach 5) | Dynamic Form | Custom provider + JSON Schema |
| **Developer** (TypeScript) | TypeScript Types (Approach 2) | Zod Schema (Approach 3) | Language server |

### 8.2 Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│ Form Builder UI                                                     │
│                                                                     │
│ ┌───────────────┐  ┌───────────────┐  ┌───────────────────────────┐│
│ │ Visual Form   │  │ JSON Editor   │  │ TypeScript (Advanced)     ││
│ │ Builder       │  │ (Monaco)      │  │                           ││
│ │               │  │               │  │ import { Validator }      ││
│ │ [Dropdown]    │  │ { checkId:    │  │   from '@vialiq/types';   ││
│ │ AE Onset: ▼   │  │   "sae-..."   │  │                           ││
│ │ [Dropdown]    │  │   parameters: │  │ const config: Validator = ││
│ │ Notify: ▼     │  │   { ... }     │  │   { ... };                ││
│ │               │  │ }             │  │                           ││
│ └───────┬───────┘  └───────┬───────┘  └───────────┬───────────────┘│
│         └─────────────┬────────────────────────────┘                │
│                       │                                             │
│                       ▼                                             │
│            ┌────────────────────────┐                               │
│            │ Validation Layer       │                               │
│            │ • Zod Runtime Check    │                               │
│            │ • Type Check (TS)      │                               │
│            │ • JSON Schema          │                               │
│            └────────────┬───────────┘                               │
│                         │                                           │
│                         ▼                                           │
│              ┌──────────────────────┐                               │
│              │ ServerValidationRule │                               │
│              │ (saved to schema)    │                               │
│              └──────────────────────┘                               │
└─────────────────────────────────────────────────────────────────────┘

Backend:
┌─────────────────────────────────────────────────────────────────────┐
│ • C# ValidatorMetadata (source of truth)                           │
│ • Generate JSON Schema (for Monaco)                                │
│ • Generate TypeScript types (for dev)                              │
│ • Generate Zod schemas (for runtime validation)                    │
│ • API endpoints for metadata                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### 8.3 Implementation Steps

**Phase 1: Dynamic Form (MVP)**
1. Fetch `ValidatorMetadata` from API
2. Build Angular Reactive Forms dynamically
3. Validate on submit
4. Save to `FormSchema.serverValidations[]`

**Phase 2: JSON Schema + Monaco**
1. Generate JSON Schemas from C# metadata
2. Expose via `/api/validators/{checkId}/schema`
3. Integrate Monaco Editor with JSON Schema support
4. Add "Advanced Mode" toggle in UI

**Phase 3: TypeScript Codegen**
1. Build TypeScript generator (C# → .ts)
2. Expose via CLI: `npx vialiq-validators codegen`
3. Publish types to NPM: `@vialiq/validator-types`
4. Developers import types in custom code

**Phase 4: Zod Integration**
1. Generate Zod schemas from metadata
2. Use for runtime validation in frontend
3. Provide `z.infer<>` types as alternative to codegen
4. Add to Monaco IntelliSense provider

---

## 9. Comparison Matrix

| Feature | JSON Schema | TS Types | Zod | Dynamic Form | Monaco | Hybrid |
|---------|-------------|----------|-----|--------------|--------|--------|
| **IntelliSense** | ✅ Editor | ✅ Full | ✅ Inferred | ❌ | ✅ Custom | ✅ All |
| **Runtime Validation** | ⚠️ Ajv needed | ❌ | ✅ | ✅ | ⚠️ Custom | ✅ |
| **Type Safety** | ⚠️ Codegen | ✅ Native | ✅ Inferred | ❌ | ⚠️ Custom | ✅ |
| **Non-Dev Friendly** | ❌ | ❌ | ❌ | ✅ | ⚠️ | ✅ |
| **Dev Friendly** | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Bundle Size** | Small | 0 | 12KB | Medium | 3-5MB | Large |
| **Dev Effort** | Low | Medium | Medium | High | Very High | High |
| **Maintenance** | Low | Medium | Medium | Medium | High | Medium |

---

## 10. Recommendations

### 10.1 For MVP (Short-term)

**Use: Dynamic Form Generation (Approach 4)**

**Rationale:**
- Fastest to market
- No editor complexity
- Perfect for non-technical study designers
- Angular Reactive Forms handle validation
- No external dependencies beyond Angular

**Implementation:**
```typescript
// 1. Fetch metadata from API
// 2. Generate FormGroup dynamically
// 3. Render form fields based on ParameterType
// 4. Validate and save to schema
```

### 10.2 For Production (Long-term)

**Use: Hybrid Approach (Dynamic Form + Monaco + TypeScript Types)**

**Rationale:**
- Serves all user personas
- Dynamic form for 80% of users (study designers)
- Monaco editor for 15% of users (power users/data managers)
- TypeScript types for 5% of users (developers writing custom validators)
- Proper validation layer prevents bad configs

**Implementation Priority:**
1. **Phase 1 (MVP):** Dynamic Form Generator
2. **Phase 2 (Q3 2026):** JSON Schema + Basic Monaco
3. **Phase 3 (Q4 2026):** TypeScript Codegen + NPM package
4. **Phase 4 (Q1 2027):** Zod Integration + Advanced IntelliSense

---

## 11. Technical Considerations

### 11.1 Schema Synchronization

**Problem:** C# validator metadata changes → Frontend schemas stale

**Solutions:**

**Option A: Build-Time Codegen**
```bash
# CI/CD generates schemas before build
npm run codegen:validators  # Fetches from API, generates types/schemas
npm run build
```

**Option B: Version Checking**
```typescript
// Frontend checks validator library version
const clientVersion = '1.2.0';
const serverVersion = await fetch('/api/validators/version').then(r => r.text());

if (clientVersion !== serverVersion) {
  console.warn('Validator library mismatch! Regenerating schemas...');
  await regenerateSchemas();
}
```

**Option C: Runtime Fetch (Recommended for MVP)**
```typescript
// Always fetch fresh metadata at runtime
// Cache in IndexedDB/LocalStorage with TTL
```

### 11.2 Field Reference Validation

**Problem:** `FieldReference` parameters must reference actual form fields

**Solution:** Inject form schema into validator

```typescript
// Enhance schema with actual field IDs
const enhancedSchema = await enhanceSchemaWithFields(
  validatorSchema,
  currentFormSchema.fields
);

// Result: parameter.enum = ['AESTDTC', 'AESEV', 'AETERM', ...]
```

### 11.3 Cross-Form References

**Problem:** Some validators reference fields from other forms (e.g., cross-visit)

**Solution:** Multi-step wizard

```
Step 1: Select validator
Step 2: Configure parameters (current form fields)
Step 3: Select cross-form references (other forms in study)
```

---

---

---

# END OF PART II: TECHNICAL REFERENCE

**Sections 1-11 above provide detailed technical implementations for:**
- JSON Schema generation and validation
- TypeScript type generation from C# metadata
- Zod schema for runtime validation
- Dynamic form generation patterns
- Monaco Editor integration with custom IntelliSense providers
- Hybrid approaches combining multiple techniques

**These remain available for future implementation if code-based configuration is required.**

---

---

---

# PART I: PRODUCTION ARCHITECTURE (APPROVED)

**Current Implementation Plan — Q2 2026**

The following sections (12-18) define the **approved architecture** for production implementation. This approach was selected based on:

1. ✅ **User Requirement:** Study designers configure via Web UI only (no code editing)
2. ✅ **Performance:** Lazy loading via Module Federation
3. ✅ **Extensibility:** DLL plugin system for client custom validators
4. ✅ **Security:** Multi-tenant isolation at runtime
5. ✅ **Simplicity:** No complex editor tooling needed

**Implementation Status:** Ready for development (Q2 2026)

---

## 12. Production Architecture (REVISED)

> **Updated:** 2026-05-30  
> **Key Decision:** Study designers configure via Web UI ONLY. VS Code/Monaco NOT needed for config. Custom validators = C# DLLs with plugin architecture.

### 12.1 Clarified Requirements

**From User:**
1. ✅ **Study designers configure Edit Checks from Product Webpage** — no VS Code
2. ✅ **Lazy load validator scripts** — not in main bundle, load when Edit-check microfrontend accessed
3. ✅ **Custom server validators = C# code** — clients write C# validators, compile to DLL
4. ✅ **Plugin-based DLL system:**
   - Client provides DLL to deployment team
   - Vialiq process reads from folder at runtime
   - Dynamically registers validators
   - Multi-tenant isolation (client's validators not visible to other deployments)
   - Not part of product package

### 12.2 Revised Recommendation

**PRIMARY: Dynamic Form Builder (Web UI) + DLL Plugin Architecture**

**Study Designer Workflow:**
```
1. Navigate to Form Builder → Server-Side Validations tab
2. Click "Add Validator" → Modal with catalog (fetched on-demand)
3. Select validator from list (platform + client-specific)
4. Configure parameters via generated form
5. Save to schema
```

**Client Custom Validator Workflow:**
```
1. Developer writes C# validator implementing IServerEditCheck
2. Compile to DLL: ClientName.CustomValidators.dll
3. Provide DLL to Vialiq deployment team
4. Deployment team places in: /plugins/{clientId}/validators/*.dll
5. Vialiq runtime discovers and registers validators
6. Appears in catalog for that client's studies ONLY
```

**NO CODE EDITING IN UI** — Pure visual configuration.

---

## 13. DLL Plugin Architecture

### 13.1 Plugin Discovery System

```csharp
// Startup.cs - Plugin discovery at application start
public class ValidatorPluginLoader
{
    private readonly IServerEditCheckRegistry _registry;
    private readonly ILogger<ValidatorPluginLoader> _logger;
    private readonly string _pluginPath;
    
    public ValidatorPluginLoader(
        IServerEditCheckRegistry registry,
        IConfiguration config,
        ILogger<ValidatorPluginLoader> logger)
    {
        _registry = registry;
        _logger = logger;
        _pluginPath = config["Validators:PluginPath"] ?? "./plugins";
    }
    
    public async Task LoadPlugins(CancellationToken ct = default)
    {
        _logger.LogInformation("Discovering validator plugins from {Path}", _pluginPath);
        
        if (!Directory.Exists(_pluginPath))
        {
            _logger.LogWarning("Plugin path does not exist: {Path}", _pluginPath);
            return;
        }
        
        // Discover all client plugin directories
        var clientDirs = Directory.GetDirectories(_pluginPath);
        
        foreach (var clientDir in clientDirs)
        {
            var clientId = Path.GetFileName(clientDir);
            await LoadClientValidators(clientId, clientDir, ct);
        }
    }
    
    private async Task LoadClientValidators(string clientId, string clientPath, CancellationToken ct)
    {
        var validatorPath = Path.Combine(clientPath, "validators");
        if (!Directory.Exists(validatorPath))
        {
            _logger.LogDebug("No validators directory for client {ClientId}", clientId);
            return;
        }
        
        var dllFiles = Directory.GetFiles(validatorPath, "*.dll");
        _logger.LogInformation("Loading {Count} validator DLLs for client {ClientId}", dllFiles.Length, clientId);
        
        foreach (var dllPath in dllFiles)
        {
            try
            {
                await LoadValidatorsFromAssembly(dllPath, clientId, ct);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to load validators from {Path}", dllPath);
            }
        }
    }
    
    private async Task LoadValidatorsFromAssembly(string assemblyPath, string clientId, CancellationToken ct)
    {
        // Load assembly in isolated context for multi-tenancy
        var loadContext = new AssemblyLoadContext($"Validators_{clientId}", isCollectible: true);
        
        try
        {
            var assembly = loadContext.LoadFromAssemblyPath(assemblyPath);
            
            // Find all types implementing IServerEditCheck
            var validatorTypes = assembly.GetTypes()
                .Where(t => typeof(IServerEditCheck).IsAssignableFrom(t) 
                         && !t.IsAbstract 
                         && !t.IsInterface);
            
            foreach (var validatorType in validatorTypes)
            {
                // Instantiate validator
                var validator = (IServerEditCheck)Activator.CreateInstance(validatorType)!;
                
                // Register with client-scoped registry
                _registry.Register(validator, clientId);
                
                _logger.LogInformation(
                    "Registered validator {CheckId} for client {ClientId} from {Assembly}",
                    validator.CheckId,
                    clientId,
                    Path.GetFileName(assemblyPath)
                );
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading assembly {Path}", assemblyPath);
            loadContext.Unload();
            throw;
        }
    }
}

// Plugin directory structure:
// /plugins/
//   ├─ client-abc/
//   │  └─ validators/
//   │     ├─ ABC.CustomValidators.dll
//   │     └─ ABC.CustomValidators.pdb (optional, for debugging)
//   ├─ client-xyz/
//   │  └─ validators/
//   │     └─ XYZ.StudyValidators.dll
//   └─ vialiq-platform/  (built-in validators)
//      └─ validators/
//         └─ Vialiq.Platform.Validators.dll
```

### 13.2 Multi-Tenant Registry

```csharp
public interface IServerEditCheckRegistry
{
    /// <summary>Register validator for specific client</summary>
    void Register(IServerEditCheck validator, string clientId);
    
    /// <summary>Get validator for specific client (includes platform + client-specific)</summary>
    IServerEditCheck? GetValidator(string checkId, string clientId);
    
    /// <summary>Get all validators available to a client</summary>
    IEnumerable<IServerEditCheck> GetValidators(string clientId);
}

public class ServerEditCheckRegistry : IServerEditCheckRegistry
{
    // Platform validators (available to all clients)
    private readonly ConcurrentDictionary<string, IServerEditCheck> _platformValidators = new();
    
    // Client-specific validators (isolated per client)
    private readonly ConcurrentDictionary<string, ConcurrentDictionary<string, IServerEditCheck>> _clientValidators = new();
    
    public void Register(IServerEditCheck validator, string clientId)
    {
        if (clientId == "vialiq-platform")
        {
            // Platform validator - available to all
            _platformValidators.TryAdd(validator.CheckId, validator);
        }
        else
        {
            // Client-specific validator - isolated
            var clientRegistry = _clientValidators.GetOrAdd(
                clientId,
                _ => new ConcurrentDictionary<string, IServerEditCheck>()
            );
            
            clientRegistry.TryAdd(validator.CheckId, validator);
        }
    }
    
    public IServerEditCheck? GetValidator(string checkId, string clientId)
    {
        // Check client-specific first (allows override of platform validators)
        if (_clientValidators.TryGetValue(clientId, out var clientRegistry))
        {
            if (clientRegistry.TryGetValue(checkId, out var clientValidator))
                return clientValidator;
        }
        
        // Fallback to platform validators
        return _platformValidators.TryGetValue(checkId, out var platformValidator)
            ? platformValidator
            : null;
    }
    
    public IEnumerable<IServerEditCheck> GetValidators(string clientId)
    {
        // Return platform validators + client-specific validators
        var validators = new List<IServerEditCheck>(_platformValidators.Values);
        
        if (_clientValidators.TryGetValue(clientId, out var clientRegistry))
        {
            validators.AddRange(clientRegistry.Values);
        }
        
        return validators;
    }
}
```

### 13.3 Hot Reload Support (Optional)

```csharp
public class ValidatorHotReloadService : BackgroundService
{
    private readonly IServerEditCheckRegistry _registry;
    private readonly ILogger<ValidatorHotReloadService> _logger;
    private readonly FileSystemWatcher _watcher;
    
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _watcher = new FileSystemWatcher(pluginPath)
        {
            Filter = "*.dll",
            IncludeSubdirectories = true,
            NotifyFilter = NotifyFilters.LastWrite | NotifyFilters.FileName
        };
        
        _watcher.Created += OnValidatorDllChanged;
        _watcher.Changed += OnValidatorDllChanged;
        
        _watcher.EnableRaisingEvents = true;
        
        await Task.Delay(Timeout.Infinite, stoppingToken);
    }
    
    private async void OnValidatorDllChanged(object sender, FileSystemEventArgs e)
    {
        _logger.LogInformation("Validator DLL changed: {Path}", e.FullPath);
        
        // Wait for file to be fully written
        await Task.Delay(1000);
        
        // Extract client ID from path
        var clientId = ExtractClientId(e.FullPath);
        
        // Reload validators for this client
        await ReloadClientValidators(clientId, e.FullPath);
    }
}
```

---

## 14. Lazy Loading Strategy (Microfrontend)

### 14.1 Module Federation Setup

**Reference:** https://codeburst.io/lazy-loading-external-javascript-libraries-in-angular-3d86ada54ec7

```typescript
// webpack.config.js for Edit Check Microfrontend
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'editCheckMfe',
      filename: 'remoteEntry.js',
      exposes: {
        './ValidatorConfigModule': './src/app/validator-config/validator-config.module.ts'
      },
      shared: {
        '@angular/core': { singleton: true, strictVersion: false },
        '@angular/common': { singleton: true, strictVersion: false },
        '@angular/forms': { singleton: true, strictVersion: false }
      }
    })
  ]
};

// Shell app - load on demand
const loadEditCheckMfe = () => import('editCheckMfe/ValidatorConfigModule');

// routes.ts
{
  path: 'form-builder/:formId/server-validations',
  loadChildren: () => loadEditCheckMfe().then(m => m.ValidatorConfigModule)
}
```

### 14.2 Lazy Load Validator Metadata

```typescript
@Injectable({ providedIn: 'root' })
export class ValidatorMetadataService {
  private metadataCache?: ValidatorMetadata[];
  private loading = false;
  
  constructor(
    private http: HttpClient,
    @Inject('CLIENT_ID') private clientId: string
  ) {}
  
  async getValidatorCatalog(): Promise<ValidatorMetadata[]> {
    // Load on first access only
    if (this.metadataCache) {
      return this.metadataCache;
    }
    
    if (this.loading) {
      // Wait for in-flight request
      await this.waitForLoad();
      return this.metadataCache!;
    }
    
    this.loading = true;
    
    try {
      // Fetch metadata for this client (platform + client-specific)
      this.metadataCache = await firstValueFrom(
        this.http.get<ValidatorMetadata[]>(
          `/api/validators/catalog?clientId=${this.clientId}`
        )
      );
      
      return this.metadataCache;
    } finally {
      this.loading = false;
    }
  }
  
  private async waitForLoad(): Promise<void> {
    while (this.loading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}

// Component loads metadata only when user opens "Add Validator" modal
@Component({
  selector: 'app-add-validator-modal',
  template: `
    <div *ngIf="loading">Loading validators...</div>
    <div *ngIf="!loading">
      <h3>Select Validator</h3>
      <ul>
        <li *ngFor="let validator of validators" (click)="selectValidator(validator)">
          {{ validator.name }}
          <span class="badge" *ngIf="validator.source === 'client'">Custom</span>
        </li>
      </ul>
    </div>
  `
})
export class AddValidatorModalComponent implements OnInit {
  validators: ValidatorMetadata[] = [];
  loading = true;
  
  constructor(private metadataService: ValidatorMetadataService) {}
  
  async ngOnInit() {
    this.validators = await this.metadataService.getValidatorCatalog();
    this.loading = false;
  }
}
```

### 14.3 API Endpoint for Client-Scoped Catalog

```csharp
[ApiController]
[Route("api/validators")]
public class ValidatorCatalogController : ControllerBase
{
    private readonly IServerEditCheckRegistry _registry;
    
    [HttpGet("catalog")]
    public IActionResult GetCatalog([FromQuery] string clientId)
    {
        var validators = _registry.GetValidators(clientId);
        
        var catalog = validators.Select(v => new ValidatorMetadataDto
        {
            CheckId = v.CheckId,
            Name = v.Metadata.Name,
            Category = v.Metadata.Category,
            Description = v.Metadata.Description,
            Parameters = v.Metadata.Parameters.Select(p => new ParameterDto
            {
                Key = p.Key,
                Label = p.Label,
                Type = p.Type.ToString(),
                Required = p.Required,
                DefaultValue = p.DefaultValue,
                HelpText = p.HelpText,
                AllowedValues = p.AllowedValues,
                MinValue = p.MinValue,
                MaxValue = p.MaxValue
            }).ToArray(),
            Source = IsClientValidator(v, clientId) ? "client" : "platform",
            Tags = v.Metadata.Tags
        });
        
        return Ok(catalog);
    }
    
    private bool IsClientValidator(IServerEditCheck validator, string clientId)
    {
        // Check if validator came from client DLL vs platform
        var assembly = validator.GetType().Assembly;
        return !assembly.FullName.StartsWith("Vialiq.Platform");
    }
}
```

---

## 15. Revised Implementation Roadmap

### Phase 1: Core Infrastructure (Q2 2026)

**Backend:**
- ✅ DLL plugin discovery system
- ✅ Multi-tenant validator registry
- ✅ API endpoint: `/api/validators/catalog?clientId={id}`
- ✅ Metadata generation from `IServerEditCheck`

**Frontend:**
- ✅ Microfrontend setup with Module Federation
- ✅ Lazy load validator catalog on modal open
- ✅ Dynamic form generator from metadata
- ✅ Save to `FormSchema.serverValidations[]`

**Result:** Study designers can configure platform validators via Web UI.

---

### Phase 2: Client Plugin Support (Q3 2026)

**Backend:**
- ✅ Plugin deployment pipeline (DLL → `/plugins/{clientId}/validators/`)
- ✅ Hot reload support (optional)
- ✅ Client-scoped validator visibility
- ✅ Logging & monitoring for plugin loads

**Client:**
- ✅ Custom validator development kit (NuGet package)
- ✅ Example projects & documentation
- ✅ Testing harness for client validators

**Result:** Clients can deploy custom validators as DLLs.

---

### Phase 3: Enhanced UX (Q4 2026)

**Frontend:**
- ✅ Field picker with autocomplete (for `FieldReference` params)
- ✅ Visit picker (for `VisitReference` params)
- ✅ Validator preview/testing
- ✅ Bulk import/export of validator configs

**Backend:**
- ✅ Versioning for plugin DLLs
- ✅ Backward compatibility checks
- ✅ Migration tools for config updates

---

## 16. Client Development Workflow

### 16.1 Create Custom Validator

```bash
# Client developer workstation
dotnet new vialiq-validator -n "ABC-101.CustomValidators"
cd ABC-101.CustomValidators
```

**Generated project structure:**
```
ABC-101.CustomValidators/
├─ ABC-101.CustomValidators.csproj
├─ PkSamplingWindowValidator.cs
├─ TumorResponseValidator.cs
└─ README.md
```

**Example validator:**
```csharp
using Vialiq.Platform.Validation;

namespace ABC101.CustomValidators;

[ServerEditCheck(CheckId = "abc101-pk-sampling-window")]
public class PkSamplingWindowValidator : IServerEditCheck
{
    public string CheckId => "abc101-pk-sampling-window";
    
    public ValidatorMetadata Metadata => new()
    {
        Name = "PK Sampling Window (ABC-101)",
        Category = "Protocol Compliance",
        Description = "Validates PK samples collected within ±15 minutes of scheduled time",
        Parameters =
        [
            new("scheduledTimeField", "Scheduled Time", ParameterType.FieldReference, required: true),
            new("actualTimeField", "Actual Collection Time", ParameterType.FieldReference, required: true),
            new("toleranceMinutes", "Tolerance (minutes)", ParameterType.Integer, defaultValue: 15)
        ],
        Tags = ["pk", "study-specific", "abc-101"]
    };
    
    public async Task<Result> Execute(ValidationContext ctx, Dictionary<string, object> p)
    {
        var scheduled = ctx.GetField<TimeSpan>(p["scheduledTimeField"] as string);
        var actual = ctx.GetField<TimeSpan>(p["actualTimeField"] as string);
        var tolerance = (int)p["toleranceMinutes"];
        
        var deviation = Math.Abs((actual - scheduled).TotalMinutes);
        
        if (deviation > tolerance)
            return Result.Warn($"PK sample {deviation:F0} min off schedule (tolerance ±{tolerance} min)");
        
        return Result.Pass();
    }
}
```

### 16.2 Build and Deploy

```bash
# Build release DLL
dotnet build -c Release

# Output: bin/Release/net8.0/ABC-101.CustomValidators.dll

# Package for deployment
tar -czf abc101-validators-v1.0.0.tar.gz -C bin/Release/net8.0 ABC-101.CustomValidators.dll

# Send to Vialiq deployment team
# Deployment team extracts to: /plugins/abc-101/validators/
```

### 16.3 Vialiq Deployment Process

```bash
# Deployment script
#!/bin/bash

CLIENT_ID="abc-101"
VERSION="1.0.0"
PLUGIN_DIR="/app/plugins/$CLIENT_ID/validators"

# Extract DLL
mkdir -p "$PLUGIN_DIR"
tar -xzf abc101-validators-v$VERSION.tar.gz -C "$PLUGIN_DIR"

# Verify DLL
dotnet ABC-101.CustomValidators.dll --verify

# Restart API (triggers plugin discovery)
systemctl restart vialiq-api

# Verify registration
curl -s "https://api.vialiq.com/api/validators/catalog?clientId=$CLIENT_ID" \
  | jq '.[] | select(.checkId | startswith("abc101-"))'
```

---

## 17. Final Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│ Study Designer Workflow (Web UI ONLY)                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ Form Builder → Server Validations Tab → [Add Validator]           │
│                                              ↓                      │
│                                    ┌─────────────────────┐         │
│                                    │ Lazy Load Catalog   │         │
│                                    │ (on modal open)     │         │
│                                    └──────────┬──────────┘         │
│                                               ↓                     │
│                        GET /api/validators/catalog?clientId=abc-101│
│                                               ↓                     │
│                        ┌──────────────────────────────────┐        │
│                        │ Platform Validators (17)         │        │
│                        │ • SAE Timeline                   │        │
│                        │ • Visit Window                   │        │
│                        │ • MedDRA Validation              │        │
│                        │ ...                              │        │
│                        │                                  │        │
│                        │ ABC-101 Custom Validators (3)    │        │
│                        │ • PK Sampling Window [Custom]    │        │
│                        │ • Tumor Response [Custom]        │        │
│                        │ ...                              │        │
│                        └────────────┬─────────────────────┘        │
│                                     ↓                               │
│                         Select "PK Sampling Window"                │
│                                     ↓                               │
│                    ┌────────────────────────────────┐              │
│                    │ Dynamic Form (Generated)       │              │
│                    │ ┌────────────────────────────┐ │              │
│                    │ │ Scheduled Time Field *     │ │              │
│                    │ │ [PKSCHTM            ▼]     │ │              │
│                    │ │                            │ │              │
│                    │ │ Actual Time Field *        │ │              │
│                    │ │ [PKTM               ▼]     │ │              │
│                    │ │                            │ │              │
│                    │ │ Tolerance (minutes)        │ │              │
│                    │ │ [15          ]             │ │              │
│                    │ └────────────────────────────┘ │              │
│                    │         [Save Validator]       │              │
│                    └────────────────────────────────┘              │
│                                     ↓                               │
│                    Saved to FormSchema.serverValidations[]         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ Client Custom Validator Workflow                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ Developer → C# Code → Implement IServerEditCheck → Build DLL      │
│                                          ↓                          │
│                        ABC-101.CustomValidators.dll                │
│                                          ↓                          │
│                      Send to Vialiq Deployment Team                │
│                                          ↓                          │
│               Deployment: /plugins/abc-101/validators/*.dll        │
│                                          ↓                          │
│                        Vialiq API Restart                          │
│                                          ↓                          │
│         ┌────────────────────────────────────────────────┐         │
│         │ ValidatorPluginLoader (on startup)             │         │
│         │ • Scan /plugins/*/validators/*.dll             │         │
│         │ • Load assemblies in isolated contexts         │         │
│         │ • Discover IServerEditCheck implementations    │         │
│         │ • Register in multi-tenant registry            │         │
│         └──────────────────┬─────────────────────────────┘         │
│                            ↓                                        │
│         ┌────────────────────────────────────────────────┐         │
│         │ ServerEditCheckRegistry                        │         │
│         │                                                │         │
│         │ Platform: { sae-timeline, visit-window, ... }  │         │
│         │                                                │         │
│         │ abc-101: { abc101-pk-sampling-window, ... }    │         │
│         │                                                │         │
│         │ xyz-corp: { xyz-custom-validator, ... }        │         │
│         └────────────────────────────────────────────────┘         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 18. Conclusion

### 18.1 Final Recommendation

**✅ Approved Architecture:**
1. **Web UI configuration only** — No VS Code, no Monaco Editor for study designers
2. **Dynamic form generation** from validator metadata
3. **Lazy loading** via Module Federation — scripts loaded on Edit Check microfrontend access
4. **DLL plugin system** for client custom validators
5. **Multi-tenant isolation** — client validators not visible to other deployments

### 18.2 Benefits

**For Study Designers:**
- ✅ Intuitive web forms
- ✅ No technical knowledge required
- ✅ Fast configuration (< 1 minute per validator)

**For Clients:**
- ✅ Write custom validators in C#
- ✅ Full control via DLL deployment
- ✅ Isolated from other clients

**For Platform:**
- ✅ Centralized validator library
- ✅ Plugin architecture for extensibility
- ✅ Lazy loading reduces initial bundle size
- ✅ Multi-tenant security

### 18.3 Next Steps

1. ✅ Build DLL plugin loader infrastructure
2. ✅ Create API endpoints for client-scoped catalog
3. ✅ Implement dynamic form generator
4. ✅ Setup Module Federation for lazy loading
5. ✅ Create client validator development kit (NuGet)
6. ✅ Document deployment process

**Timeline:** Q2 2026 (12 weeks)

---

**Architecture validated and approved for implementation! 🚀**

---

---

## Appendix A: When to Implement Code Editor (Part II)

### A.1 Decision Framework

**Implement online code editor (Monaco + IntelliSense) IF:**

| Trigger | Priority | Estimated Effort |
|---------|----------|------------------|
| **User Feedback:** > 20% of study designers request "view as JSON/YAML" | High | 4-6 weeks |
| **Power User Demand:** Data managers want bulk import/export | Medium | 2-3 weeks |
| **CI/CD Integration:** Clients want programmatic config generation | Medium | 3-4 weeks |
| **Version Control:** Need Git diffs for configuration changes | Low | 2-3 weeks |
| **Developer Preference:** Technical users prefer code over forms | Low | 4-6 weeks |

### A.2 Implementation Guide (When Needed)

**If code editor is required**, refer to **Part II (Sections 1-11)** for detailed technical implementations:

**Phase 1: Basic JSON Editor (2-3 weeks)**
1. Implement JSON Schema generation from `ValidatorMetadata` (Section 3.2)
2. Integrate Monaco Editor in Form Builder (Section 7.2)
3. Register JSON Schema with Monaco for basic IntelliSense (Section 3.4)
4. Add "Edit as JSON" toggle in UI

**Phase 2: Enhanced IntelliSense (2-3 weeks)**
1. Implement custom completion provider (Section 7.3)
2. Add field reference validation (Section 3.3)
3. Implement hover documentation provider (Section 7.3)
4. Add syntax error highlighting

**Phase 3: TypeScript Support (1-2 weeks)**
1. Generate TypeScript types from C# (Section 4.2)
2. Publish to NPM: `@vialiq/validator-types` (Section 4.3)
3. Enable TypeScript mode in Monaco
4. Support import/export of types

**Phase 4: Runtime Validation (1-2 weeks)**
1. Integrate Zod schema generation (Section 5.2)
2. Add client-side validation before save (Section 5.3)
3. Provide helpful error messages (Section 5.2)

**Total Effort:** 6-10 weeks (if all phases implemented)

### A.3 Bundle Size Considerations

| Component | Size | Impact | Mitigation |
|-----------|------|--------|------------|
| Monaco Editor | 3-5 MB | ⚠️ Large | Lazy load via separate chunk |
| JSON Schema | ~5 KB | ✅ Minimal | Include in main bundle |
| Zod Runtime | ~12 KB | ✅ Small | Include in validator module |
| TypeScript Compiler | ~8 MB | ❌ Huge | Server-side only, not bundled |

**Recommendation:** If implementing Monaco, ensure it's loaded via Module Federation as separate microfrontend (similar to Edit Check microfrontend pattern in Section 14.1).

### A.4 User Experience Comparison

| Aspect | Visual Form Builder | Code Editor |
|--------|---------------------|-------------|
| **Learning Curve** | ✅ Immediate | ⚠️ Requires technical knowledge |
| **Configuration Speed** | ✅ Fast (< 1 min) | ⚠️ Slower (2-5 min) |
| **Error Prevention** | ✅ Form validation | ⚠️ Syntax errors possible |
| **Bulk Operations** | ❌ One at a time | ✅ Copy/paste multiple |
| **Version Control** | ⚠️ Hard to diff | ✅ Easy Git diffs |
| **Documentation** | ✅ Inline help text | ⚠️ Requires hover/lookup |

**Conclusion:** Visual forms serve 95% of users. Code editor is **optional enhancement** for power users.

### A.5 Alternative: Hybrid Approach

If user feedback demands **both** form and code editor:

```typescript
// Toggle between form and code view
<app-validator-config [mode]="viewMode">
  <!-- mode="form" → Dynamic form generator (Section 4) -->
  <!-- mode="code" → Monaco editor (Section 7) -->
  <!-- mode="split" → Side-by-side (future) -->
</app-validator-config>

// Sync bidirectionally
// Form changes → Update JSON in Monaco
// Monaco changes → Validate and update form
```

**Implementation:** Requires state synchronization layer + conflict resolution (3-4 weeks additional effort).

---

## Appendix B: Implementation Checklist

### B.1 Current Production Architecture (Q2 2026)

**Backend:**
- [ ] `ValidatorPluginLoader` — DLL discovery from `/plugins/` directory
- [ ] `ServerEditCheckRegistry` — Multi-tenant validator registry
- [ ] `IServerEditCheck` interface — NuGet package for client developers
- [ ] API endpoint: `GET /api/validators/catalog?clientId={id}`
- [ ] API endpoint: `GET /api/validators/{checkId}/metadata`
- [ ] Hot reload support (optional)
- [ ] Logging & monitoring for plugin loads

**Frontend:**
- [ ] Edit Check microfrontend with Module Federation
- [ ] Lazy load validator catalog on modal open
- [ ] Dynamic form generator from `ValidatorMetadata`
- [ ] Field picker with autocomplete (for `FieldReference` params)
- [ ] Visit picker (for `VisitReference` params)
- [ ] Form validation before save
- [ ] Save to `FormSchema.serverValidations[]`

**Client Developer Kit:**
- [ ] NuGet package: `Vialiq.Platform.Validation`
- [ ] Project template: `dotnet new vialiq-validator`
- [ ] Example validators
- [ ] Testing harness
- [ ] Documentation

**Deployment:**
- [ ] Plugin directory structure: `/plugins/{clientId}/validators/`
- [ ] Deployment scripts
- [ ] Verification tools
- [ ] Rollback procedures

### B.2 Optional Future Enhancements (When Needed)

**Code Editor:**
- [ ] JSON Schema generation (Section 3)
- [ ] Monaco Editor integration (Section 7)
- [ ] Custom IntelliSense providers (Section 7.3)
- [ ] TypeScript type generation (Section 4)
- [ ] Zod schema generation (Section 5)
- [ ] Syntax validation
- [ ] Hover documentation
- [ ] Error highlighting

**Advanced Features:**
- [ ] Bulk import/export
- [ ] Validator templates
- [ ] Configuration presets
- [ ] Version control integration
- [ ] CI/CD pipeline support
- [ ] Validator composition UI (AND/OR/NOT logic)
- [ ] Conditional execution rules

---

## Appendix C: Technology Stack Summary

### C.1 Current Architecture (Production)

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Backend | C# .NET | 8.0 | Validator execution, plugin loader |
| API | ASP.NET Core Web API | 8.0 | Metadata endpoints |
| Frontend | Angular | 21.1 | Form Builder UI |
| Module Federation | Webpack Module Federation | 5.x | Lazy loading microfrontends |
| Dependency Injection | Built-in .NET DI | - | Validator registry |
| Assembly Loading | AssemblyLoadContext | .NET 8 | Isolated DLL loading |

### C.2 Optional Enhancements (Future)

| Component | Technology | Size | Purpose |
|-----------|-----------|------|---------|
| Code Editor | Monaco Editor | 3-5 MB | Online code editing |
| JSON Validation | Ajv | ~50 KB | JSON Schema validation |
| TypeScript Codegen | Handlebars / Custom | - | Generate .d.ts files |
| Runtime Validation | Zod | ~12 KB | Schema validation |
| Schema Conversion | zod-to-json-schema | ~5 KB | Zod → JSON Schema |

---

## Appendix D: References & Resources

### D.1 External Articles

1. **Lazy Loading External JS Libraries in Angular**  
   https://codeburst.io/lazy-loading-external-javascript-libraries-in-angular-3d86ada54ec7  
   → Pattern for on-demand script loading (Section 14)

2. **Module Federation**  
   https://webpack.js.org/concepts/module-federation/  
   → Microfrontend architecture (Section 14.1)

3. **AssemblyLoadContext**  
   https://learn.microsoft.com/en-us/dotnet/core/dependency-loading/understanding-assemblyloadcontext  
   → Isolated assembly loading in .NET (Section 13.1)

4. **JSON Schema**  
   https://json-schema.org/  
   → Schema validation standard (Section 3)

5. **Monaco Editor**  
   https://microsoft.github.io/monaco-editor/  
   → VS Code editor in browser (Section 7)

6. **Zod**  
   https://zod.dev/  
   → TypeScript-first schema validation (Section 5)

### D.2 Internal Documentation

- [Server-Side Validator Library](./form-builder-server-side-validator-library.md) — Pre-built validator catalog
- [Server-Side Implementation](./form-builder-custom-programming-server-side.md) — C# validation pipeline with FP
- [Client-Side Implementation](./form-builder-custom-programming-implementation.md) — TypeScript validator development
- [Use Cases](./form-builder-custom-programming-use-cases.md) — Complete taxonomy of validation patterns

---

**END OF DOCUMENT**

**Summary:**
- **Part I (Sections 12-18):** Production architecture for immediate implementation
- **Part II (Sections 1-11):** Technical reference for optional code editor (future)
- **Appendices A-D:** Implementation guidance, checklists, and references

**Next Action:** Begin implementation of Part I (Q2 2026, 12 weeks)
