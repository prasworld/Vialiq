# Google Blockly for Visual Edit Check Configuration

> **Date:** 2026-05-30  
> **Status:** 📋 Research & Architecture Design  
> **Purpose:** Evaluate and document Google Blockly for visual programming of Edit Checks and workflow pipelines

---

## 🎯 Executive Summary

### Key Decision

**✅ RECOMMENDED: Google Blockly for Non-Programmer Interface**

**Primary Use Cases:**
1. **Edit Check Configuration** — Study designers visually configure validation rules without coding
2. **Workflow Pipeline Builder** — Visual workflow automation for clinical data management processes
3. **Calculated Fields** — Formula builder for derived values (BMI, BSA, eGFR)
4. **Query Management Rules** — Automated query generation and routing logic

**Target Users:**
- 🎯 **Study Designers** — Configure edit checks without TypeScript knowledge
- 🎯 **Data Managers** — Build automated workflows visually
- 🎯 **Clinical Research Coordinators** — Define site-specific validation rules
- ⚠️ **NOT for Power Users** — Developers use TypeScript/C# directly (documented in other guides)

---

## 📊 Quick Reference

| Aspect | Decision | Notes |
|--------|----------|-------|
| **Technology** | ✅ Google Blockly v12.5+ | Mature, FOSS, healthcare pedigree |
| **Primary Use** | ✅ Edit Check visual configuration | Non-technical users |
| **Secondary Use** | ✅ Workflow pipeline builder | Process automation |
| **Bundle Size** | ⚠️ ~500 KB (minified) | Lazy load via Module Federation |
| **Learning Curve** | ✅ Low (drag-and-drop) | No programming knowledge required |
| **Code Generation** | ✅ TypeScript + C# | Generates production-ready validators |
| **Integration** | ✅ Angular 21 component | Embeds in Form Builder UI |
| **Extensibility** | ✅ Custom blocks | Domain-specific EDC blocks |

---

## Table of Contents

### Part I: Introduction & Architecture

- [1. What is Google Blockly?](#1-what-is-google-blockly)
  - 1.1 Overview
  - 1.2 Key Features
  - 1.3 Healthcare Applications
- [2. Why Blockly for Edit Checks?](#2-why-blockly-for-edit-checks)
  - 2.1 User Requirements
  - 2.2 Comparison with Alternatives
  - 2.3 Decision Rationale
- [3. Architecture Overview](#3-architecture-overview)
  - 3.1 System Components
  - 3.2 Integration Points
  - 3.3 Data Flow

### Part II: Custom Blocks for Edit Checks

- [4. Custom Block Library](#4-custom-block-library)
  - 4.1 Conditional Required
  - 4.2 Range Check with Unit Awareness
  - 4.3 Cross-Field Validation
  - 4.4 Date Ordering
  - 4.5 Calculated Fields
- [5. Block Categories](#5-block-categories)
  - 5.1 Logic Blocks
  - 5.2 Field Accessor Blocks
  - 5.3 Comparison Blocks
  - 5.4 Validation Result Blocks
  - 5.5 Medical Domain Blocks

### Part III: Code Generation

- [6. TypeScript Code Generation](#6-typescript-code-generation)
  - 6.1 Generator Architecture
  - 6.2 Template System
  - 6.3 Type Safety
- [7. C# Code Generation](#7-c-code-generation)
  - 7.1 Server-Side Validators
  - 7.2 Functional Pipeline Generation
  - 7.3 Testing Harness

### Part IV: Workflow Pipeline Builder

- [8. Workflow Concepts](#8-workflow-concepts)
  - 8.1 Use Cases
  - 8.2 Pipeline Components
  - 8.3 Execution Model
- [9. Workflow Blocks](#9-workflow-blocks)
  - 9.1 Trigger Blocks
  - 9.2 Action Blocks
  - 9.3 Decision Blocks
  - 9.4 Integration Blocks

### Part V: Implementation Guide

- [10. Technical Implementation](#10-technical-implementation)
  - 10.1 Angular Integration
  - 10.2 Block Definition System
  - 10.3 Code Generation Engine
  - 10.4 Serialization & Storage
- [11. User Experience](#11-user-experience)
  - 11.1 UI/UX Design
  - 11.2 Onboarding & Training
  - 11.3 Error Handling
- [12. Testing Strategy](#12-testing-strategy)
  - 12.1 Block Testing
  - 12.2 Generated Code Validation
  - 12.3 End-to-End Workflows

### Appendices

- [Appendix A: Complete Block Catalog](#appendix-a-complete-block-catalog)
- [Appendix B: Code Generation Templates](#appendix-b-code-generation-templates)
- [Appendix C: Migration from Manual Coding](#appendix-c-migration-from-manual-coding)
- [Appendix D: Performance Optimization](#appendix-d-performance-optimization)
- [Appendix E: Accessibility Considerations](#appendix-e-accessibility-considerations)

---

---

# PART I: INTRODUCTION & ARCHITECTURE

---

## 1. What is Google Blockly?

### 1.1 Overview

**Google Blockly** is an open-source, client-side JavaScript library for creating visual block-based programming editors. Originally developed by Google (now maintained by Raspberry Pi Foundation), Blockly transforms coding from text-based syntax to drag-and-drop visual blocks.

**Key Characteristics:**

```
┌─────────────────────────────────────────────────────────┐
│  Visual Programming Editor (Blockly)                    │
│                                                          │
│  ┌────────────┐   ┌────────────┐   ┌────────────┐      │
│  │ IF block   │ → │ Logic      │ → │ Action     │      │
│  │ (condition)│   │ (compare)  │   │ (validate) │      │
│  └────────────┘   └────────────┘   └────────────┘      │
│                                                          │
│                       ↓                                  │
│              Code Generator                              │
│                       ↓                                  │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Generated Code (TypeScript, C#, Python, etc.)    │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**Core Concepts:**

1. **Blocks** — Visual puzzle pieces representing code constructs (if/then, variables, functions)
2. **Workspace** — Canvas where users drag and arrange blocks
3. **Toolbox** — Categorized library of available blocks
4. **Code Generator** — Translates block arrangements into executable code
5. **Custom Blocks** — Domain-specific blocks for specialized applications

### 1.2 Key Features

| Feature | Description | Benefit for EDC |
|---------|-------------|-----------------|
| **Visual Programming** | Drag-and-drop blocks instead of typing code | Non-technical users can configure validators |
| **Type Safety** | Blocks have connection types (number, string, boolean) | Prevents invalid logic at design time |
| **Multi-Language Generation** | Generates JavaScript, Python, PHP, Dart, Lua | TypeScript for client, C# for server |
| **Custom Block API** | Define domain-specific blocks | EDC-specific validation blocks |
| **Serialization** | Save/load workspace as XML or JSON | Store validator definitions in database |
| **Internationalization** | Built-in i18n support | Multi-language study designs |
| **Accessibility** | Keyboard navigation, screen reader support | WCAG 2.1 AA compliance |
| **Extensibility** | Plugin system for custom renderers | Match Vialiq design system |

### 1.3 Healthcare Applications

Blockly has proven success in healthcare and clinical research:

**Examples:**

1. **MIT App Inventor** — Used in medical education apps
2. **Google Health Studies** — Study protocol configuration
3. **Epic MyChart Bedrock** — Patient-facing conditional logic
4. **OpenEMR** — Clinical decision support rules
5. **REDCap** — Branching logic builder (text-based, but same concept)

**Regulatory Considerations:**

✅ **21 CFR Part 11 Compatible** — Generated code is auditable and version-controlled  
✅ **ALCOA Compliance** — Visual blocks create audit trail (who created, when modified)  
✅ **GCP Validation** — Visual representation aids validation documentation  
✅ **Deterministic** — Same blocks always generate identical code (reproducible)

---

## 2. Why Blockly for Edit Checks?

### 2.1 User Requirements

**Problem Statement:**

Current edit check configuration requires TypeScript (client-side) or C# (server-side) programming. This creates bottlenecks:

❌ **Study Designers** — Clinical trial experts, not programmers  
❌ **Data Managers** — Configure checks daily, can't wait for dev team  
❌ **Regulatory Reviewers** — Need visual representation of validation logic  
❌ **Training Overhead** — New hires must learn programming before configuring studies

**Desired State:**

✅ **Visual Configuration** — Drag-and-drop blocks for common patterns  
✅ **Immediate Feedback** — See generated code in real-time  
✅ **No Coding Required** — 80% of edit checks via visual builder  
✅ **Escape Hatch** — Power users still write TypeScript/C# for complex cases

### 2.2 Comparison with Alternatives

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| **Google Blockly** | ✅ Mature, proven<br>✅ Custom blocks<br>✅ Multi-language gen<br>✅ Healthcare pedigree | ⚠️ 500 KB bundle<br>⚠️ Learning curve for custom blocks | ✅ **Recommended** |
| **Node-RED** | ✅ Visual workflows<br>✅ Large plugin ecosystem | ❌ Async-first (we need sync)<br>❌ Server-side focus | ❌ Wrong paradigm |
| **Scratch Blocks** | ✅ Simpler than Blockly<br>✅ Kid-friendly | ❌ Limited flexibility<br>❌ No type safety | ❌ Too simple |
| **Monaco Editor** | ✅ VS Code experience<br>✅ IntelliSense | ❌ Still requires coding<br>❌ Not visual | ❌ Wrong audience |
| **Custom React Flow** | ✅ Full control<br>✅ Modern React | ❌ Build from scratch<br>❌ Maintenance burden<br>❌ 6+ months dev | ❌ Too much effort |
| **JSON Schema Forms** | ✅ Declarative<br>✅ Small bundle | ❌ Limited to simple logic<br>❌ No visual representation | ❌ Not expressive enough |

### 2.3 Decision Rationale

**Why Blockly Wins:**

1. **Proven in Healthcare** — Already used in clinical research tools
2. **Type Safety** — Connection types prevent invalid logic
3. **Extensibility** — Custom EDC blocks for domain-specific patterns
4. **Code Generation** — Generates both TypeScript (client) and C# (server)
5. **Visual Audit Trail** — Screenshots of blocks serve as validation documentation
6. **Accessibility** — Built-in keyboard navigation and screen reader support
7. **i18n** — Supports multi-language studies out of the box

**Trade-offs Accepted:**

⚠️ **Bundle Size (500 KB)** — Mitigated by lazy loading via Module Federation  
⚠️ **Custom Block Development** — One-time effort, reusable across all studies  
⚠️ **Not for Complex Logic** — Power users still use TypeScript/C# directly

**Decision:**

✅ **Implement Blockly for 80% of edit checks** (simple to moderate complexity)  
✅ **Provide TypeScript/C# escape hatch** for remaining 20% (complex cross-visit logic)

---

## 3. Architecture Overview

### 3.1 System Components

```
┌───────────────────────────────────────────────────────────────────┐
│                    Form Builder UI (Angular 21)                    │
├───────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  Edit Check Configuration Modal                              │ │
│  │                                                               │ │
│  │  ┌─────────────┐  ┌─────────────────────────────────────┐   │ │
│  │  │  Tab: Form  │  │  Tab: Blockly (Visual Builder)      │   │ │
│  │  │  Inputs     │  │                                      │   │ │
│  │  │  (current)  │  │  ┌────────────────────────────────┐ │   │ │
│  │  └─────────────┘  │  │  Blockly Workspace             │ │   │ │
│  │                   │  │                                 │ │   │ │
│  │                   │  │  [Drag blocks here]             │ │   │ │
│  │                   │  │                                 │ │   │ │
│  │                   │  └────────────────────────────────┘ │   │ │
│  │                   │                                      │   │ │
│  │                   │  ┌────────────────────────────────┐ │   │ │
│  │                   │  │  Generated Code Preview        │ │   │ │
│  │                   │  │  (TypeScript or C#)            │ │   │ │
│  │                   │  └────────────────────────────────┘ │   │ │
│  │                   └─────────────────────────────────────┘   │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  [Save] → Serialize blocks to JSON → Store in FormSchema          │
└───────────────────────────────────────────────────────────────────┘
                                    ↓
                          FormSchema.validations[]
                                    ↓
        ┌───────────────────────────┴───────────────────────────┐
        ↓                                                        ↓
  Client-Side                                             Server-Side
  ┌─────────────────────┐                          ┌─────────────────────┐
  │ Blockly → TS Code   │                          │ Blockly → C# Code   │
  │ Generator           │                          │ Generator           │
  └──────────┬──────────┘                          └──────────┬──────────┘
             ↓                                                 ↓
  ┌─────────────────────┐                          ┌─────────────────────┐
  │ Validation Engine   │                          │ Edit Check Engine   │
  │ (Angular Service)   │                          │ (ASP.NET Core)      │
  └─────────────────────┘                          └─────────────────────┘
```

### 3.2 Integration Points

**1. Form Builder Integration**

```typescript
// Angular component wrapping Blockly
@Component({
  selector: 'app-edit-check-blockly-builder',
  template: `
    <div class="blockly-container">
      <div #blocklyDiv class="blockly-workspace"></div>
      <div class="code-preview">
        <h3>Generated Code</h3>
        <pre><code [highlight]="generatedCode" [language]="targetLanguage"></code></pre>
      </div>
    </div>
  `
})
export class EditCheckBlocklyBuilderComponent implements OnInit, OnDestroy {
  @ViewChild('blocklyDiv') blocklyDiv!: ElementRef;
  @Input() targetLanguage: 'typescript' | 'csharp' = 'typescript';
  @Input() formSchema!: FormSchema;
  @Output() blocklyChanged = new EventEmitter<BlocklyWorkspaceState>();
  
  private workspace!: Blockly.WorkspaceSvg;
  generatedCode = '';
  
  ngOnInit(): void {
    this.initializeBlockly();
    this.registerCustomBlocks();
    this.setupWorkspaceListeners();
  }
  
  private initializeBlockly(): void {
    this.workspace = Blockly.inject(this.blocklyDiv.nativeElement, {
      toolbox: this.buildToolbox(),
      grid: { spacing: 20, length: 3, colour: '#ccc', snap: true },
      zoom: { controls: true, wheel: true, startScale: 1.0 },
      trashcan: true
    });
  }
  
  private buildToolbox(): Blockly.utils.toolbox.ToolboxDefinition {
    return {
      kind: 'categoryToolbox',
      contents: [
        {
          kind: 'category',
          name: 'Logic',
          colour: '#5C81A6',
          contents: [
            { kind: 'block', type: 'edc_if_then' },
            { kind: 'block', type: 'edc_and_or' }
          ]
        },
        {
          kind: 'category',
          name: 'Fields',
          colour: '#5CA65C',
          contents: this.generateFieldBlocks()
        },
        {
          kind: 'category',
          name: 'Validation',
          colour: '#5CA68D',
          contents: [
            { kind: 'block', type: 'edc_pass' },
            { kind: 'block', type: 'edc_fail' },
            { kind: 'block', type: 'edc_warn' }
          ]
        }
      ]
    };
  }
  
  private generateFieldBlocks(): Blockly.utils.toolbox.BlockInfo[] {
    // Dynamically create field accessor blocks from formSchema
    return this.formSchema.fields.map(field => ({
      kind: 'block',
      type: 'edc_field_accessor',
      fields: {
        FIELD_NAME: field.name,
        FIELD_LABEL: field.label
      }
    }));
  }
}
```

**2. Storage Format**

Blockly workspace serialized to JSON in `FormSchema`:

```typescript
interface ValidationRule {
  id: string;
  type: 'blockly' | 'custom' | 'builtin';
  executionLayer: 'client' | 'server' | 'both';
  
  // For Blockly validators:
  blocklyWorkspace?: {
    version: string;                // Blockly version
    blocks: BlocklyWorkspaceJSON;   // Serialized blocks
    generatedCode: {
      typescript?: string;           // Client-side code
      csharp?: string;               // Server-side code
    };
    metadata: {
      createdBy: string;
      createdAt: string;
      modifiedAt: string;
      description?: string;
    };
  };
  
  // For custom validators (hand-written):
  customCode?: {
    typescript?: string;
    csharp?: string;
  };
}
```

**Example stored validation:**

```json
{
  "id": "val_001",
  "type": "blockly",
  "executionLayer": "both",
  "blocklyWorkspace": {
    "version": "12.5.1",
    "blocks": {
      "blocks": {
        "languageVersion": 0,
        "blocks": [
          {
            "type": "edc_conditional_required",
            "id": "block_001",
            "fields": {
              "TRIGGER_FIELD": "aeSerious",
              "OPERATOR": "===",
              "REQUIRED_FIELD": "saeNotificationDate",
              "MESSAGE": "SAE Notification Date is required when AE is serious"
            },
            "inputs": {
              "TRIGGER_VALUE": {
                "block": {
                  "type": "text",
                  "fields": { "TEXT": "Y" }
                }
              }
            }
          }
        ]
      }
    },
    "generatedCode": {
      "typescript": "// Auto-generated from Blockly\nimport { pass, fail } from '@vialiq/validator-sdk';\n\nexport const validateSAENotification = (value: any, formData: Record<string, any>) => {\n  if (formData['aeSerious'] === 'Y') {\n    if (!value) {\n      return fail('SAE Notification Date is required when AE is serious');\n    }\n  }\n  return pass();\n};",
      "csharp": "// Auto-generated from Blockly\nusing Vialiq.Validation;\n\npublic class ValidateSAENotification : IServerEditCheck\n{\n    public ValidationResult Validate(object value, FormSnapshot formData)\n    {\n        if (formData.GetField<string>(\"aeSerious\") == \"Y\")\n        {\n            if (value == null || string.IsNullOrEmpty(value.ToString()))\n            {\n                return ValidationResult.Fail(\"SAE Notification Date is required when AE is serious\");\n            }\n        }\n        return ValidationResult.Pass();\n    }\n}"
    },
    "metadata": {
      "createdBy": "study.designer@example.com",
      "createdAt": "2026-05-30T10:30:00Z",
      "modifiedAt": "2026-05-30T10:30:00Z",
      "description": "Conditional required: SAE notification date when serious"
    }
  }
}
```

### 3.3 Data Flow

**Edit Check Creation Flow:**

```
1. Study Designer Opens Form Builder
   ↓
2. Clicks "Add Edit Check" → Modal Opens
   ↓
3. Chooses "Visual Builder" Tab (Blockly)
   ↓
4. Drags blocks: [IF] → [Field = Value] → [THEN Require]
   ↓
5. Real-time code generation → Preview pane updates
   ↓
6. Clicks "Save"
   ↓
7. Blockly workspace serialized to JSON
   ↓
8. Stored in FormSchema.validations[]
   ↓
9. Backend API: POST /api/forms/{formId}/validations
   ↓
10. Database: Update form_schemas table
```

**Runtime Validation Flow (Client-Side):**

```
1. User Enters Data in Form Field
   ↓
2. Angular FormControl onChange → ValidationEngine
   ↓
3. ValidationEngine loads validators for field
   ↓
4. For Blockly validators:
   a. Retrieve generatedCode.typescript from ValidationRule
   b. Eval or dynamically import generated function
   c. Execute: validateFn(value, formData)
   ↓
5. ValidationResult → pass() | fail(message) | warn(message)
   ↓
6. UI updates: show error message or clear error
```

**Runtime Validation Flow (Server-Side):**

```
1. Client Submits Form Data
   ↓
2. Backend API: POST /api/forms/{formId}/data
   ↓
3. Edit Check Engine loads validators from DB
   ↓
4. For Blockly validators:
   a. Retrieve generatedCode.csharp from ValidationRule
   b. Compile C# code (or use pre-compiled DLL)
   c. Execute: IServerEditCheck.Validate(value, formData)
   ↓
5. ValidationResult → Pass() | Fail(message) | Warn(message)
   ↓
6. Aggregate all results → Return to client
   ↓
7. If failures: Return 400 with error details
   If warnings: Save data + generate queries
   If pass: Save data
```

---

**END OF PART I**

---

---

# PART II: CUSTOM BLOCKS FOR EDIT CHECKS

---

## 4. Custom Block Library

### 4.1 Block Design Principles

**Design Guidelines:**

1. **Domain-Specific** — Blocks represent EDC concepts, not generic programming constructs
2. **Type-Safe** — Connection types prevent invalid combinations
3. **Self-Documenting** — Block labels clearly indicate purpose
4. **Composable** — Blocks can be nested and combined
5. **Accessible** — Keyboard navigation and screen reader friendly

**Block Naming Convention:**

```
edc_[category]_[function]

Examples:
- edc_logic_if_then
- edc_field_get_value
- edc_validation_fail
- edc_medical_bmi_calculate
```

### 4.2 Core Block: Conditional Required

**Purpose:** Make a field required when another field has a specific value

**Visual Representation:**

```
┌───────────────────────────────────────────────────────┐
│ If field [dropdown: AE Serious ▼]                     │
│    [dropdown: equals ▼]                               │
│    [text input: Y]                                    │
│ Then require field [dropdown: SAE Notification Date ▼]│
│    with message [text: "Required for serious AEs"]    │
└───────────────────────────────────────────────────────┘
```

**Block Definition (JSON):**

```json
{
  "type": "edc_conditional_required",
  "message0": "If field %1 %2 %3",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "TRIGGER_FIELD",
      "options": [
        ["AE Serious", "aeSerious"],
        ["CTCAE Grade", "ctcaeGrade"],
        ["Dose Modified", "doseModified"]
      ]
    },
    {
      "type": "field_dropdown",
      "name": "OPERATOR",
      "options": [
        ["equals", "==="],
        ["not equals", "!=="],
        ["greater than", ">"],
        ["less than", "<"],
        ["contains", "includes"]
      ]
    },
    {
      "type": "input_value",
      "name": "TRIGGER_VALUE",
      "check": ["String", "Number"]
    }
  ],
  "message1": "Then require field %1",
  "args1": [
    {
      "type": "field_dropdown",
      "name": "REQUIRED_FIELD",
      "options": [
        ["SAE Notification Date", "saeNotificationDate"],
        ["Death Date", "deathDate"],
        ["Hospitalization Date", "hospitalizationDate"]
      ]
    }
  ],
  "message2": "with message %1",
  "args2": [
    {
      "type": "field_input",
      "name": "MESSAGE",
      "text": "This field is required"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 160,
  "tooltip": "Makes a field required based on another field's value",
  "helpUrl": "https://docs.vialiq.com/blockly/conditional-required"
}
```

**TypeScript Code Generator:**

```typescript
javascriptGenerator.forBlock['edc_conditional_required'] = function(block, generator) {
  const triggerField = block.getFieldValue('TRIGGER_FIELD');
  const operator = block.getFieldValue('OPERATOR');
  const triggerValue = generator.valueToCode(block, 'TRIGGER_VALUE', Order.ATOMIC);
  const requiredField = block.getFieldValue('REQUIRED_FIELD');
  const message = block.getFieldValue('MESSAGE');

  // Generate TypeScript code
  const code = `
// Conditional Required: ${requiredField}
export const validate_${requiredField} = (value: any, formData: FormData): ValidationResult => {
  const triggerValue = formData.getValue('${triggerField}');
  
  if (triggerValue ${operator} ${triggerValue}) {
    if (value === null || value === undefined || value === '') {
      return fail('${message}');
    }
  }
  
  return pass();
};
`;
  
  return code;
};
```

**C# Code Generator:**

```typescript
csharpGenerator.forBlock['edc_conditional_required'] = function(block, generator) {
  const triggerField = block.getFieldValue('TRIGGER_FIELD');
  const operator = block.getFieldValue('OPERATOR');
  const triggerValue = generator.valueToCode(block, 'TRIGGER_VALUE', Order.ATOMIC);
  const requiredField = block.getFieldValue('REQUIRED_FIELD');
  const message = block.getFieldValue('MESSAGE');
  
  // Map JS operators to C# equivalents
  const csharpOperator = operator === '===' ? '==' : operator;

  const code = `
// Conditional Required: ${requiredField}
public class Validate_${requiredField} : IServerEditCheck
{
    public string CheckId => "conditional_required_${requiredField}";
    public string Description => "Conditional required validation";
    
    public ValidationResult Validate(object value, FormSnapshot formData)
    {
        var triggerValue = formData.GetField<string>("${triggerField}");
        
        if (triggerValue ${csharpOperator} ${triggerValue})
        {
            if (value == null || string.IsNullOrEmpty(value?.ToString()))
            {
                return ValidationResult.Fail("${message}");
            }
        }
        
        return ValidationResult.Pass();
    }
}
`;
  
  return code;
};
```

### 4.3 Range Check with Unit Awareness

**Purpose:** Validate numeric values with different acceptable ranges per unit

**Visual Representation:**

```
┌───────────────────────────────────────────────────────┐
│ Range check with unit                                 │
│   Value field: [dropdown: Glucose Value ▼]            │
│   Unit field:  [dropdown: Glucose Unit ▼]             │
│                                                        │
│   When unit is [mmol/L]                               │
│     Min: [3.9]  Max: [7.8]                            │
│                                                        │
│   When unit is [mg/dL]                                │
│     Min: [70]   Max: [140]                            │
│                                                        │
│   Error message: [text: "Value out of range"]         │
└───────────────────────────────────────────────────────┘
```

**Block Definition:**

```typescript
Blockly.Blocks['edc_unit_aware_range'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Range check with unit");
    
    this.appendDummyInput()
        .appendField("Value field:")
        .appendField(new Blockly.FieldDropdown([
          ["Glucose Value", "glucoseValue"],
          ["Creatinine Value", "creatinineValue"],
          ["Weight", "weight"]
        ]), "VALUE_FIELD");
    
    this.appendDummyInput()
        .appendField("Unit field:")
        .appendField(new Blockly.FieldDropdown([
          ["Glucose Unit", "glucoseUnit"],
          ["Creatinine Unit", "creatinineUnit"],
          ["Weight Unit", "weightUnit"]
        ]), "UNIT_FIELD");
    
    // First unit range
    this.appendDummyInput()
        .appendField("When unit is")
        .appendField(new Blockly.FieldTextInput("mmol/L"), "UNIT1_NAME");
    
    this.appendDummyInput()
        .appendField("  Min:")
        .appendField(new Blockly.FieldNumber(0, 0, 1000, 0.1), "UNIT1_MIN")
        .appendField("Max:")
        .appendField(new Blockly.FieldNumber(100, 0, 1000, 0.1), "UNIT1_MAX");
    
    // Second unit range
    this.appendDummyInput()
        .appendField("When unit is")
        .appendField(new Blockly.FieldTextInput("mg/dL"), "UNIT2_NAME");
    
    this.appendDummyInput()
        .appendField("  Min:")
        .appendField(new Blockly.FieldNumber(0, 0, 10000, 1), "UNIT2_MIN")
        .appendField("Max:")
        .appendField(new Blockly.FieldNumber(1000, 0, 10000, 1), "UNIT2_MAX");
    
    this.appendDummyInput()
        .appendField("Error message:")
        .appendField(new Blockly.FieldTextInput("Value out of range"), "MESSAGE");
    
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("Validates numeric range based on unit of measurement");
  }
};
```

**TypeScript Generator:**

```typescript
javascriptGenerator.forBlock['edc_unit_aware_range'] = function(block, generator) {
  const valueField = block.getFieldValue('VALUE_FIELD');
  const unitField = block.getFieldValue('UNIT_FIELD');
  const unit1Name = block.getFieldValue('UNIT1_NAME');
  const unit1Min = block.getFieldValue('UNIT1_MIN');
  const unit1Max = block.getFieldValue('UNIT1_MAX');
  const unit2Name = block.getFieldValue('UNIT2_NAME');
  const unit2Min = block.getFieldValue('UNIT2_MIN');
  const unit2Max = block.getFieldValue('UNIT2_MAX');
  const message = block.getFieldValue('MESSAGE');

  const code = `
export const validate_${valueField}_range = (value: any, formData: FormData): ValidationResult => {
  const numericValue = parseFloat(value);
  const unit = formData.getValue('${unitField}');
  
  if (isNaN(numericValue)) {
    return fail('Value must be numeric');
  }
  
  let min: number, max: number;
  
  switch (unit) {
    case '${unit1Name}':
      min = ${unit1Min};
      max = ${unit1Max};
      break;
    case '${unit2Name}':
      min = ${unit2Min};
      max = ${unit2Max};
      break;
    default:
      return warn(\`Unknown unit: \${unit}\`);
  }
  
  if (numericValue < min || numericValue > max) {
    return fail(\`${message} (expected \${min}-\${max} \${unit})\`);
  }
  
  return pass();
};
`;
  
  return code;
};
```

### 4.4 Date Ordering Validation

**Purpose:** Ensure date fields are in correct chronological order

**Visual Representation:**

```
┌───────────────────────────────────────────────────────┐
│ Date ordering                                         │
│   [dropdown: AE Start Date ▼]                         │
│   must be                                             │
│   [dropdown: before or equal ▼]                       │
│   [dropdown: AE End Date ▼]                           │
│                                                        │
│   Error message: [text: "End date before start"]     │
└───────────────────────────────────────────────────────┘
```

**Block Definition:**

```typescript
Blockly.Blocks['edc_date_ordering'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Date ordering");
    
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([
          ["AE Start Date", "aeStartDate"],
          ["Visit Date", "visitDate"],
          ["Consent Date", "consentDate"]
        ]), "FIRST_DATE");
    
    this.appendDummyInput()
        .appendField("must be")
        .appendField(new Blockly.FieldDropdown([
          ["before", "before"],
          ["before or equal to", "beforeOrEqual"],
          ["after", "after"],
          ["after or equal to", "afterOrEqual"]
        ]), "COMPARISON");
    
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([
          ["AE End Date", "aeEndDate"],
          ["Death Date", "deathDate"],
          ["Study Completion Date", "studyCompletionDate"]
        ]), "SECOND_DATE");
    
    this.appendDummyInput()
        .appendField("Error message:")
        .appendField(new Blockly.FieldTextInput("Date order is invalid"), "MESSAGE");
    
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
    this.setTooltip("Validates chronological order of two dates");
  }
};
```

**TypeScript Generator:**

```typescript
javascriptGenerator.forBlock['edc_date_ordering'] = function(block, generator) {
  const firstDate = block.getFieldValue('FIRST_DATE');
  const comparison = block.getFieldValue('COMPARISON');
  const secondDate = block.getFieldValue('SECOND_DATE');
  const message = block.getFieldValue('MESSAGE');
  
  const comparisonLogic = {
    'before': '>=',
    'beforeOrEqual': '>',
    'after': '<=',
    'afterOrEqual': '<'
  };

  const code = `
export const validate_date_order_${firstDate}_${secondDate} = (value: any, formData: FormData): ValidationResult => {
  const date1 = formData.getValue('${firstDate}');
  const date2 = formData.getValue('${secondDate}');
  
  // Skip validation if either date is empty
  if (!date1 || !date2) {
    return pass();
  }
  
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
    return fail('Invalid date format');
  }
  
  if (d1.getTime() ${comparisonLogic[comparison]} d2.getTime()) {
    return fail('${message}');
  }
  
  return pass();
};
`;
  
  return code;
};
```

### 4.5 Calculated Field Validation (BMI Example)

**Purpose:** Validate that a calculated field matches expected formula

**Visual Representation:**

```
┌───────────────────────────────────────────────────────┐
│ Check calculated field: BMI                           │
│   Formula: weight (kg) / height (m)²                  │
│                                                        │
│   Weight field:     [dropdown: Weight ▼]              │
│   Weight unit:      [dropdown: Weight Unit ▼]         │
│   Height field:     [dropdown: Height ▼]              │
│   Height unit:      [dropdown: Height Unit ▼]         │
│   Calculated field: [dropdown: BMI ▼]                 │
│                                                        │
│   Tolerance: [0.1] (allow rounding differences)       │
│   Action: [dropdown: Warn if mismatch ▼]              │
└───────────────────────────────────────────────────────┘
```

**Block Definition:**

```typescript
Blockly.Blocks['edc_bmi_calculation'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Check calculated field: BMI");
    
    this.appendDummyInput()
        .appendField("Formula: weight (kg) / height (m)²");
    
    this.appendDummyInput()
        .appendField("Weight field:")
        .appendField(new Blockly.FieldDropdown([
          ["Weight", "weight"],
          ["Body Weight", "bodyWeight"]
        ]), "WEIGHT_FIELD");
    
    this.appendDummyInput()
        .appendField("Weight unit:")
        .appendField(new Blockly.FieldDropdown([
          ["Weight Unit", "weightUnit"],
          ["Body Weight Unit", "bodyWeightUnit"]
        ]), "WEIGHT_UNIT_FIELD");
    
    this.appendDummyInput()
        .appendField("Height field:")
        .appendField(new Blockly.FieldDropdown([
          ["Height", "height"],
          ["Body Height", "bodyHeight"]
        ]), "HEIGHT_FIELD");
    
    this.appendDummyInput()
        .appendField("Height unit:")
        .appendField(new Blockly.FieldDropdown([
          ["Height Unit", "heightUnit"],
          ["Body Height Unit", "bodyHeightUnit"]
        ]), "HEIGHT_UNIT_FIELD");
    
    this.appendDummyInput()
        .appendField("Calculated field:")
        .appendField(new Blockly.FieldDropdown([
          ["BMI", "bmi"],
          ["Body Mass Index", "bodyMassIndex"]
        ]), "BMI_FIELD");
    
    this.appendDummyInput()
        .appendField("Tolerance:")
        .appendField(new Blockly.FieldNumber(0.1, 0, 10, 0.01), "TOLERANCE");
    
    this.appendDummyInput()
        .appendField("Action:")
        .appendField(new Blockly.FieldDropdown([
          ["Warn if mismatch", "warn"],
          ["Fail if mismatch", "fail"],
          ["Pass (info only)", "pass"]
        ]), "ACTION");
    
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(65);
    this.setTooltip("Validates BMI calculation");
  }
};
```

**TypeScript Generator:**

```typescript
javascriptGenerator.forBlock['edc_bmi_calculation'] = function(block, generator) {
  const weightField = block.getFieldValue('WEIGHT_FIELD');
  const weightUnitField = block.getFieldValue('WEIGHT_UNIT_FIELD');
  const heightField = block.getFieldValue('HEIGHT_FIELD');
  const heightUnitField = block.getFieldValue('HEIGHT_UNIT_FIELD');
  const bmiField = block.getFieldValue('BMI_FIELD');
  const tolerance = block.getFieldValue('TOLERANCE');
  const action = block.getFieldValue('ACTION');

  const code = `
export const validate_${bmiField}_calculation = (value: any, formData: FormData): ValidationResult => {
  const weight = parseFloat(formData.getValue('${weightField}'));
  const weightUnit = formData.getValue('${weightUnitField}');
  const height = parseFloat(formData.getValue('${heightField}'));
  const heightUnit = formData.getValue('${heightUnitField}');
  const recordedBMI = parseFloat(value);
  
  // Skip if any field is missing
  if (isNaN(weight) || isNaN(height) || isNaN(recordedBMI)) {
    return pass();
  }
  
  // Convert to standard units (kg, m)
  let weightKg = weight;
  if (weightUnit === 'lbs') {
    weightKg = weight * 0.453592;
  }
  
  let heightM = height;
  if (heightUnit === 'cm') {
    heightM = height / 100;
  } else if (heightUnit === 'in') {
    heightM = height * 0.0254;
  }
  
  // Calculate expected BMI
  const expectedBMI = weightKg / (heightM * heightM);
  
  // Check within tolerance
  const difference = Math.abs(recordedBMI - expectedBMI);
  
  if (difference > ${tolerance}) {
    const message = \`BMI calculation mismatch: recorded \${recordedBMI.toFixed(1)}, expected \${expectedBMI.toFixed(1)} (difference: \${difference.toFixed(2)})\`;
    
    switch ('${action}') {
      case 'warn':
        return warn(message);
      case 'fail':
        return fail(message);
      default:
        return pass();
    }
  }
  
  return pass();
};
`;
  
  return code;
};
```

---

## 5. Block Categories

### 5.1 Logic Blocks

**Category Purpose:** Control flow and conditional logic

**Blocks:**

1. **`edc_if_then`** — Simple if-then statement
2. **`edc_if_then_else`** — If-then with else branch
3. **`edc_and`** — Logical AND (all conditions must be true)
4. **`edc_or`** — Logical OR (at least one condition must be true)
5. **`edc_not`** — Logical NOT (negation)

**Example: `edc_if_then`**

```
┌───────────────────────────────────────────────────────┐
│ If [condition]                                        │
│   [attach condition block]                            │
│ Then                                                  │
│   [attach action blocks]                              │
└───────────────────────────────────────────────────────┘
```

**Block Definition:**

```typescript
Blockly.Blocks['edc_if_then'] = {
  init: function() {
    this.appendValueInput("CONDITION")
        .setCheck("Boolean")
        .appendField("If");
    
    this.appendStatementInput("THEN")
        .setCheck(null)
        .appendField("Then");
    
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(210);
    this.setTooltip("Execute actions when condition is true");
  }
};
```

### 5.2 Field Accessor Blocks

**Category Purpose:** Access form field values

**Blocks:**

1. **`edc_field_get_value`** — Get current field value
2. **`edc_field_get_label`** — Get field display label
3. **`edc_field_is_empty`** — Check if field is empty
4. **`edc_field_has_value`** — Check if field has any value
5. **`edc_form_get_all_values`** — Get entire form data object

**Example: `edc_field_get_value`**

```
┌───────────────────────────────────────────────────────┐
│ Get value of field [dropdown: AE Serious ▼]           │
└───────────────────────────────────────────────────────┘
```

**Block Definition:**

```typescript
Blockly.Blocks['edc_field_get_value'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Get value of field")
        .appendField(new Blockly.FieldDropdown(this.generateFieldOptions), "FIELD_NAME");
    
    this.setOutput(true, null);
    this.setColour(120);
    this.setTooltip("Returns the current value of the specified field");
  },
  
  // Dynamically generate field options from form schema
  generateFieldOptions: function() {
    // This would be populated from the FormSchema at runtime
    return [
      ["AE Serious", "aeSerious"],
      ["AE Start Date", "aeStartDate"],
      ["CTCAE Grade", "ctcaeGrade"]
    ];
  }
};
```

**TypeScript Generator:**

```typescript
javascriptGenerator.forBlock['edc_field_get_value'] = function(block, generator) {
  const fieldName = block.getFieldValue('FIELD_NAME');
  const code = `formData.getValue('${fieldName}')`;
  return [code, Order.ATOMIC];
};
```

### 5.3 Comparison Blocks

**Category Purpose:** Compare values

**Blocks:**

1. **`edc_equals`** — Strict equality (===)
2. **`edc_not_equals`** — Strict inequality (!==)
3. **`edc_greater_than`** — Numeric >
4. **`edc_less_than`** — Numeric <
5. **`edc_greater_or_equal`** — Numeric >=
6. **`edc_less_or_equal`** — Numeric <=
7. **`edc_contains`** — String contains substring
8. **`edc_starts_with`** — String starts with prefix
9. **`edc_ends_with`** — String ends with suffix
10. **`edc_matches_regex`** — Regular expression match

**Example: `edc_equals`**

```
┌───────────────────────────────────────────────────────┐
│ [value A] equals [value B]                            │
└───────────────────────────────────────────────────────┘
```

**Block Definition:**

```typescript
Blockly.Blocks['edc_equals'] = {
  init: function() {
    this.appendValueInput("A")
        .setCheck(null);
    
    this.appendValueInput("B")
        .setCheck(null)
        .appendField("equals");
    
    this.setInputsInline(true);
    this.setOutput(true, "Boolean");
    this.setColour(210);
    this.setTooltip("Returns true if A equals B");
  }
};
```

### 5.4 Validation Result Blocks

**Category Purpose:** Return validation results

**Blocks:**

1. **`edc_pass`** — Validation passed
2. **`edc_fail`** — Validation failed with error message
3. **`edc_warn`** — Validation warning (non-blocking)
4. **`edc_info`** — Informational message only

**Example: `edc_fail`**

```
┌───────────────────────────────────────────────────────┐
│ Fail with message [text: "Invalid value"]             │
└───────────────────────────────────────────────────────┘
```

**Block Definition:**

```typescript
Blockly.Blocks['edc_fail'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Fail with message")
        .appendField(new Blockly.FieldTextInput("Invalid value"), "MESSAGE");
    
    this.setPreviousStatement(true, null);
    this.setColour(0);
    this.setTooltip("Returns a validation failure");
  }
};
```

**TypeScript Generator:**

```typescript
javascriptGenerator.forBlock['edc_fail'] = function(block, generator) {
  const message = block.getFieldValue('MESSAGE');
  const code = `return fail('${message}');\n`;
  return code;
};
```

### 5.5 Medical Domain Blocks

**Category Purpose:** Domain-specific clinical trial validations

**Blocks:**

1. **`edc_bmi_calculate`** — Calculate BMI from weight/height
2. **`edc_bsa_calculate`** — Calculate body surface area (Mosteller formula)
3. **`edc_egfr_calculate`** — Calculate eGFR (CKD-EPI equation)
4. **`edc_ctcae_grade_valid`** — Validate CTCAE grade (1-5)
5. **`edc_visit_window_check`** — Check if date within visit window
6. **`edc_age_from_dob`** — Calculate age from date of birth
7. **`edc_informed_consent_check`** — Ensure consent date before study procedures

**Example: `edc_egfr_calculate`**

```
┌───────────────────────────────────────────────────────┐
│ Calculate eGFR                                        │
│   Creatinine:     [dropdown: Serum Creatinine ▼]      │
│   Creatinine unit:[dropdown: mg/dL ▼]                 │
│   Age:            [dropdown: Age ▼]                   │
│   Sex:            [dropdown: Sex ▼]                   │
│   Race:           [dropdown: Race ▼]                  │
│   Method:         [dropdown: CKD-EPI 2021 ▼]          │
└───────────────────────────────────────────────────────┘
```

**Block Definition:**

```typescript
Blockly.Blocks['edc_egfr_calculate'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Calculate eGFR");
    
    this.appendDummyInput()
        .appendField("Creatinine:")
        .appendField(new Blockly.FieldDropdown([
          ["Serum Creatinine", "serumCreatinine"],
          ["Creatinine", "creatinine"]
        ]), "CREATININE_FIELD");
    
    this.appendDummyInput()
        .appendField("Creatinine unit:")
        .appendField(new Blockly.FieldDropdown([
          ["mg/dL", "mgdl"],
          ["µmol/L", "umoll"]
        ]), "CREATININE_UNIT");
    
    this.appendDummyInput()
        .appendField("Age:")
        .appendField(new Blockly.FieldDropdown([
          ["Age", "age"],
          ["Age at Visit", "ageAtVisit"]
        ]), "AGE_FIELD");
    
    this.appendDummyInput()
        .appendField("Sex:")
        .appendField(new Blockly.FieldDropdown([
          ["Sex", "sex"],
          ["Gender", "gender"]
        ]), "SEX_FIELD");
    
    this.appendDummyInput()
        .appendField("Race:")
        .appendField(new Blockly.FieldDropdown([
          ["Race", "race"],
          ["Ethnicity", "ethnicity"]
        ]), "RACE_FIELD");
    
    this.appendDummyInput()
        .appendField("Method:")
        .appendField(new Blockly.FieldDropdown([
          ["CKD-EPI 2021 (race-free)", "ckdepi2021"],
          ["CKD-EPI 2009 (with race)", "ckdepi2009"],
          ["MDRD", "mdrd"]
        ]), "METHOD");
    
    this.setOutput(true, "Number");
    this.setColour(65);
    this.setTooltip("Calculates estimated glomerular filtration rate");
  }
};
```

**TypeScript Generator (Complex Medical Calculation):**

```typescript
javascriptGenerator.forBlock['edc_egfr_calculate'] = function(block, generator) {
  const creatinineField = block.getFieldValue('CREATININE_FIELD');
  const creatinineUnit = block.getFieldValue('CREATININE_UNIT');
  const ageField = block.getFieldValue('AGE_FIELD');
  const sexField = block.getFieldValue('SEX_FIELD');
  const raceField = block.getFieldValue('RACE_FIELD');
  const method = block.getFieldValue('METHOD');

  const code = `
// eGFR Calculation (${method})
(() => {
  let creatinine = parseFloat(formData.getValue('${creatinineField}'));
  const age = parseFloat(formData.getValue('${ageField}'));
  const sex = formData.getValue('${sexField}');
  const race = formData.getValue('${raceField}');
  
  // Convert to mg/dL if needed
  if ('${creatinineUnit}' === 'umoll') {
    creatinine = creatinine / 88.4; // µmol/L to mg/dL
  }
  
  let egfr: number;
  
  if ('${method}' === 'ckdepi2021') {
    // CKD-EPI 2021 equation (race-free)
    const kappa = sex === 'F' ? 0.7 : 0.9;
    const alpha = sex === 'F' ? -0.241 : -0.302;
    const minValue = Math.min(creatinine / kappa, 1);
    const maxValue = Math.max(creatinine / kappa, 1);
    const sexFactor = sex === 'F' ? 1.012 : 1;
    
    egfr = 142 * Math.pow(minValue, alpha) * Math.pow(maxValue, -1.200) * Math.pow(0.9938, age) * sexFactor;
  } else if ('${method}' === 'ckdepi2009') {
    // CKD-EPI 2009 equation (with race)
    const kappa = sex === 'F' ? 0.7 : 0.9;
    const alpha = sex === 'F' ? -0.329 : -0.411;
    const minValue = Math.min(creatinine / kappa, 1);
    const maxValue = Math.max(creatinine / kappa, 1);
    const sexFactor = sex === 'F' ? 1.018 : 1;
    const raceFactor = race === 'Black' ? 1.159 : 1;
    
    egfr = 141 * Math.pow(minValue, alpha) * Math.pow(maxValue, -1.209) * Math.pow(0.993, age) * sexFactor * raceFactor;
  } else {
    // MDRD equation
    const sexFactor = sex === 'F' ? 0.742 : 1;
    const raceFactor = race === 'Black' ? 1.212 : 1;
    
    egfr = 175 * Math.pow(creatinine, -1.154) * Math.pow(age, -0.203) * sexFactor * raceFactor;
  }
  
  return Math.round(egfr);
})()
`;
  
  return [code, Order.FUNCTION_CALL];
};
```

---

**END OF PART II**

---

---

# PART III: CODE GENERATION

---

## 6. TypeScript Code Generation

### 6.1 Generator Architecture

**Code Generation Pipeline:**

```
Blockly Workspace (XML/JSON)
          ↓
   Block Tree Parser
          ↓
   Generator Registry (per language)
          ↓
   Template System + Code Builder
          ↓
   Post-Processing (formatting, optimization)
          ↓
   Generated Code (TypeScript or C#)
```

**Generator Registry:**

```typescript
// Generator registry for multiple languages
export class BlocklyCodeGeneratorService {
  private generators = new Map<string, BlocklyGenerator>();
  
  constructor() {
    this.registerGenerator('typescript', new TypeScriptGenerator());
    this.registerGenerator('csharp', new CSharpGenerator());
  }
  
  registerGenerator(language: string, generator: BlocklyGenerator): void {
    this.generators.set(language, generator);
  }
  
  generate(workspace: Blockly.Workspace, language: string): string {
    const generator = this.generators.get(language);
    if (!generator) {
      throw new Error(`No generator registered for language: ${language}`);
    }
    
    return generator.generate(workspace);
  }
}
```

### 6.2 Order of Operations

**Operator Precedence:**

Blockly uses order constants to ensure correct parenthesization in generated code:

```typescript
export enum Order {
  ATOMIC = 0,           // (expr)
  NEW = 1,              // new
  MEMBER = 2,           // . []
  FUNCTION_CALL = 3,    // ()
  INCREMENT = 4,        // ++ --
  UNARY = 5,            // ! ~ + - typeof void delete
  EXPONENTIATION = 6,   // **
  MULTIPLICATION = 7,   // * / %
  ADDITION = 8,         // + -
  BITWISE_SHIFT = 9,    // << >> >>>
  RELATIONAL = 10,      // < > <= >= in instanceof
  EQUALITY = 11,        // == != === !==
  BITWISE_AND = 12,     // &
  BITWISE_XOR = 13,     // ^
  BITWISE_OR = 14,      // |
  LOGICAL_AND = 15,     // &&
  LOGICAL_OR = 16,      // ||
  CONDITIONAL = 17,     // ?:
  ASSIGNMENT = 18,      // = += -= *= /= etc.
  YIELD = 19,           // yield
  COMMA = 20,           // ,
  NONE = 99             // (...)
}
```

**Example Usage:**

```typescript
// Block: A + B * C
javascriptGenerator.forBlock['math_arithmetic'] = function(block, generator) {
  const operatorMap = {
    'ADD': [' + ', Order.ADDITION],
    'MULTIPLY': [' * ', Order.MULTIPLICATION]
  };
  
  const operator = block.getFieldValue('OP');
  const [symbol, order] = operatorMap[operator];
  
  // Request operands at the correct precedence level
  const argA = generator.valueToCode(block, 'A', order);
  const argB = generator.valueToCode(block, 'B', order);
  
  const code = argA + symbol + argB;
  return [code, order];
};
```

### 6.3 TypeScript Validator Template

**Standard Template Structure:**

```typescript
// Template for generated validators
export const VALIDATOR_TEMPLATE = `
import { ValidationResult, pass, fail, warn } from '@vialiq/validator-sdk';
import { FormData } from '@vialiq/form-renderer';

/**
 * Auto-generated validator from Blockly
 * Created: {{createdAt}}
 * Modified: {{modifiedAt}}
 * Description: {{description}}
 */
export const {{validatorName}} = (
  value: any,
  formData: FormData
): ValidationResult => {
  {{validationLogic}}
};
`;
```

**Template Variables:**

| Variable | Description | Example |
|----------|-------------|---------|
| `{{validatorName}}` | Function name (camelCase) | `validateSAENotification` |
| `{{createdAt}}` | ISO timestamp | `2026-05-30T10:30:00Z` |
| `{{modifiedAt}}` | ISO timestamp | `2026-05-30T14:22:00Z` |
| `{{description}}` | Human-readable description | `Conditional required check` |
| `{{validationLogic}}` | Generated code body | `if (formData.getValue('aeSerious') === 'Y') { ... }` |

**Template Engine:**

```typescript
export class TemplateEngine {
  render(template: string, variables: Record<string, string>): string {
    let result = template;
    
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      result = result.replace(new RegExp(placeholder, 'g'), value);
    }
    
    return result;
  }
}
```

### 6.4 Complete TypeScript Generator Example

**Conditional Required Generator (Full Implementation):**

```typescript
export class TypeScriptValidatorGenerator {
  private templateEngine = new TemplateEngine();
  
  generateConditionalRequired(block: Blockly.Block): string {
    const triggerField = block.getFieldValue('TRIGGER_FIELD');
    const operator = block.getFieldValue('OPERATOR');
    const triggerValue = this.getInputValue(block, 'TRIGGER_VALUE');
    const requiredField = block.getFieldValue('REQUIRED_FIELD');
    const message = block.getFieldValue('MESSAGE');
    
    // Build validation logic
    const validationLogic = this.buildConditionalLogic(
      triggerField,
      operator,
      triggerValue,
      requiredField,
      message
    );
    
    // Render template
    return this.templateEngine.render(VALIDATOR_TEMPLATE, {
      validatorName: `validate_${requiredField}`,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      description: `Conditional required: ${requiredField} when ${triggerField} ${operator} ${triggerValue}`,
      validationLogic
    });
  }
  
  private buildConditionalLogic(
    triggerField: string,
    operator: string,
    triggerValue: string,
    requiredField: string,
    message: string
  ): string {
    // Generate safe comparison logic
    const comparison = this.buildComparison(triggerField, operator, triggerValue);
    
    return `
  // Check trigger condition
  const triggerValue = formData.getValue('${triggerField}');
  
  if (${comparison}) {
    // Validate required field
    if (value === null || value === undefined || value === '') {
      return fail('${this.escapeString(message)}');
    }
  }
  
  return pass();
`.trim();
  }
  
  private buildComparison(field: string, operator: string, value: string): string {
    const safeValue = this.escapeString(value);
    
    switch (operator) {
      case '===':
      case '!==':
      case '>':
      case '<':
      case '>=':
      case '<=':
        return `triggerValue ${operator} '${safeValue}'`;
      
      case 'includes':
        return `triggerValue?.includes('${safeValue}')`;
      
      case 'startsWith':
        return `triggerValue?.startsWith('${safeValue}')`;
      
      case 'endsWith':
        return `triggerValue?.endsWith('${safeValue}')`;
      
      case 'matches':
        return `new RegExp('${safeValue}').test(triggerValue)`;
      
      default:
        throw new Error(`Unsupported operator: ${operator}`);
    }
  }
  
  private escapeString(str: string): string {
    return str
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
  }
  
  private getInputValue(block: Blockly.Block, inputName: string): string {
    const input = block.getInput(inputName);
    if (!input?.connection?.targetBlock()) {
      return '';
    }
    
    const targetBlock = input.connection.targetBlock()!;
    
    // Handle different input block types
    if (targetBlock.type === 'text') {
      return targetBlock.getFieldValue('TEXT');
    } else if (targetBlock.type === 'math_number') {
      return targetBlock.getFieldValue('NUM');
    } else {
      // Recursively generate code for complex expressions
      return this.generateExpression(targetBlock);
    }
  }
  
  private generateExpression(block: Blockly.Block): string {
    // Delegate to appropriate generator based on block type
    const generator = this.getGeneratorForBlock(block.type);
    return generator(block);
  }
}
```

### 6.5 TypeScript Code Optimization

**Post-Processing Optimizations:**

1. **Dead Code Elimination**
2. **Constant Folding**
3. **Common Subexpression Elimination**
4. **Code Formatting (Prettier)**

```typescript
export class TypeScriptOptimizer {
  optimize(code: string): string {
    let optimized = code;
    
    // Step 1: Remove unused imports
    optimized = this.removeUnusedImports(optimized);
    
    // Step 2: Fold constants
    optimized = this.foldConstants(optimized);
    
    // Step 3: Simplify boolean expressions
    optimized = this.simplifyBooleans(optimized);
    
    // Step 4: Format with Prettier
    optimized = this.formatCode(optimized);
    
    return optimized;
  }
  
  private removeUnusedImports(code: string): string {
    // Parse imports and check usage
    const imports = this.extractImports(code);
    const usedSymbols = this.findUsedSymbols(code);
    
    return imports
      .filter(imp => usedSymbols.has(imp.symbol))
      .map(imp => imp.statement)
      .join('\n') + '\n\n' + this.removeImportStatements(code);
  }
  
  private foldConstants(code: string): string {
    // Example: Replace "3 + 4" with "7"
    return code.replace(/(\d+)\s*\+\s*(\d+)/g, (match, a, b) => {
      return String(Number(a) + Number(b));
    });
  }
  
  private simplifyBooleans(code: string): string {
    // Simplify boolean expressions
    let result = code;
    
    // !true → false
    result = result.replace(/!\s*true/g, 'false');
    
    // !false → true
    result = result.replace(/!\s*false/g, 'true');
    
    // !!expr → expr (when expr is already boolean)
    result = result.replace(/!!\s*(\w+)/g, '$1');
    
    return result;
  }
  
  private formatCode(code: string): string {
    // Use Prettier to format
    try {
      return prettier.format(code, {
        parser: 'typescript',
        singleQuote: true,
        trailingComma: 'es5',
        printWidth: 100
      });
    } catch (error) {
      console.warn('Prettier formatting failed, returning unformatted code');
      return code;
    }
  }
}
```

---

## 7. C# Code Generation

### 7.1 C# Validator Template

**Server-Side Validator Template:**

```csharp
using System;
using Vialiq.Platform.Validation;
using Vialiq.Platform.Forms;

namespace Vialiq.CustomValidators.Generated
{
    /// <summary>
    /// Auto-generated validator from Blockly
    /// Created: {{createdAt}}
    /// Modified: {{modifiedAt}}
    /// Description: {{description}}
    /// </summary>
    public class {{className}} : IServerEditCheck
    {
        public string CheckId => "{{checkId}}";
        public string Description => "{{description}}";
        public ExecutionLayer Layer => ExecutionLayer.{{executionLayer}};
        
        public ValidationResult Validate(object value, FormSnapshot formData)
        {
            {{validationLogic}}
        }
    }
}
```

### 7.2 C# Generator Implementation

**Conditional Required Generator (C#):**

```typescript
export class CSharpValidatorGenerator {
  private templateEngine = new TemplateEngine();
  
  generateConditionalRequired(block: Blockly.Block): string {
    const triggerField = block.getFieldValue('TRIGGER_FIELD');
    const operator = block.getFieldValue('OPERATOR');
    const triggerValue = this.getInputValue(block, 'TRIGGER_VALUE');
    const requiredField = block.getFieldValue('REQUIRED_FIELD');
    const message = block.getFieldValue('MESSAGE');
    
    const className = this.toClassName(requiredField);
    const checkId = this.toCheckId(requiredField);
    const validationLogic = this.buildConditionalLogic(
      triggerField,
      operator,
      triggerValue,
      message
    );
    
    return this.templateEngine.render(CSHARP_VALIDATOR_TEMPLATE, {
      className,
      checkId,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      description: `Conditional required: ${requiredField}`,
      executionLayer: 'Server',
      validationLogic
    });
  }
  
  private buildConditionalLogic(
    triggerField: string,
    operator: string,
    triggerValue: string,
    message: string
  ): string {
    // Map JavaScript operators to C#
    const csharpOperator = this.mapOperatorToCSharp(operator);
    const safeValue = this.escapeCSharpString(triggerValue);
    
    return `
            // Get trigger field value
            var triggerValue = formData.GetField<string>("${triggerField}");
            
            // Check trigger condition
            if (triggerValue ${csharpOperator} "${safeValue}")
            {
                // Validate required field
                if (value == null || string.IsNullOrWhiteSpace(value.ToString()))
                {
                    return ValidationResult.Fail("${this.escapeCSharpString(message)}");
                }
            }
            
            return ValidationResult.Pass();
`.trim();
  }
  
  private mapOperatorToCSharp(jsOperator: string): string {
    const operatorMap: Record<string, string> = {
      '===': '==',
      '!==': '!=',
      '>': '>',
      '<': '<',
      '>=': '>=',
      '<=': '<=',
      'includes': '.Contains',
      'startsWith': '.StartsWith',
      'endsWith': '.EndsWith'
    };
    
    return operatorMap[jsOperator] || jsOperator;
  }
  
  private toClassName(fieldName: string): string {
    // Convert camelCase to PascalCase
    return fieldName.charAt(0).toUpperCase() + fieldName.slice(1) + 'Validator';
  }
  
  private toCheckId(fieldName: string): string {
    // Convert camelCase to kebab-case
    return fieldName.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
  }
  
  private escapeCSharpString(str: string): string {
    return str
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
  }
}
```

### 7.3 Functional Pipeline Generation

**Generate Railway-Oriented Programming Style:**

For complex validators, generate functional pipeline code:

```typescript
export class CSharpFunctionalGenerator {
  generateFunctionalValidator(block: Blockly.Block): string {
    const checks = this.extractChecks(block);
    
    const validationSteps = checks.map((check, index) => 
      `var check${index} = ${this.generateCheckFunction(check)};`
    ).join('\n            ');
    
    const pipeline = checks.map((_, index) => 
      `check${index}`
    ).join('\n                .Bind(');
    
    return `
public class CompositeValidator : IServerEditCheck
{
    public string CheckId => "composite_validator";
    
    public ValidationResult Validate(object value, FormSnapshot formData)
    {
        ${validationSteps}
        
        // Railway-oriented programming pipeline
        return ValidationResult.Pass()
            .Bind(${pipeline});
    }
}
`;
  }
  
  private generateCheckFunction(check: BlocklyCheck): string {
    return `
(ctx) => {
    ${this.generateCheckLogic(check)}
}`;
  }
}
```

**Generated C# Example:**

```csharp
public class CompositeValidator : IServerEditCheck
{
    public string CheckId => "composite_bmi_check";
    
    public ValidationResult Validate(object value, FormSnapshot formData)
    {
        // Define individual checks
        var checkWeight = (ValidationContext ctx) => 
        {
            var weight = ctx.FormData.GetField<decimal>("weight");
            return weight > 0 && weight < 500
                ? ValidationResult.Pass()
                : ValidationResult.Fail("Weight out of range");
        };
        
        var checkHeight = (ValidationContext ctx) =>
        {
            var height = ctx.FormData.GetField<decimal>("height");
            return height > 0 && height < 300
                ? ValidationResult.Pass()
                : ValidationResult.Fail("Height out of range");
        };
        
        var checkBMI = (ValidationContext ctx) =>
        {
            var weight = ctx.FormData.GetField<decimal>("weight");
            var height = ctx.FormData.GetField<decimal>("height") / 100; // cm to m
            var recordedBMI = ctx.FormData.GetField<decimal>("bmi");
            var calculatedBMI = weight / (height * height);
            
            return Math.Abs(recordedBMI - calculatedBMI) < 0.1m
                ? ValidationResult.Pass()
                : ValidationResult.Warn($"BMI mismatch: recorded {recordedBMI:F1}, expected {calculatedBMI:F1}");
        };
        
        // Execute pipeline
        return ValidationResult.Pass()
            .Bind(checkWeight)
            .Bind(checkHeight)
            .Bind(checkBMI);
    }
}
```

### 7.4 C# Type Safety

**Generate Strongly-Typed Field Accessors:**

```typescript
export class CSharpTypeGenerator {
  generateStronglyTypedValidator(block: Blockly.Block, formSchema: FormSchema): string {
    // Extract field types from schema
    const fieldTypes = this.extractFieldTypes(formSchema);
    
    // Generate typed field accessors
    const accessors = this.generateAccessors(fieldTypes);
    
    return `
public class TypedValidator : IServerEditCheck
{
    ${accessors}
    
    public ValidationResult Validate(object value, FormSnapshot formData)
    {
        // Type-safe field access
        var aeSerious = GetAeSerious(formData);
        var saeDate = GetSaeNotificationDate(formData);
        
        if (aeSerious == "Y" && saeDate == null)
        {
            return ValidationResult.Fail("SAE Notification Date required");
        }
        
        return ValidationResult.Pass();
    }
    
    private string? GetAeSerious(FormSnapshot formData) 
        => formData.GetField<string>("aeSerious");
    
    private DateTime? GetSaeNotificationDate(FormSnapshot formData) 
        => formData.GetField<DateTime?>("saeNotificationDate");
}
`;
  }
}
```

### 7.5 C# NuGet Package Structure

**Generated Validator DLL Structure:**

```
CustomValidators.dll
├── Vialiq.CustomValidators.Generated
│   ├── ConditionalRequired/
│   │   ├── SaeNotificationDateValidator.cs
│   │   ├── DeathDateValidator.cs
│   │   └── HospitalizationDateValidator.cs
│   ├── RangeChecks/
│   │   ├── GlucoseRangeValidator.cs
│   │   ├── CreatinineRangeValidator.cs
│   │   └── WeightRangeValidator.cs
│   ├── DateOrdering/
│   │   ├── AeStartEndDateValidator.cs
│   │   └── VisitWindowValidator.cs
│   └── CalculatedFields/
│       ├── BmiValidator.cs
│       ├── BsaValidator.cs
│       └── EgfrValidator.cs
└── ValidatorManifest.json
```

**ValidatorManifest.json:**

```json
{
  "assemblyName": "CustomValidators",
  "version": "1.2.3",
  "generated": "2026-05-30T14:30:00Z",
  "blocklyVersion": "12.5.1",
  "validators": [
    {
      "checkId": "sae-notification-date-required",
      "className": "SaeNotificationDateValidator",
      "executionLayer": "Server",
      "dependsOn": ["aeSerious"],
      "sourceBlock": "edc_conditional_required"
    },
    {
      "checkId": "glucose-range-with-unit",
      "className": "GlucoseRangeValidator",
      "executionLayer": "Both",
      "dependsOn": ["glucoseValue", "glucoseUnit"],
      "sourceBlock": "edc_unit_aware_range"
    }
  ]
}
```

---

## 8. Code Generation Best Practices

### 8.1 Error Handling

**Defensive Code Generation:**

```typescript
export class SafeCodeGenerator {
  generateSafeFieldAccess(fieldName: string, fieldType: string): string {
    return `
// Safe field access with null checks
const ${fieldName}Value = (() => {
  try {
    const rawValue = formData.getValue('${fieldName}');
    if (rawValue === null || rawValue === undefined) {
      return null;
    }
    
    ${this.generateTypeConversion(fieldType, 'rawValue')}
  } catch (error) {
    console.error(\`Error accessing field ${fieldName}:\`, error);
    return null;
  }
})();
`;
  }
  
  private generateTypeConversion(fieldType: string, varName: string): string {
    switch (fieldType) {
      case 'number':
        return `
    const parsed = parseFloat(${varName});
    return isNaN(parsed) ? null : parsed;
`;
      case 'date':
        return `
    const date = new Date(${varName});
    return isNaN(date.getTime()) ? null : date;
`;
      case 'boolean':
        return `
    return ${varName} === 'true' || ${varName} === true;
`;
      default:
        return `
    return String(${varName});
`;
    }
  }
}
```

### 8.2 Code Comments & Documentation

**Auto-Generated Documentation:**

```typescript
export class DocumentationGenerator {
  generateJSDoc(block: Blockly.Block): string {
    const blockType = block.type;
    const description = this.getBlockDescription(blockType);
    const params = this.extractParameters(block);
    
    return `
/**
 * ${description}
 * 
 * Generated from Blockly block: ${blockType}
 * 
 * @param {any} value - The field value being validated
 * @param {FormData} formData - Complete form data snapshot
 * @returns {ValidationResult} Pass, Fail, or Warn result
 * 
 * @example
 * ${this.generateExample(block)}
 * 
 * Dependencies:
 ${params.map(p => ` * - ${p.name} (${p.type})`).join('\n')}
 */
`;
  }
  
  private generateExample(block: Blockly.Block): string {
    return `
 * const formData = { aeSerious: 'Y', saeNotificationDate: null };
 * const result = validateSaeNotification(null, formData);
 * // result.status === 'fail'
 * // result.message === 'SAE Notification Date required'
`.trim();
  }
}
```

### 8.3 Performance Optimization

**Lazy Evaluation:**

```typescript
// Generate code that short-circuits when possible
export const generateOptimizedLogic = (checks: Check[]): string => {
  return `
export const validateComposite = (value: any, formData: FormData): ValidationResult => {
  // Short-circuit on first failure (lazy evaluation)
  ${checks.map((check, i) => `
  // Check ${i + 1}: ${check.description}
  const result${i} = ${check.code};
  if (result${i}.status === 'fail') {
    return result${i}; // Stop on first failure
  }
  `).join('\n')}
  
  return pass();
};
`;
};
```

### 8.4 Testing Generated Code

**Automatic Test Generation:**

```typescript
export class TestGenerator {
  generateTests(block: Blockly.Block): string {
    const testCases = this.extractTestCases(block);
    
    return `
import { describe, it, expect } from 'vitest';
import { ${this.getValidatorName(block)} } from './generated-validator';

describe('${this.getValidatorName(block)}', () => {
  ${testCases.map(tc => this.generateTestCase(tc)).join('\n\n')}
});
`;
  }
  
  private generateTestCase(testCase: TestCase): string {
    return `
  it('${testCase.description}', () => {
    const formData = ${JSON.stringify(testCase.formData, null, 2)};
    const result = ${testCase.validatorName}(${testCase.value}, formData);
    
    expect(result.status).toBe('${testCase.expectedStatus}');
    ${testCase.expectedMessage ? `expect(result.message).toBe('${testCase.expectedMessage}');` : ''}
  });
`;
  }
}
```

**Generated Test Example:**

```typescript
import { describe, it, expect } from 'vitest';
import { validate_saeNotificationDate } from './generated-validator';

describe('validate_saeNotificationDate', () => {
  it('should fail when AE is serious and SAE date is missing', () => {
    const formData = {
      aeSerious: 'Y',
      saeNotificationDate: null
    };
    const result = validate_saeNotificationDate(null, formData);
    
    expect(result.status).toBe('fail');
    expect(result.message).toBe('SAE Notification Date is required when AE is serious');
  });
  
  it('should pass when AE is not serious', () => {
    const formData = {
      aeSerious: 'N',
      saeNotificationDate: null
    };
    const result = validate_saeNotificationDate(null, formData);
    
    expect(result.status).toBe('pass');
  });
  
  it('should pass when AE is serious and SAE date is provided', () => {
    const formData = {
      aeSerious: 'Y',
      saeNotificationDate: '2026-05-30'
    };
    const result = validate_saeNotificationDate('2026-05-30', formData);
    
    expect(result.status).toBe('pass');
  });
});
```

---

**END OF PART III**

---

---

# PART IV: WORKFLOW PIPELINE BUILDER

---

## 9. Workflow Concepts

### 9.1 Use Cases for Workflow Automation

**Clinical Data Management Workflows:**

| Workflow Type | Trigger | Actions | Example |
|---------------|---------|---------|---------|
| **Query Generation** | Validation failure | Create query, assign to CDM, notify site | "BMI out of range → Auto-generate query" |
| **Site Notification** | Serious AE reported | Send email to PI, log notification, update dashboard | "SAE reported → Notify PI within 24h" |
| **Data Lock** | Visit marked complete | Run all validations, resolve queries, lock form | "Baseline visit complete → Lock all baseline forms" |
| **Source Document Upload** | SAE form saved | Request source document, set reminder, track completion | "SAE saved → Request hospitalization discharge summary" |
| **Eligibility Screening** | Informed consent signed | Check I/E criteria, assign randomization, notify pharmacy | "Consent signed → Check eligibility → Randomize" |
| **Protocol Deviation** | Visit outside window | Create deviation form, notify sponsor, track resolution | "Visit 7 days late → Auto-create protocol deviation" |
| **SUSAR Reporting** | Serious + Unexpected + Related | Generate SUSAR report, notify regulatory, set deadlines | "SAE meets SUSAR criteria → Auto-report to authorities" |

### 9.2 Workflow Pipeline Components

**Building Blocks:**

```
Workflow Pipeline
│
├── Triggers (When)
│   ├── Form Event (save, submit, lock)
│   ├── Field Change (value updated)
│   ├── Validation Result (pass/fail/warn)
│   ├── Time-Based (scheduled, overdue)
│   └── External Event (API webhook)
│
├── Conditions (If)
│   ├── Field Value Check
│   ├── Cross-Form Logic
│   ├── Role-Based Rules
│   ├── Study State Check
│   └── Time Window Check
│
├── Actions (Then)
│   ├── Create Query
│   ├── Send Notification
│   ├── Update Form Status
│   ├── Lock/Unlock Form
│   ├── Generate Report
│   ├── Call External API
│   └── Schedule Follow-up
│
└── Error Handling
    ├── Retry Logic
    ├── Fallback Actions
    ├── Alert Admin
    └── Log Failure
```

### 9.3 Execution Model

**Pipeline Execution Flow:**

```
┌─────────────────────────────────────────────────────────────┐
│  Trigger Event                                              │
│  (e.g., "Form Saved")                                       │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│  Load Workflow Definitions                                   │
│  (All pipelines with matching trigger)                       │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│  Evaluate Conditions                                         │
│  (Filter pipelines where conditions are true)               │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│  Execute Actions (Sequential or Parallel)                    │
│  - Action 1: Create Query                                    │
│  - Action 2: Send Email (parallel with Action 1)            │
│  - Action 3: Update Dashboard (after Action 1 & 2)          │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│  Log Execution                                               │
│  (Audit trail: who, what, when, result)                     │
└─────────────────────────────────────────────────────────────┘
```

**Execution Modes:**

| Mode | Description | Use Case |
|------|-------------|----------|
| **Sequential** | Actions run one after another | Multi-step processes with dependencies |
| **Parallel** | Actions run simultaneously | Independent notifications |
| **Conditional** | Actions based on prior results | Branching logic (if-then-else) |
| **Loop** | Repeat actions for multiple items | Process all SAEs in a study |
| **Scheduled** | Delayed or recurring execution | Send reminder 7 days after SAE |

---

## 10. Workflow Blocks

### 10.1 Trigger Blocks

**Purpose:** Define when a workflow should execute

#### Trigger 1: Form Event

```
┌───────────────────────────────────────────────────────┐
│ When form [dropdown: AE Form ▼]                       │
│    [dropdown: is saved ▼]                             │
│    [dropdown: for any subject ▼]                      │
└───────────────────────────────────────────────────────┘
```

**Block Definition:**

```typescript
Blockly.Blocks['workflow_trigger_form_event'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("When form")
        .appendField(new Blockly.FieldDropdown([
          ["AE Form", "ae_form"],
          ["SAE Form", "sae_form"],
          ["Demographics", "demographics"],
          ["Vital Signs", "vital_signs"]
        ]), "FORM_NAME");
    
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([
          ["is saved", "saved"],
          ["is submitted", "submitted"],
          ["is locked", "locked"],
          ["is unlocked", "unlocked"],
          ["is signed", "signed"]
        ]), "EVENT_TYPE");
    
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([
          ["for any subject", "any"],
          ["for specific subject", "specific"],
          ["for site", "site"]
        ]), "SCOPE");
    
    this.setNextStatement(true, "Workflow");
    this.setColour(20);
    this.setTooltip("Triggers workflow when a form event occurs");
  }
};
```

#### Trigger 2: Field Value Change

```
┌───────────────────────────────────────────────────────┐
│ When field [dropdown: AE Serious ▼]                   │
│    changes to [text: Y]                               │
│    in form [dropdown: AE Form ▼]                      │
└───────────────────────────────────────────────────────┘
```

#### Trigger 3: Validation Result

```
┌───────────────────────────────────────────────────────┐
│ When validation [dropdown: fails ▼]                   │
│    on field [dropdown: BMI ▼]                         │
│    with severity [dropdown: Error ▼]                  │
└───────────────────────────────────────────────────────┘
```

#### Trigger 4: Time-Based

```
┌───────────────────────────────────────────────────────┐
│ Schedule workflow                                     │
│    [dropdown: Daily ▼] at [time: 09:00]               │
│    Timezone: [dropdown: UTC ▼]                        │
└───────────────────────────────────────────────────────┘
```

### 10.2 Action Blocks

**Purpose:** Define what happens when workflow executes

#### Action 1: Create Query

```
┌───────────────────────────────────────────────────────┐
│ Create query                                          │
│    Query type:    [dropdown: Validation Error ▼]      │
│    Assign to:     [dropdown: Site PI ▼]               │
│    Priority:      [dropdown: Normal ▼]                │
│    Message:       [text: "Please clarify BMI"]        │
│    Due in:        [number: 7] days                    │
└───────────────────────────────────────────────────────┘
```

**Block Definition:**

```typescript
Blockly.Blocks['workflow_action_create_query'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Create query");
    
    this.appendDummyInput()
        .appendField("Query type:")
        .appendField(new Blockly.FieldDropdown([
          ["Validation Error", "validation_error"],
          ["Missing Data", "missing_data"],
          ["Out of Range", "out_of_range"],
          ["Clarification", "clarification"],
          ["Protocol Deviation", "protocol_deviation"]
        ]), "QUERY_TYPE");
    
    this.appendDummyInput()
        .appendField("Assign to:")
        .appendField(new Blockly.FieldDropdown([
          ["Site PI", "site_pi"],
          ["Site Coordinator", "site_coordinator"],
          ["Data Manager", "data_manager"],
          ["Medical Monitor", "medical_monitor"]
        ]), "ASSIGNEE_ROLE");
    
    this.appendDummyInput()
        .appendField("Priority:")
        .appendField(new Blockly.FieldDropdown([
          ["Low", "low"],
          ["Normal", "normal"],
          ["High", "high"],
          ["Urgent", "urgent"]
        ]), "PRIORITY");
    
    this.appendDummyInput()
        .appendField("Message:")
        .appendField(new Blockly.FieldTextInput("Please clarify"), "MESSAGE");
    
    this.appendDummyInput()
        .appendField("Due in:")
        .appendField(new Blockly.FieldNumber(7, 1, 365), "DUE_DAYS")
        .appendField("days");
    
    this.setPreviousStatement(true, "Workflow");
    this.setNextStatement(true, "Workflow");
    this.setColour(160);
    this.setTooltip("Creates a query and assigns it");
  }
};
```

**TypeScript Generator:**

```typescript
javascriptGenerator.forBlock['workflow_action_create_query'] = function(block, generator) {
  const queryType = block.getFieldValue('QUERY_TYPE');
  const assigneeRole = block.getFieldValue('ASSIGNEE_ROLE');
  const priority = block.getFieldValue('PRIORITY');
  const message = block.getFieldValue('MESSAGE');
  const dueDays = block.getFieldValue('DUE_DAYS');

  const code = `
await workflowContext.actions.createQuery({
  queryType: '${queryType}',
  assigneeRole: '${assigneeRole}',
  priority: '${priority}',
  message: '${message}',
  dueDate: new Date(Date.now() + ${dueDays} * 24 * 60 * 60 * 1000),
  subjectId: workflowContext.subject.id,
  formId: workflowContext.form.id,
  fieldName: workflowContext.field?.name
});
`;
  
  return code;
};
```

#### Action 2: Send Notification

```
┌───────────────────────────────────────────────────────┐
│ Send notification                                     │
│    To:            [dropdown: Site PI ▼]               │
│    Method:        [checkboxes: ☑ Email ☑ SMS]         │
│    Subject:       [text: "Serious AE Reported"]       │
│    Template:      [dropdown: SAE Notification ▼]      │
│    Include PDF:   [checkbox: ☑]                       │
└───────────────────────────────────────────────────────┘
```

**Block Definition:**

```typescript
Blockly.Blocks['workflow_action_send_notification'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Send notification");
    
    this.appendDummyInput()
        .appendField("To:")
        .appendField(new Blockly.FieldDropdown([
          ["Site PI", "site_pi"],
          ["Sponsor", "sponsor"],
          ["Medical Monitor", "medical_monitor"],
          ["Safety Team", "safety_team"],
          ["Regulatory Affairs", "regulatory"]
        ]), "RECIPIENT");
    
    this.appendDummyInput()
        .appendField("Method:")
        .appendField(new Blockly.FieldCheckbox("TRUE"), "EMAIL")
        .appendField("Email")
        .appendField(new Blockly.FieldCheckbox("FALSE"), "SMS")
        .appendField("SMS");
    
    this.appendDummyInput()
        .appendField("Subject:")
        .appendField(new Blockly.FieldTextInput("Notification"), "SUBJECT");
    
    this.appendDummyInput()
        .appendField("Template:")
        .appendField(new Blockly.FieldDropdown([
          ["SAE Notification", "sae_notification"],
          ["Query Created", "query_created"],
          ["Visit Reminder", "visit_reminder"],
          ["Custom", "custom"]
        ]), "TEMPLATE");
    
    this.appendDummyInput()
        .appendField("Include PDF:")
        .appendField(new Blockly.FieldCheckbox("FALSE"), "INCLUDE_PDF");
    
    this.setPreviousStatement(true, "Workflow");
    this.setNextStatement(true, "Workflow");
    this.setColour(120);
    this.setTooltip("Sends notification via email/SMS");
  }
};
```

#### Action 3: Update Form Status

```
┌───────────────────────────────────────────────────────┐
│ Update form status                                    │
│    Form:          [dropdown: Current Form ▼]          │
│    New status:    [dropdown: Locked ▼]                │
│    Reason:        [text: "Visit complete"]            │
└───────────────────────────────────────────────────────┘
```

#### Action 4: Call External API

```
┌───────────────────────────────────────────────────────┐
│ Call external API                                     │
│    Endpoint:      [dropdown: CTMS Integration ▼]      │
│    Method:        [dropdown: POST ▼]                  │
│    Data to send:  [dropdown: Current Form Data ▼]     │
│    Timeout:       [number: 30] seconds                │
│    Retry on fail: [checkbox: ☑]                       │
└───────────────────────────────────────────────────────┘
```

#### Action 5: Schedule Follow-up

```
┌───────────────────────────────────────────────────────┐
│ Schedule follow-up task                               │
│    Task type:     [dropdown: Visit Window Check ▼]    │
│    Schedule for:  [number: 28] days from now          │
│    Assign to:     [dropdown: Site Coordinator ▼]      │
│    Description:   [text: "Check visit compliance"]    │
└───────────────────────────────────────────────────────┘
```

### 10.3 Decision Blocks

**Purpose:** Conditional branching in workflows

#### Decision 1: If-Then-Else

```
┌───────────────────────────────────────────────────────┐
│ If [condition block attached]                         │
│   Then                                                │
│     [action blocks]                                   │
│   Else                                                │
│     [alternative action blocks]                       │
└───────────────────────────────────────────────────────┘
```

**Block Definition:**

```typescript
Blockly.Blocks['workflow_decision_if_then_else'] = {
  init: function() {
    this.appendValueInput("CONDITION")
        .setCheck("Boolean")
        .appendField("If");
    
    this.appendStatementInput("THEN")
        .setCheck("Workflow")
        .appendField("Then");
    
    this.appendStatementInput("ELSE")
        .setCheck("Workflow")
        .appendField("Else");
    
    this.setPreviousStatement(true, "Workflow");
    this.setNextStatement(true, "Workflow");
    this.setColour(210);
    this.setTooltip("Conditional workflow execution");
  }
};
```

#### Decision 2: Switch/Case

```
┌───────────────────────────────────────────────────────┐
│ Switch on [dropdown: AE Severity ▼]                   │
│   Case "Mild"                                         │
│     [action: Log only]                                │
│   Case "Moderate"                                     │
│     [action: Create query]                            │
│   Case "Severe"                                       │
│     [action: Notify PI + Create SAE form]             │
│   Default                                             │
│     [action: Log error]                               │
└───────────────────────────────────────────────────────┘
```

### 10.4 Integration Blocks

**Purpose:** Connect with external systems

#### Integration 1: CTMS Sync

```
┌───────────────────────────────────────────────────────┐
│ Sync to CTMS                                          │
│    System:        [dropdown: Medidata CTMS ▼]         │
│    Entity:        [dropdown: Subject ▼]               │
│    Action:        [dropdown: Update ▼]                │
│    Field mapping: [button: Configure...]              │
└───────────────────────────────────────────────────────┘
```

#### Integration 2: eTMF Document Upload

```
┌───────────────────────────────────────────────────────┐
│ Upload to eTMF                                        │
│    Document type: [dropdown: Source Document ▼]       │
│    Zone:          [dropdown: Site File ▼]             │
│    PDF source:    [dropdown: Current Form PDF ▼]      │
│    Metadata:      [button: Configure...]              │
└───────────────────────────────────────────────────────┘
```

#### Integration 3: Safety Database

```
┌───────────────────────────────────────────────────────┐
│ Report to safety database                             │
│    System:        [dropdown: Argus Safety ▼]          │
│    Case type:     [dropdown: SUSAR ▼]                 │
│    Mapping:       [button: Configure fields...]       │
│    Auto-submit:   [checkbox: ☐] (requires review)     │
└───────────────────────────────────────────────────────┘
```

---

## 11. Complete Workflow Examples

### 11.1 Example 1: Auto-Query Generation

**Use Case:** Automatically create a query when BMI is out of range

**Visual Workflow:**

```
┌────────────────────────────────────────────────────────┐
│ [Trigger] When form "Vital Signs" is saved            │
│    ↓                                                   │
│ [Condition] If BMI validation fails                   │
│    ↓                                                   │
│ [Action 1] Create query                               │
│    - Type: Out of Range                               │
│    - Assign to: Site Coordinator                      │
│    - Message: "BMI {{value}} outside range {{range}}" │
│    - Due: 7 days                                      │
│    ↓                                                   │
│ [Action 2] Send notification                          │
│    - To: Site Coordinator                             │
│    - Method: Email                                    │
│    - Template: Query Created                          │
└────────────────────────────────────────────────────────┘
```

**Generated TypeScript:**

```typescript
export const autoQueryBMI: WorkflowDefinition = {
  id: 'auto_query_bmi',
  name: 'Auto-generate query for BMI out of range',
  trigger: {
    type: 'form_saved',
    formName: 'vital_signs'
  },
  
  async execute(context: WorkflowContext): Promise<WorkflowResult> {
    // Extract BMI validation result
    const bmiValidation = context.validationResults.find(
      v => v.fieldName === 'bmi'
    );
    
    // Check if BMI validation failed
    if (bmiValidation?.status === 'fail') {
      // Action 1: Create query
      const query = await context.actions.createQuery({
        queryType: 'out_of_range',
        assigneeRole: 'site_coordinator',
        priority: 'normal',
        message: `BMI ${context.form.data.bmi} outside acceptable range ${context.form.data.bmiMin}-${context.form.data.bmiMax}`,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        subjectId: context.subject.id,
        formId: context.form.id,
        fieldName: 'bmi'
      });
      
      // Action 2: Send notification
      await context.actions.sendNotification({
        recipient: 'site_coordinator',
        methods: ['email'],
        subject: 'Query Created: BMI Out of Range',
        template: 'query_created',
        templateData: {
          queryId: query.id,
          subjectId: context.subject.id,
          fieldName: 'bmi',
          value: context.form.data.bmi
        }
      });
      
      return { status: 'success', actionsExecuted: 2 };
    }
    
    return { status: 'skipped', reason: 'BMI validation passed' };
  }
};
```

### 11.2 Example 2: SAE Notification Workflow

**Use Case:** Notify PI and create SAE form when serious AE is reported

**Visual Workflow:**

```
┌────────────────────────────────────────────────────────┐
│ [Trigger] When field "AE Serious" changes to "Y"      │
│    ↓                                                   │
│ [Decision] If SAE form not already exists             │
│    ↓                                                   │
│ [Action 1] Create SAE form (auto-populate from AE)    │
│    ↓                                                   │
│ [Action 2] Send notification to PI                    │
│    - Method: Email + SMS                              │
│    - Priority: Urgent                                 │
│    - Include: AE form PDF                             │
│    ↓                                                   │
│ [Action 3] Set reminder (24h deadline)                │
│    - Task: Complete SAE notification                  │
│    - Assign to: Site PI                               │
│    ↓                                                   │
│ [Action 4] Log to audit trail                         │
│    - Event: SAE workflow triggered                    │
│    - Timestamp: {{now}}                               │
└────────────────────────────────────────────────────────┘
```

**Generated TypeScript:**

```typescript
export const saeNotificationWorkflow: WorkflowDefinition = {
  id: 'sae_notification',
  name: 'SAE Notification and Form Creation',
  trigger: {
    type: 'field_changed',
    formName: 'ae_form',
    fieldName: 'aeSerious',
    newValue: 'Y'
  },
  
  async execute(context: WorkflowContext): Promise<WorkflowResult> {
    // Check if SAE form already exists
    const existingSAE = await context.queries.findForm({
      subjectId: context.subject.id,
      formType: 'sae_form',
      linkedToAE: context.form.id
    });
    
    if (existingSAE) {
      return { status: 'skipped', reason: 'SAE form already exists' };
    }
    
    // Action 1: Create SAE form
    const saeForm = await context.actions.createForm({
      formType: 'sae_form',
      subjectId: context.subject.id,
      linkedToAE: context.form.id,
      autopopulate: {
        aeStartDate: context.form.data.aeStartDate,
        aeTerm: context.form.data.aeTerm,
        severity: context.form.data.severity
      }
    });
    
    // Action 2: Send urgent notification to PI
    await context.actions.sendNotification({
      recipient: 'site_pi',
      methods: ['email', 'sms'],
      priority: 'urgent',
      subject: `URGENT: Serious AE Reported - Subject ${context.subject.id}`,
      template: 'sae_notification',
      templateData: {
        subjectId: context.subject.id,
        aeTerm: context.form.data.aeTerm,
        severity: context.form.data.severity,
        reportedDate: new Date().toISOString()
      },
      attachments: [
        {
          type: 'pdf',
          source: 'form',
          formId: context.form.id
        }
      ]
    });
    
    // Action 3: Set 24-hour reminder
    await context.actions.scheduleTask({
      taskType: 'sae_notification_deadline',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      assigneeRole: 'site_pi',
      description: 'Complete SAE notification to sponsor',
      priority: 'urgent',
      relatedFormId: saeForm.id
    });
    
    // Action 4: Log to audit trail
    await context.actions.auditLog({
      event: 'sae_workflow_triggered',
      timestamp: new Date().toISOString(),
      userId: context.user.id,
      subjectId: context.subject.id,
      formId: context.form.id,
      details: {
        aeTerm: context.form.data.aeTerm,
        saeFormCreated: saeForm.id,
        notificationSent: true
      }
    });
    
    return {
      status: 'success',
      actionsExecuted: 4,
      saeFormId: saeForm.id
    };
  }
};
```

### 11.3 Example 3: Visit Window Compliance Check

**Use Case:** Daily scheduled workflow to check visit window compliance

**Visual Workflow:**

```
┌────────────────────────────────────────────────────────┐
│ [Trigger] Daily at 09:00 UTC                          │
│    ↓                                                   │
│ [Loop] For each active subject                        │
│    ↓                                                   │
│    [Condition] If visit window closing soon           │
│       ↓                                                │
│       [Action 1] Send reminder to site                │
│          - Days remaining: {{daysRemaining}}          │
│       ↓                                                │
│    [Condition] If visit window expired                │
│       ↓                                                │
│       [Action 2] Create protocol deviation            │
│       ↓                                                │
│       [Action 3] Notify medical monitor               │
└────────────────────────────────────────────────────────┘
```

**Generated TypeScript:**

```typescript
export const visitWindowComplianceWorkflow: WorkflowDefinition = {
  id: 'visit_window_compliance',
  name: 'Daily Visit Window Compliance Check',
  trigger: {
    type: 'scheduled',
    schedule: '0 9 * * *', // Daily at 09:00 UTC (cron)
    timezone: 'UTC'
  },
  
  async execute(context: WorkflowContext): Promise<WorkflowResult> {
    const results = {
      subjectsChecked: 0,
      remindersSet: 0,
      deviationsCreated: 0
    };
    
    // Get all active subjects
    const activeSubjects = await context.queries.getActiveSubjects();
    
    for (const subject of activeSubjects) {
      results.subjectsChecked++;
      
      // Get upcoming visits
      const upcomingVisits = await context.queries.getUpcomingVisits(subject.id);
      
      for (const visit of upcomingVisits) {
        const windowStart = new Date(visit.windowStart);
        const windowEnd = new Date(visit.windowEnd);
        const now = new Date();
        const daysRemaining = Math.floor((windowEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
        
        // Check if window closing soon (3 days or less)
        if (daysRemaining > 0 && daysRemaining <= 3) {
          await context.actions.sendNotification({
            recipient: 'site_coordinator',
            methods: ['email'],
            subject: `Visit Window Closing Soon - Subject ${subject.id}`,
            template: 'visit_reminder',
            templateData: {
              subjectId: subject.id,
              visitName: visit.name,
              daysRemaining,
              windowEnd: windowEnd.toISOString()
            }
          });
          results.remindersSet++;
        }
        
        // Check if window expired
        if (now > windowEnd) {
          // Check if visit was completed
          const visitCompleted = await context.queries.isVisitCompleted(
            subject.id,
            visit.id
          );
          
          if (!visitCompleted) {
            // Create protocol deviation
            await context.actions.createForm({
              formType: 'protocol_deviation',
              subjectId: subject.id,
              autopopulate: {
                deviationType: 'visit_window_violation',
                visitName: visit.name,
                expectedDate: windowEnd.toISOString(),
                actualDate: 'Not completed',
                severity: 'Major'
              }
            });
            results.deviationsCreated++;
            
            // Notify medical monitor
            await context.actions.sendNotification({
              recipient: 'medical_monitor',
              methods: ['email'],
              priority: 'high',
              subject: `Protocol Deviation: Visit Window Expired - Subject ${subject.id}`,
              template: 'protocol_deviation_notification',
              templateData: {
                subjectId: subject.id,
                visitName: visit.name,
                expectedDate: windowEnd.toISOString()
              }
            });
          }
        }
      }
    }
    
    return {
      status: 'success',
      summary: results
    };
  }
};
```

---

**END OF PART IV**

---

---

# PART V: IMPLEMENTATION GUIDE

---

## 12. Angular Integration

### 12.1 BlocklyWorkspace Component

**Purpose:** Angular component that hosts Blockly workspace and manages block lifecycle

**Component Structure:**

```typescript
// libs/form-builder/src/lib/blockly/blockly-workspace.component.ts
import { Component, ElementRef, Input, Output, EventEmitter, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

@Component({
  selector: 'app-blockly-workspace',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="blockly-container">
      <div class="blockly-toolbar">
        <button (click)="save()" [disabled]="!isDirty">Save</button>
        <button (click)="undo()" [disabled]="!canUndo">Undo</button>
        <button (click)="redo()" [disabled]="!canRedo">Redo</button>
        <button (click)="exportCode()">Generate Code</button>
        <button (click)="clear()">Clear</button>
      </div>
      
      <div #blocklyDiv class="blockly-workspace"></div>
      
      <div class="blockly-sidebar">
        <h3>Generated Code</h3>
        <pre><code [innerText]="generatedCode"></code></pre>
      </div>
    </div>
  `,
  styles: [`
    .blockly-container {
      display: grid;
      grid-template-columns: 1fr 400px;
      grid-template-rows: auto 1fr;
      height: 100%;
    }
    
    .blockly-toolbar {
      grid-column: 1 / -1;
      padding: 8px;
      border-bottom: 1px solid #ccc;
      background: #f5f5f5;
    }
    
    .blockly-workspace {
      grid-column: 1;
      width: 100%;
      height: 100%;
    }
    
    .blockly-sidebar {
      grid-column: 2;
      padding: 16px;
      border-left: 1px solid #ccc;
      overflow-y: auto;
      background: #fafafa;
    }
  `]
})
export class BlocklyWorkspaceComponent implements OnInit, OnDestroy {
  @ViewChild('blocklyDiv', { static: true }) blocklyDiv!: ElementRef;
  
  @Input() mode: 'editCheck' | 'workflow' = 'editCheck';
  @Input() initialWorkspace?: string; // JSON from server
  
  @Output() workspaceChanged = new EventEmitter<string>();
  @Output() codeGenerated = new EventEmitter<{ typescript: string; csharp: string }>();
  
  private workspace!: Blockly.WorkspaceSvg;
  private changeListener?: () => void;
  
  isDirty = false;
  canUndo = false;
  canRedo = false;
  generatedCode = '';
  
  ngOnInit(): void {
    this.initializeBlockly();
    this.registerCustomBlocks();
    this.loadInitialWorkspace();
  }
  
  ngOnDestroy(): void {
    if (this.changeListener) {
      this.workspace.removeChangeListener(this.changeListener);
    }
    this.workspace?.dispose();
  }
  
  private initializeBlockly(): void {
    const toolbox = this.mode === 'editCheck'
      ? this.getEditCheckToolbox()
      : this.getWorkflowToolbox();
    
    this.workspace = Blockly.inject(this.blocklyDiv.nativeElement, {
      toolbox,
      grid: {
        spacing: 20,
        length: 3,
        colour: '#ccc',
        snap: true
      },
      zoom: {
        controls: true,
        wheel: true,
        startScale: 1.0,
        maxScale: 3,
        minScale: 0.3,
        scaleSpeed: 1.2
      },
      trashcan: true,
      move: {
        scrollbars: {
          horizontal: true,
          vertical: true
        },
        drag: true,
        wheel: true
      },
      renderer: 'zelos' // Modern renderer with rounded blocks
    });
    
    // Listen for workspace changes
    this.changeListener = () => {
      this.isDirty = true;
      this.canUndo = this.workspace.getUndoStack().length > 0;
      this.canRedo = this.workspace.getRedoStack().length > 0;
      
      // Auto-generate code preview
      this.generatedCode = this.generateTypeScriptCode();
      
      // Emit workspace JSON
      const workspaceJson = Blockly.serialization.workspaces.save(this.workspace);
      this.workspaceChanged.emit(JSON.stringify(workspaceJson));
    };
    
    this.workspace.addChangeListener(this.changeListener);
  }
  
  private registerCustomBlocks(): void {
    if (this.mode === 'editCheck') {
      // Register edit check blocks (from Section 4)
      this.registerConditionalRequiredBlock();
      this.registerUnitAwareRangeBlock();
      this.registerDateOrderingBlock();
      this.registerBMICalculationBlock();
      this.registerEGFRCalculationBlock();
    } else {
      // Register workflow blocks (from Section 10)
      this.registerWorkflowTriggerBlocks();
      this.registerWorkflowActionBlocks();
      this.registerWorkflowDecisionBlocks();
    }
  }
  
  private loadInitialWorkspace(): void {
    if (this.initialWorkspace) {
      try {
        const workspaceJson = JSON.parse(this.initialWorkspace);
        Blockly.serialization.workspaces.load(workspaceJson, this.workspace);
        this.isDirty = false;
      } catch (error) {
        console.error('Failed to load initial workspace:', error);
      }
    }
  }
  
  private getEditCheckToolbox(): Blockly.utils.toolbox.ToolboxDefinition {
    return {
      kind: 'categoryToolbox',
      contents: [
        {
          kind: 'category',
          name: 'Logic',
          colour: '#5C81A6',
          contents: [
            { kind: 'block', type: 'controls_if' },
            { kind: 'block', type: 'logic_compare' },
            { kind: 'block', type: 'logic_operation' },
            { kind: 'block', type: 'logic_negate' }
          ]
        },
        {
          kind: 'category',
          name: 'Math',
          colour: '#5CA65C',
          contents: [
            { kind: 'block', type: 'math_number' },
            { kind: 'block', type: 'math_arithmetic' },
            { kind: 'block', type: 'math_single' }
          ]
        },
        {
          kind: 'category',
          name: 'Text',
          colour: '#5CA699',
          contents: [
            { kind: 'block', type: 'text' },
            { kind: 'block', type: 'text_join' },
            { kind: 'block', type: 'text_length' }
          ]
        },
        {
          kind: 'category',
          name: 'Field Validation',
          colour: '#D14081',
          contents: [
            { kind: 'block', type: 'validation_conditional_required' },
            { kind: 'block', type: 'validation_unit_aware_range' },
            { kind: 'block', type: 'validation_date_ordering' }
          ]
        },
        {
          kind: 'category',
          name: 'Medical Calculations',
          colour: '#A65C81',
          contents: [
            { kind: 'block', type: 'medical_bmi_calculation' },
            { kind: 'block', type: 'medical_egfr_calculation' }
          ]
        }
      ]
    };
  }
  
  private getWorkflowToolbox(): Blockly.utils.toolbox.ToolboxDefinition {
    return {
      kind: 'categoryToolbox',
      contents: [
        {
          kind: 'category',
          name: 'Triggers',
          colour: '#5C81A6',
          contents: [
            { kind: 'block', type: 'workflow_trigger_form_event' },
            { kind: 'block', type: 'workflow_trigger_field_change' },
            { kind: 'block', type: 'workflow_trigger_validation_result' },
            { kind: 'block', type: 'workflow_trigger_time_based' }
          ]
        },
        {
          kind: 'category',
          name: 'Actions',
          colour: '#5CA65C',
          contents: [
            { kind: 'block', type: 'workflow_action_create_query' },
            { kind: 'block', type: 'workflow_action_send_notification' },
            { kind: 'block', type: 'workflow_action_update_form_status' },
            { kind: 'block', type: 'workflow_action_call_api' }
          ]
        },
        {
          kind: 'category',
          name: 'Decisions',
          colour: '#A65C81',
          contents: [
            { kind: 'block', type: 'workflow_decision_if_then_else' },
            { kind: 'block', type: 'workflow_decision_switch_case' }
          ]
        },
        {
          kind: 'category',
          name: 'Integrations',
          colour: '#D14081',
          contents: [
            { kind: 'block', type: 'workflow_integration_ctms' },
            { kind: 'block', type: 'workflow_integration_etmf' },
            { kind: 'block', type: 'workflow_integration_safety_db' }
          ]
        }
      ]
    };
  }
  
  save(): void {
    const workspaceJson = Blockly.serialization.workspaces.save(this.workspace);
    const typescript = this.generateTypeScriptCode();
    const csharp = this.generateCSharpCode();
    
    this.codeGenerated.emit({ typescript, csharp });
    this.isDirty = false;
  }
  
  undo(): void {
    this.workspace.undo(false);
  }
  
  redo(): void {
    this.workspace.undo(true);
  }
  
  exportCode(): void {
    const typescript = this.generateTypeScriptCode();
    const csharp = this.generateCSharpCode();
    
    this.codeGenerated.emit({ typescript, csharp });
  }
  
  clear(): void {
    if (confirm('Clear entire workspace? This cannot be undone.')) {
      this.workspace.clear();
      this.isDirty = false;
    }
  }
  
  private generateTypeScriptCode(): string {
    return javascriptGenerator.workspaceToCode(this.workspace);
  }
  
  private generateCSharpCode(): string {
    // Use custom C# generator (implemented in Section 6)
    // This would be imported from a separate module
    return '// C# code generation implementation';
  }
  
  // Block registration methods would be implemented here
  // (Implementations from Sections 4 and 10)
  private registerConditionalRequiredBlock(): void { /* ... */ }
  private registerUnitAwareRangeBlock(): void { /* ... */ }
  private registerDateOrderingBlock(): void { /* ... */ }
  private registerBMICalculationBlock(): void { /* ... */ }
  private registerEGFRCalculationBlock(): void { /* ... */ }
  private registerWorkflowTriggerBlocks(): void { /* ... */ }
  private registerWorkflowActionBlocks(): void { /* ... */ }
  private registerWorkflowDecisionBlocks(): void { /* ... */ }
}
```

### 12.2 Service Layer

**Purpose:** Manage Blockly configuration, block definitions, and code generation

**BlocklyService:**

```typescript
// libs/form-builder/src/lib/blockly/blockly.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import * as Blockly from 'blockly';

export interface BlockDefinition {
  id: string;
  type: 'editCheck' | 'workflow';
  name: string;
  category: string;
  config: any; // Blockly block config
  generator: {
    typescript: (block: Blockly.Block) => string;
    csharp?: (block: Blockly.Block) => string;
  };
}

export interface SavedWorkspace {
  id: string;
  name: string;
  type: 'editCheck' | 'workflow';
  workspaceJson: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class BlocklyService {
  private readonly API_BASE = '/api/blockly';
  
  private customBlocks$ = new BehaviorSubject<BlockDefinition[]>([]);
  
  constructor(private http: HttpClient) {
    this.loadCustomBlocks();
  }
  
  /**
   * Load all custom block definitions from server
   */
  private loadCustomBlocks(): void {
    this.http.get<BlockDefinition[]>(`${this.API_BASE}/blocks`)
      .subscribe(blocks => {
        this.customBlocks$.next(blocks);
        this.registerBlocks(blocks);
      });
  }
  
  /**
   * Register block definitions with Blockly
   */
  private registerBlocks(blocks: BlockDefinition[]): void {
    blocks.forEach(block => {
      Blockly.Blocks[block.id] = {
        init: function() {
          // Dynamic block initialization from config
          this.jsonInit(block.config);
        }
      };
      
      // Register TypeScript generator
      // javascriptGenerator.forBlock[block.id] = block.generator.typescript;
    });
  }
  
  /**
   * Save workspace configuration to server
   */
  saveWorkspace(workspace: Partial<SavedWorkspace>): Observable<SavedWorkspace> {
    return this.http.post<SavedWorkspace>(`${this.API_BASE}/workspaces`, workspace);
  }
  
  /**
   * Load workspace configuration from server
   */
  loadWorkspace(id: string): Observable<SavedWorkspace> {
    return this.http.get<SavedWorkspace>(`${this.API_BASE}/workspaces/${id}`);
  }
  
  /**
   * Generate code from workspace JSON
   */
  generateCode(workspaceJson: string, target: 'typescript' | 'csharp'): Observable<string> {
    return this.http.post(`${this.API_BASE}/generate`, {
      workspaceJson,
      target
    }, { responseType: 'text' });
  }
  
  /**
   * Validate workspace (ensure all blocks are connected correctly)
   */
  validateWorkspace(workspaceJson: string): Observable<{ valid: boolean; errors: string[] }> {
    return this.http.post<{ valid: boolean; errors: string[] }>(
      `${this.API_BASE}/validate`,
      { workspaceJson }
    );
  }
  
  /**
   * Get available custom blocks
   */
  getCustomBlocks(): Observable<BlockDefinition[]> {
    return this.customBlocks$.asObservable();
  }
}
```

### 12.3 State Management

**Purpose:** Manage form builder state with Blockly workspace integration

**Using NgRx (Alternative: Akita, or simple service):**

```typescript
// libs/form-builder/src/lib/state/form-builder.actions.ts
import { createAction, props } from '@ngrx/store';

export const loadWorkspace = createAction(
  '[Form Builder] Load Workspace',
  props<{ workspaceId: string }>()
);

export const loadWorkspaceSuccess = createAction(
  '[Form Builder] Load Workspace Success',
  props<{ workspace: any }>()
);

export const updateWorkspace = createAction(
  '[Form Builder] Update Workspace',
  props<{ workspaceJson: string }>()
);

export const generateCode = createAction(
  '[Form Builder] Generate Code',
  props<{ target: 'typescript' | 'csharp' }>()
);

export const generateCodeSuccess = createAction(
  '[Form Builder] Generate Code Success',
  props<{ typescript: string; csharp: string }>()
);

export const saveValidation = createAction(
  '[Form Builder] Save Validation',
  props<{ fieldName: string; workspaceJson: string }>()
);
```

```typescript
// libs/form-builder/src/lib/state/form-builder.reducer.ts
import { createReducer, on } from '@ngrx/store';
import * as FormBuilderActions from './form-builder.actions';

export interface FormBuilderState {
  currentWorkspace: {
    id: string | null;
    name: string;
    type: 'editCheck' | 'workflow';
    workspaceJson: string;
    isDirty: boolean;
  };
  generatedCode: {
    typescript: string;
    csharp: string;
  };
  validations: Record<string, string>; // fieldName -> workspaceJson
  loading: boolean;
  error: string | null;
}

const initialState: FormBuilderState = {
  currentWorkspace: {
    id: null,
    name: '',
    type: 'editCheck',
    workspaceJson: '',
    isDirty: false
  },
  generatedCode: {
    typescript: '',
    csharp: ''
  },
  validations: {},
  loading: false,
  error: null
};

export const formBuilderReducer = createReducer(
  initialState,
  
  on(FormBuilderActions.loadWorkspace, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(FormBuilderActions.loadWorkspaceSuccess, (state, { workspace }) => ({
    ...state,
    currentWorkspace: {
      ...workspace,
      isDirty: false
    },
    loading: false
  })),
  
  on(FormBuilderActions.updateWorkspace, (state, { workspaceJson }) => ({
    ...state,
    currentWorkspace: {
      ...state.currentWorkspace,
      workspaceJson,
      isDirty: true
    }
  })),
  
  on(FormBuilderActions.generateCodeSuccess, (state, { typescript, csharp }) => ({
    ...state,
    generatedCode: { typescript, csharp }
  })),
  
  on(FormBuilderActions.saveValidation, (state, { fieldName, workspaceJson }) => ({
    ...state,
    validations: {
      ...state.validations,
      [fieldName]: workspaceJson
    },
    currentWorkspace: {
      ...state.currentWorkspace,
      isDirty: false
    }
  }))
);
```

### 12.4 Module Federation Integration

**Purpose:** Lazy-load Blockly (500KB) only when user opens visual programming mode

**Webpack Configuration:**

```typescript
// apps/form-builder/webpack.config.ts
import { ModuleFederationConfig } from '@nx/webpack';

const config: ModuleFederationConfig = {
  name: 'form-builder',
  
  exposes: {
    './BlocklyEditor': './src/app/blockly/blockly-editor.routes.ts'
  },
  
  remotes: {
    // Remote modules if needed
  },
  
  shared: {
    '@angular/core': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
    '@angular/common': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
    '@angular/router': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
    'blockly': { singleton: true, strictVersion: false, requiredVersion: '^10.0.0' }
  }
};

export default config;
```

**Lazy Route Configuration:**

```typescript
// apps/form-builder/src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'validations/visual',
    loadChildren: () => import('./blockly/blockly-editor.routes')
      .then(m => m.BLOCKLY_ROUTES),
    data: { preload: false } // Only load when user navigates here
  },
  {
    path: 'validations/code',
    loadComponent: () => import('./code-editor/code-editor.component')
      .then(m => m.CodeEditorComponent)
  }
];
```

```typescript
// apps/form-builder/src/app/blockly/blockly-editor.routes.ts
import { Routes } from '@angular/router';
import { BlocklyWorkspaceComponent } from './blockly-workspace.component';

export const BLOCKLY_ROUTES: Routes = [
  {
    path: '',
    component: BlocklyWorkspaceComponent,
    children: [
      {
        path: 'edit-checks',
        component: BlocklyWorkspaceComponent,
        data: { mode: 'editCheck' }
      },
      {
        path: 'workflows',
        component: BlocklyWorkspaceComponent,
        data: { mode: 'workflow' }
      }
    ]
  }
];
```

---

## 13. Testing Strategy

### 13.1 Unit Tests for Blocks

**Purpose:** Test individual block behavior and code generation

**Example: Testing Conditional Required Block:**

```typescript
// libs/form-builder/src/lib/blockly/blocks/conditional-required.spec.ts
import { describe, it, expect, beforeEach } from 'vitest';
import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import './conditional-required.block'; // Block definition

describe('ConditionalRequiredBlock', () => {
  let workspace: Blockly.Workspace;
  
  beforeEach(() => {
    workspace = new Blockly.Workspace();
  });
  
  it('should create block with correct fields', () => {
    const block = workspace.newBlock('validation_conditional_required');
    
    expect(block.getField('TRIGGER_FIELD')).toBeDefined();
    expect(block.getField('OPERATOR')).toBeDefined();
    expect(block.getField('TRIGGER_VALUE')).toBeDefined();
    expect(block.getField('ERROR_MESSAGE')).toBeDefined();
  });
  
  it('should generate correct TypeScript code', () => {
    const block = workspace.newBlock('validation_conditional_required');
    block.setFieldValue('aeSerious', 'TRIGGER_FIELD');
    block.setFieldValue('===', 'OPERATOR');
    block.setFieldValue('Y', 'TRIGGER_VALUE');
    block.setFieldValue('SAE Date is required', 'ERROR_MESSAGE');
    
    const code = javascriptGenerator.blockToCode(block);
    
    expect(code).toContain('getFieldValue("aeSerious")');
    expect(code).toContain('=== "Y"');
    expect(code).toContain('SAE Date is required');
  });
  
  it('should handle different operators', () => {
    const operators = ['===', '!==', '>', '<', '>=', '<='];
    
    operators.forEach(operator => {
      const block = workspace.newBlock('validation_conditional_required');
      block.setFieldValue('age', 'TRIGGER_FIELD');
      block.setFieldValue(operator, 'OPERATOR');
      block.setFieldValue('18', 'TRIGGER_VALUE');
      
      const code = javascriptGenerator.blockToCode(block);
      expect(code).toContain(operator);
    });
  });
  
  it('should escape special characters in strings', () => {
    const block = workspace.newBlock('validation_conditional_required');
    block.setFieldValue('notes', 'TRIGGER_FIELD');
    block.setFieldValue('===', 'OPERATOR');
    block.setFieldValue('Test "quoted" value', 'TRIGGER_VALUE');
    
    const code = javascriptGenerator.blockToCode(block);
    expect(code).toContain('\\"');
  });
});
```

**Example: Testing Workflow Action Block:**

```typescript
// libs/form-builder/src/lib/blockly/blocks/workflow-action-create-query.spec.ts
import { describe, it, expect, beforeEach } from 'vitest';
import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import './workflow-action-create-query.block';

describe('WorkflowActionCreateQueryBlock', () => {
  let workspace: Blockly.Workspace;
  
  beforeEach(() => {
    workspace = new Blockly.Workspace();
  });
  
  it('should generate query creation code', () => {
    const block = workspace.newBlock('workflow_action_create_query');
    block.setFieldValue('validation_error', 'QUERY_TYPE');
    block.setFieldValue('site_pi', 'ASSIGNEE_ROLE');
    block.setFieldValue('high', 'PRIORITY');
    block.setFieldValue('Please clarify BMI value', 'MESSAGE');
    block.setFieldValue(7, 'DUE_DAYS');
    
    const code = javascriptGenerator.blockToCode(block);
    
    expect(code).toContain('workflowContext.actions.createQuery');
    expect(code).toContain('queryType: \'validation_error\'');
    expect(code).toContain('assigneeRole: \'site_pi\'');
    expect(code).toContain('priority: \'high\'');
    expect(code).toContain('Please clarify BMI value');
    expect(code).toContain('7 * 24 * 60 * 60 * 1000'); // Due date calculation
  });
  
  it('should handle urgent priority queries', () => {
    const block = workspace.newBlock('workflow_action_create_query');
    block.setFieldValue('urgent', 'PRIORITY');
    block.setFieldValue(1, 'DUE_DAYS'); // 24 hours
    
    const code = javascriptGenerator.blockToCode(block);
    
    expect(code).toContain('priority: \'urgent\'');
    expect(code).toContain('1 * 24 * 60 * 60 * 1000');
  });
});
```

### 13.2 Integration Tests

**Purpose:** Test complete workflows with multiple blocks

**Example: Testing BMI Validation Workflow:**

```typescript
// libs/form-builder/src/lib/blockly/workflows/bmi-validation.integration.spec.ts
import { describe, it, expect, beforeEach } from 'vitest';
import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

describe('BMI Validation Workflow Integration', () => {
  let workspace: Blockly.Workspace;
  
  beforeEach(() => {
    workspace = new Blockly.Workspace();
  });
  
  it('should generate complete workflow with trigger, condition, and actions', () => {
    // Create trigger block
    const trigger = workspace.newBlock('workflow_trigger_form_event');
    trigger.setFieldValue('vital_signs', 'FORM_NAME');
    trigger.setFieldValue('saved', 'EVENT_TYPE');
    
    // Create decision block
    const decision = workspace.newBlock('workflow_decision_if_then_else');
    trigger.nextConnection?.connect(decision.previousConnection!);
    
    // Create condition: BMI validation fails
    const condition = workspace.newBlock('workflow_condition_validation_result');
    condition.setFieldValue('fails', 'RESULT');
    condition.setFieldValue('bmi', 'FIELD_NAME');
    decision.getInput('CONDITION')?.connection?.connect(condition.outputConnection!);
    
    // Create action: Create query
    const actionQuery = workspace.newBlock('workflow_action_create_query');
    actionQuery.setFieldValue('out_of_range', 'QUERY_TYPE');
    actionQuery.setFieldValue('site_coordinator', 'ASSIGNEE_ROLE');
    actionQuery.setFieldValue('normal', 'PRIORITY');
    decision.getInput('THEN')?.connection?.connect(actionQuery.previousConnection!);
    
    // Create action: Send notification
    const actionNotify = workspace.newBlock('workflow_action_send_notification');
    actionNotify.setFieldValue('site_coordinator', 'RECIPIENT');
    actionNotify.setFieldValue('TRUE', 'EMAIL');
    actionQuery.nextConnection?.connect(actionNotify.previousConnection!);
    
    // Generate code
    const code = javascriptGenerator.workspaceToCode(workspace);
    
    // Verify complete workflow structure
    expect(code).toContain('workflow_trigger_form_event');
    expect(code).toContain('vital_signs');
    expect(code).toContain('workflowContext.actions.createQuery');
    expect(code).toContain('workflowContext.actions.sendNotification');
    expect(code).toContain('site_coordinator');
  });
  
  it('should handle parallel actions correctly', () => {
    const trigger = workspace.newBlock('workflow_trigger_field_change');
    
    const parallel1 = workspace.newBlock('workflow_action_create_query');
    const parallel2 = workspace.newBlock('workflow_action_send_notification');
    
    // Both actions connected to trigger (parallel execution)
    trigger.nextConnection?.connect(parallel1.previousConnection!);
    // Note: In actual implementation, parallel would need special handling
    
    const code = javascriptGenerator.workspaceToCode(workspace);
    
    // Should generate Promise.all for parallel execution
    expect(code).toContain('createQuery');
    expect(code).toContain('sendNotification');
  });
});
```

### 13.3 End-to-End Tests

**Purpose:** Test complete user interaction with Blockly workspace

**Using Playwright:**

```typescript
// apps/form-builder-e2e/src/blockly-workspace.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Blockly Workspace', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/form-builder/validations/visual');
    await page.waitForSelector('.blockly-workspace');
  });
  
  test('should load toolbox categories', async ({ page }) => {
    // Verify toolbox is visible
    const toolbox = page.locator('.blocklyToolboxDiv');
    await expect(toolbox).toBeVisible();
    
    // Verify categories
    await expect(page.locator('text=Field Validation')).toBeVisible();
    await expect(page.locator('text=Medical Calculations')).toBeVisible();
    await expect(page.locator('text=Logic')).toBeVisible();
  });
  
  test('should drag and drop block from toolbox', async ({ page }) => {
    // Click category to expand
    await page.click('text=Field Validation');
    
    // Drag "Conditional Required" block to workspace
    const block = page.locator('[data-id="validation_conditional_required"]');
    const workspace = page.locator('.blocklyWorkspace');
    
    await block.dragTo(workspace, {
      targetPosition: { x: 200, y: 200 }
    });
    
    // Verify block appears in workspace
    await expect(page.locator('.blocklyDraggable')).toHaveCount(1);
  });
  
  test('should configure block fields', async ({ page }) => {
    // Add block to workspace (helper method)
    await addBlock(page, 'validation_conditional_required', { x: 200, y: 200 });
    
    // Click on trigger field dropdown
    await page.click('[data-field="TRIGGER_FIELD"]');
    await page.click('text=AE Serious');
    
    // Set operator
    await page.click('[data-field="OPERATOR"]');
    await page.click('text===');
    
    // Set trigger value
    await page.fill('[data-field="TRIGGER_VALUE"]', 'Y');
    
    // Set error message
    await page.fill('[data-field="ERROR_MESSAGE"]', 'SAE Date is required');
    
    // Verify generated code updates
    const codePreview = page.locator('.blockly-sidebar pre code');
    await expect(codePreview).toContainText('aeSerious');
    await expect(codePreview).toContainText('SAE Date is required');
  });
  
  test('should connect multiple blocks', async ({ page }) => {
    // Add BMI calculation block
    await addBlock(page, 'medical_bmi_calculation', { x: 200, y: 200 });
    
    // Add range validation block below it
    await addBlock(page, 'validation_unit_aware_range', { x: 200, y: 300 });
    
    // Drag second block to connect to first
    const block2 = page.locator('.blocklyDraggable').nth(1);
    await block2.dragTo(page.locator('.blocklyDraggable').nth(0), {
      targetPosition: { x: 0, y: 50 } // Below first block
    });
    
    // Verify blocks are connected (check for puzzle tab connection)
    const connectedBlocks = page.locator('.blocklyConnectedBlocks');
    await expect(connectedBlocks).toHaveCount(1);
  });
  
  test('should save workspace and generate code', async ({ page }) => {
    // Add and configure blocks
    await addBlock(page, 'validation_conditional_required', { x: 200, y: 200 });
    
    // Click save button
    await page.click('button:has-text("Save")');
    
    // Verify API call
    await page.waitForResponse(resp =>
      resp.url().includes('/api/blockly/workspaces') &&
      resp.request().method() === 'POST'
    );
    
    // Verify success message
    await expect(page.locator('text=Workspace saved successfully')).toBeVisible();
  });
  
  test('should undo/redo changes', async ({ page }) => {
    // Add block
    await addBlock(page, 'medical_bmi_calculation', { x: 200, y: 200 });
    await expect(page.locator('.blocklyDraggable')).toHaveCount(1);
    
    // Click undo
    await page.click('button:has-text("Undo")');
    await expect(page.locator('.blocklyDraggable')).toHaveCount(0);
    
    // Click redo
    await page.click('button:has-text("Redo")');
    await expect(page.locator('.blocklyDraggable')).toHaveCount(1);
  });
  
  test('should clear workspace with confirmation', async ({ page }) => {
    // Add multiple blocks
    await addBlock(page, 'medical_bmi_calculation', { x: 200, y: 200 });
    await addBlock(page, 'validation_unit_aware_range', { x: 200, y: 300 });
    
    // Click clear (triggers confirmation dialog)
    page.on('dialog', dialog => dialog.accept());
    await page.click('button:has-text("Clear")');
    
    // Verify workspace is empty
    await expect(page.locator('.blocklyDraggable')).toHaveCount(0);
  });
});

// Helper function
async function addBlock(
  page: any,
  blockType: string,
  position: { x: number; y: number }
): Promise<void> {
  // Implementation depends on Blockly's API
  await page.evaluate(
    ({ type, pos }) => {
      const workspace = (window as any).Blockly.getMainWorkspace();
      const block = workspace.newBlock(type);
      block.moveBy(pos.x, pos.y);
      block.initSvg();
      block.render();
    },
    { type: blockType, pos: position }
  );
}
```

### 13.4 Test Coverage Goals

| Component | Target Coverage | Priority |
|-----------|----------------|----------|
| Block Definitions | 95%+ | Critical |
| Code Generators | 90%+ | Critical |
| Angular Components | 80%+ | High |
| Service Layer | 85%+ | High |
| Workflow Logic | 90%+ | Critical |
| UI Interactions | 70%+ | Medium |

---

## 14. Deployment & Performance

### 14.1 Bundle Size Optimization

**Problem:** Blockly library is ~500KB minified

**Solution: Lazy Loading with Module Federation**

```typescript
// apps/form-builder/webpack.config.ts
import { withModuleFederation } from '@nx/angular/module-federation';
import config from './module-federation.config';

export default withModuleFederation({
  ...config,
  
  // Optimize Blockly bundle
  optimization: {
    splitChunks: {
      cacheGroups: {
        blockly: {
          test: /[\\/]node_modules[\\/]blockly/,
          name: 'blockly',
          chunks: 'async',
          priority: 20,
          reuseExistingChunk: true
        }
      }
    }
  }
});
```

**Bundle Analysis:**

```bash
# Analyze bundle size
nx build form-builder --configuration=production --stats-json
npx webpack-bundle-analyzer dist/apps/form-builder/stats.json
```

**Expected Bundle Sizes:**

| Bundle | Size (gzip) | Load Time (3G) |
|--------|-------------|----------------|
| Main (without Blockly) | 250 KB | < 2s |
| Blockly chunk | 150 KB | < 1s |
| Total (with Blockly) | 400 KB | < 3s |

### 14.2 CDN Strategy

**Purpose:** Serve Blockly from CDN for better caching and performance

**CDN Configuration:**

```html
<!-- index.html -->
<head>
  <!-- Preconnect to CDN -->
  <link rel="preconnect" href="https://cdn.example.com" />
  <link rel="dns-prefetch" href="https://cdn.example.com" />
  
  <!-- Preload Blockly when user likely to use it -->
  <link
    rel="preload"
    href="https://cdn.example.com/blockly/12.5.1/blockly.min.js"
    as="script"
    crossorigin="anonymous"
  />
</head>
```

```typescript
// Dynamic CDN loading
export async function loadBlocklyFromCDN(): Promise<typeof Blockly> {
  const script = document.createElement('script');
  script.src = 'https://cdn.example.com/blockly/12.5.1/blockly.min.js';
  script.crossOrigin = 'anonymous';
  script.integrity = 'sha384-...'; // Subresource integrity
  
  return new Promise((resolve, reject) => {
    script.onload = () => resolve((window as any).Blockly);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}
```

### 14.3 Performance Optimization

**1. Workspace Serialization (Debounce):**

```typescript
// Debounce workspace changes to avoid excessive API calls
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

this.workspace.addChangeListener(
  debounce(() => {
    this.saveWorkspaceDebounced();
  }, 1000) // Save 1 second after last change
);
```

**2. Code Generation (Web Worker):**

```typescript
// Offload code generation to Web Worker
// libs/form-builder/src/lib/workers/code-generator.worker.ts
addEventListener('message', (event) => {
  const { workspaceJson, target } = event.data;
  
  // Generate code (CPU-intensive)
  const code = generateCode(workspaceJson, target);
  
  postMessage({ code });
});
```

```typescript
// Use worker in component
private codeGeneratorWorker = new Worker(
  new URL('./workers/code-generator.worker', import.meta.url)
);

generateCodeAsync(workspaceJson: string, target: 'typescript' | 'csharp'): Promise<string> {
  return new Promise((resolve) => {
    this.codeGeneratorWorker.onmessage = (event) => {
      resolve(event.data.code);
    };
    
    this.codeGeneratorWorker.postMessage({ workspaceJson, target });
  });
}
```

**3. Render Optimization:**

```typescript
// Enable Blockly's renderer optimizations
const workspace = Blockly.inject(element, {
  renderer: 'zelos', // Modern renderer with better performance
  
  // Disable unnecessary features for large workspaces
  disable: false,
  
  // Optimize drag performance
  moveOptions: {
    drag: true,
    scrollbars: {
      horizontal: true,
      vertical: true
    },
    wheel: true
  },
  
  // Render in batches for large workspaces
  bumpNeighbours: false // Disable auto-arrange on drop
});
```

### 14.4 Deployment Checklist

**Pre-Deployment:**

- [ ] Run full test suite (`nx test form-builder`)
- [ ] Check bundle size (`nx build --configuration=production --stats-json`)
- [ ] Verify lazy loading works (`nx serve` → navigate to visual editor)
- [ ] Test with real clinical data (PHI scrubbed)
- [ ] Validate generated code (TypeScript + C#)
- [ ] Run accessibility audit (`nx run form-builder:lighthouse`)
- [ ] Check browser compatibility (Chrome, Firefox, Edge, Safari)
- [ ] Verify CSP headers allow Blockly inline scripts
- [ ] Test with slow network (3G throttling)

**Deployment:**

```bash
# Build production bundle
nx build form-builder --configuration=production

# Deploy to staging
nx deploy form-builder --target=staging

# Run E2E tests against staging
nx e2e form-builder-e2e --base-url=https://staging.example.com

# Deploy to production
nx deploy form-builder --target=production

# Monitor errors (Sentry, DataDog, etc.)
```

**Post-Deployment:**

- [ ] Monitor bundle loading metrics (Lighthouse CI, WebPageTest)
- [ ] Check error rates in production (Sentry)
- [ ] Verify CDN cache hit rate
- [ ] Monitor API response times for code generation
- [ ] Collect user feedback (embedded feedback widget)
- [ ] Review analytics (% users using visual vs. code editor)

---

## Appendix A: Complete Block Catalog

### Edit Check Blocks (25 blocks)

| Block ID | Category | Purpose | Complexity |
|----------|----------|---------|------------|
| `validation_conditional_required` | Field Validation | Require field if condition true | Medium |
| `validation_unit_aware_range` | Field Validation | Range check with unit conversion | High |
| `validation_date_ordering` | Field Validation | Ensure date1 ≤ date2 | Low |
| `validation_cross_form` | Field Validation | Validate across multiple forms | High |
| `validation_regex_pattern` | Field Validation | Custom regex validation | Medium |
| `medical_bmi_calculation` | Medical Calculations | Calculate BMI from height/weight | Low |
| `medical_egfr_calculation` | Medical Calculations | Calculate eGFR (CKD-EPI 2021) | High |
| `medical_bsa_calculation` | Medical Calculations | Calculate body surface area | Medium |
| `medical_ckd_stage` | Medical Calculations | Determine CKD stage from eGFR | Low |
| `medical_qrisk3` | Medical Calculations | QRISK3 cardiovascular risk score | Very High |
| `logic_and` | Logic | Boolean AND operation | Low |
| `logic_or` | Logic | Boolean OR operation | Low |
| `logic_not` | Logic | Boolean NOT operation | Low |
| `logic_compare` | Logic | Comparison (===, !==, >, <, >=, <=) | Low |
| `math_arithmetic` | Math | Basic arithmetic (+, -, *, /, %) | Low |
| `math_round` | Math | Round, floor, ceil, abs | Low |
| `date_diff` | Date/Time | Calculate date difference | Medium |
| `date_add` | Date/Time | Add days/months to date | Medium |
| `date_format` | Date/Time | Format date for display | Low |
| `text_concat` | Text | Concatenate strings | Low |
| `text_contains` | Text | Check if string contains substring | Low |
| `text_uppercase` | Text | Convert to uppercase | Low |
| `text_trim` | Text | Remove whitespace | Low |
| `field_get_value` | Form Fields | Get value from field | Low |
| `field_set_value` | Form Fields | Set value to field | Low |

### Workflow Blocks (20 blocks)

| Block ID | Category | Purpose | Complexity |
|----------|----------|---------|------------|
| `workflow_trigger_form_event` | Triggers | Form saved/submitted/locked | Low |
| `workflow_trigger_field_change` | Triggers | Field value changed | Low |
| `workflow_trigger_validation_result` | Triggers | Validation passed/failed | Medium |
| `workflow_trigger_time_based` | Triggers | Scheduled execution | Medium |
| `workflow_trigger_external_event` | Triggers | Webhook/API event | High |
| `workflow_action_create_query` | Actions | Create query and assign | Medium |
| `workflow_action_send_notification` | Actions | Send email/SMS notification | Medium |
| `workflow_action_update_form_status` | Actions | Lock/unlock/sign form | Low |
| `workflow_action_call_api` | Actions | Call external REST API | High |
| `workflow_action_schedule_task` | Actions | Schedule follow-up task | Medium |
| `workflow_action_create_form` | Actions | Auto-create new form | High |
| `workflow_action_audit_log` | Actions | Write to audit trail | Low |
| `workflow_decision_if_then_else` | Decisions | Conditional branching | Low |
| `workflow_decision_switch_case` | Decisions | Multi-way branching | Medium |
| `workflow_loop_for_each` | Decisions | Iterate over collection | High |
| `workflow_integration_ctms` | Integrations | Sync to CTMS | Very High |
| `workflow_integration_etmf` | Integrations | Upload to eTMF | Very High |
| `workflow_integration_safety_db` | Integrations | Report to safety database | Very High |
| `workflow_integration_ixrs` | Integrations | Randomization system | Very High |
| `workflow_parallel_actions` | Flow Control | Execute actions in parallel | High |

---

## Appendix B: Code Generation Templates

**TypeScript Validator Template:**

```typescript
/**
 * Auto-generated validation function from Blockly workspace
 * Generated: {{timestamp}}
 * Workspace ID: {{workspaceId}}
 */
export interface ValidationContext {
  value: any;
  formData: Record<string, any>;
  subjectData: Record<string, any>;
  studyConfig: Record<string, any>;
}

export interface ValidationResult {
  status: 'pass' | 'fail' | 'warn';
  message?: string;
  severity?: 'error' | 'warning' | 'info';
}

export async function validate{{validatorName}}(
  context: ValidationContext
): Promise<ValidationResult> {
  try {
    {{generatedCode}}
    
    return { status: 'pass' };
  } catch (error) {
    console.error('Validation error:', error);
    return {
      status: 'fail',
      message: 'Unexpected validation error',
      severity: 'error'
    };
  }
}

// Auto-generated unit test
describe('validate{{validatorName}}', () => {
  it('should pass for valid data', async () => {
    const result = await validate{{validatorName}}({
      value: {{testValue}},
      formData: {{testFormData}},
      subjectData: {},
      studyConfig: {}
    });
    
    expect(result.status).toBe('pass');
  });
});
```

**C# Validator Template:**

```csharp
// Auto-generated C# validator from Blockly workspace
// Generated: {{timestamp}}
// Workspace ID: {{workspaceId}}

using FormBuilder.Validation;
using System;
using System.Threading.Tasks;

namespace FormBuilder.Validators.Custom
{
    /// <summary>
    /// {{validatorDescription}}
    /// </summary>
    public class {{validatorClassName}} : IValidator
    {
        public string CheckId => "{{checkId}}";
        public string FieldName => "{{fieldName}}";
        public ValidationType Type => ValidationType.{{validationType}};
        
        public async Task<ValidationResult> ValidateAsync(
            ValidationContext context)
        {
            try
            {
                var value = context.Value;
                var formData = context.FormData;
                
                {{generatedCode}}
                
                return ValidationResult.Pass();
            }
            catch (Exception ex)
            {
                return ValidationResult.Fail(
                    $"Validation error: {ex.Message}");
            }
        }
    }
    
    // Auto-generated unit test
    [TestFixture]
    public class {{validatorClassName}}Tests
    {
        [Test]
        public async Task ShouldPassForValidData()
        {
            var validator = new {{validatorClassName}}();
            var context = new ValidationContext
            {
                Value = {{testValue}},
                FormData = new Dictionary<string, object>
                {
                    {{testFormData}}
                }
            };
            
            var result = await validator.ValidateAsync(context);
            
            Assert.That(result.Status, Is.EqualTo(ValidationStatus.Pass));
        }
    }
}
```

---

## Appendix C: Migration from Manual Coding

**Step-by-Step Migration Guide:**

**1. Identify existing validators:**

```bash
# Find all manual validator files
find libs/form-builder/validators -name "*.ts" | wc -l
```

**2. Analyze validator complexity:**

```typescript
// Simple validators (candidates for visual programming)
export function validateAgeRange(value: number): ValidationResult {
  if (value < 18 || value > 65) {
    return { status: 'fail', message: 'Age must be 18-65' };
  }
  return { status: 'pass' };
}

// Complex validators (keep as code)
export function validateQRISK3(data: QRISK3Input): ValidationResult {
  // 200+ lines of complex calculations
  // Better kept as code
}
```

**3. Create Blockly equivalents:**

| Manual Validator | Blockly Blocks Needed | Complexity |
|------------------|----------------------|------------|
| `validateAgeRange` | 1 range block | Low |
| `validateBMI` | 2 blocks (calc + range) | Medium |
| `validateConditionalRequired` | 1 conditional required block | Low |
| `validateCrossForm` | 3+ blocks | High |

**4. Migration Priority:**

1. **Phase 1 (Weeks 1-2):** Simple range/required validators (30 validators)
2. **Phase 2 (Weeks 3-4):** Medical calculations (BMI, BSA, eGFR) (10 validators)
3. **Phase 3 (Weeks 5-6):** Conditional logic validators (20 validators)
4. **Phase 4 (Weeks 7-8):** Complex cross-form validators (15 validators)

**5. Parallel operation:**

```typescript
// Run both manual and Blockly validators during transition
export async function validateField(
  fieldName: string,
  value: any,
  context: ValidationContext
): Promise<ValidationResult> {
  // Try Blockly validator first
  const blocklyValidator = await loadBlocklyValidator(fieldName);
  if (blocklyValidator) {
    return await blocklyValidator.validate(value, context);
  }
  
  // Fallback to manual validator
  const manualValidator = await loadManualValidator(fieldName);
  return await manualValidator.validate(value, context);
}
```

---

## Appendix D: Performance Benchmarks

**Code Generation Performance:**

| Workspace Complexity | TypeScript Generation | C# Generation | Total |
|---------------------|----------------------|---------------|-------|
| Simple (1-5 blocks) | 10-20 ms | 15-30 ms | ~35 ms |
| Medium (6-15 blocks) | 30-50 ms | 50-80 ms | ~100 ms |
| Complex (16-30 blocks) | 80-150 ms | 120-200 ms | ~300 ms |
| Very Complex (31+ blocks) | 200-400 ms | 300-600 ms | ~800 ms |

**Workspace Loading Performance:**

| Workspace Size | Parse JSON | Render Blocks | Total Load Time |
|---------------|-----------|---------------|----------------|
| Small (<10 blocks) | <5 ms | 20-40 ms | ~50 ms |
| Medium (10-30 blocks) | 5-15 ms | 60-120 ms | ~150 ms |
| Large (30-50 blocks) | 15-30 ms | 150-300 ms | ~350 ms |
| Very Large (50+ blocks) | 30-60 ms | 300-600 ms | ~700 ms |

**Runtime Validation Performance:**

| Validator Type | Execution Time | Memory |
|---------------|----------------|--------|
| Simple range check | <0.1 ms | ~1 KB |
| BMI calculation | 0.2-0.5 ms | ~2 KB |
| eGFR calculation | 0.5-1 ms | ~5 KB |
| Cross-form validation | 2-5 ms | ~10 KB |
| Complex workflow | 10-50 ms | ~50 KB |

---

## Appendix E: Accessibility Considerations

**WCAG 2.1 AA Compliance:**

**1. Keyboard Navigation:**

```typescript
// Enable full keyboard control of Blockly workspace
workspace.options.keyMap = {
  'ctrl+c': 'copy',
  'ctrl+v': 'paste',
  'ctrl+x': 'cut',
  'ctrl+z': 'undo',
  'ctrl+shift+z': 'redo',
  'delete': 'delete',
  'escape': 'deselect'
};

// Tab through blocks
workspace.enableKeyboardAccessibility = true;
```

**2. Screen Reader Support:**

```html
<!-- Add ARIA labels to blocks -->
<block type="validation_conditional_required"
       aria-label="Conditional required validation block"
       aria-description="Requires a field when another field meets a condition">
  <!-- Block fields -->
</block>
```

**3. High Contrast Mode:**

```typescript
// Detect and apply high contrast theme
if (window.matchMedia('(prefers-contrast: high)').matches) {
  Blockly.Theme.defineTheme('highContrast', {
    blockStyles: {
      logic_blocks: { colourPrimary: '#000000', colourSecondary: '#FFFFFF' },
      math_blocks: { colourPrimary: '#0000FF', colourSecondary: '#FFFFFF' }
    },
    componentStyles: {
      workspaceBackgroundColour: '#FFFFFF',
      toolboxBackgroundColour: '#EEEEEE'
    }
  });
}
```

**4. Focus Indicators:**

```css
/* Visible focus indicators for keyboard users */
.blocklySelected {
  outline: 3px solid #0066CC !important;
  outline-offset: 2px;
}

.blocklyDraggable:focus {
  box-shadow: 0 0 0 3px #0066CC, 0 0 0 6px rgba(0, 102, 204, 0.3);
}
```

**5. Text Alternatives:**

```typescript
// Provide text description of visual workflow
export function generateWorkflowDescription(workspaceJson: string): string {
  const workspace = JSON.parse(workspaceJson);
  const blocks = workspace.blocks.blocks;
  
  let description = 'Workflow: ';
  
  blocks.forEach((block, index) => {
    description += `${index + 1}. ${getBlockDescription(block)}. `;
  });
  
  return description;
}

// Example output:
// "Workflow: 1. When form Vital Signs is saved. 2. If BMI validation fails. 
//  3. Create query assigned to Site Coordinator. 4. Send email notification."
```

---

**END OF DOCUMENTATION**

---

## Summary

This documentation provides a comprehensive guide to implementing Google Blockly for visual programming in clinical trial EDC platforms. Key takeaways:

✅ **Decision Rationale:** Blockly chosen for healthcare-friendly UI, extensive customization, and dual-target code generation  
✅ **Architecture:** Module Federation lazy-loading, Angular integration, TypeScript + C# generators  
✅ **Custom Blocks:** 25 edit check blocks + 20 workflow blocks tailored to clinical data management  
✅ **Code Generation:** Template-based generators with optimization, auto-tests, and audit compliance  
✅ **Workflows:** Complete examples for auto-queries, SAE notifications, and visit compliance  
✅ **Implementation:** Angular component, service layer, state management, and testing strategy  
✅ **Performance:** Bundle optimization, CDN strategy, Web Workers, and benchmarks  
✅ **Deployment:** Production checklist, monitoring, and accessibility compliance  

**Next Steps:**

1. Review with stakeholders (clinical operations, IT, QA)
2. Prototype BlocklyWorkspace component with 5-10 core blocks
3. User testing with study designers (non-programmers)
4. Iterate based on feedback
5. Gradual rollout starting with simple validators
6. Monitor adoption metrics and performance

**Related Documentation:**

- [Form Builder Custom Programming Implementation](form-builder-custom-programming-implementation.md)
- [Form Builder Server-Side Validator Library](form-builder-server-side-validator-library.md)
- [Form Builder Custom Validators](form-builder-custom-validators.md)
- [Form Renderer: Validation Loading & Execution](form-renderer-validation-loading.md) ⭐ NEW

---

**Document Version:** 1.0  
**Last Updated:** May 30, 2026  
**Author:** Clinical EDC Platform Team  
**Status:** ✅ Complete

### 15.1 Overview: Validation Loading Architecture

**Problem Statement:**

A clinical trial form may have multiple types of validations:
- **20 System-defined validations** (e.g., required, range, date format)
- **20 Custom validators** (code-based TypeScript/C# classes)
- **10 Custom edit checks** (Blockly visual programming)
- **30 System-defined edit check mappings** (configuration-based)

**Total: 80 validations** that need to be loaded, cached, and executed efficiently without bloating the form-renderer bundle.

**Key Requirements:**

1. ✅ **Lazy Loading:** Don't load all validators upfront
2. ✅ **Dependency Resolution:** Load only validators for current form
3. ✅ **Execution Order:** System → Custom → Edit Checks
4. ✅ **Caching:** Avoid re-loading validators for same form
5. ✅ **Bundle Size:** Keep form-renderer < 300KB
6. ✅ **Performance:** Validate all 80 rules in < 50ms

---

### 15.2 Form Metadata Structure

**Purpose:** Define all validation requirements for a form in JSON configuration

**Form Configuration (from Server):**

```typescript
// libs/form-renderer/src/lib/models/form-config.interface.ts
export interface FormConfiguration {
  formId: string;
  formName: string;
  version: string;
  
  fields: FieldConfiguration[];
  
  // Validation requirements
  validations: ValidationRequirements;
}

export interface FieldConfiguration {
  fieldName: string;
  fieldType: 'text' | 'number' | 'date' | 'dropdown' | 'checkbox';
  label: string;
  required: boolean;
  
  // Field-level validations
  validations?: FieldValidationConfig[];
}

export interface ValidationRequirements {
  // System-defined validators (built-in, always available)
  systemValidations: SystemValidationConfig[];
  
  // Custom code-based validators (need to be loaded)
  customValidators: CustomValidatorConfig[];
  
  // Visual programming edit checks (Blockly-generated, need to be loaded)
  customEditChecks: CustomEditCheckConfig[];
  
  // System-defined edit check mappings (configuration-only)
  editCheckMappings: EditCheckMappingConfig[];
}

// 1. System-defined validation config
export interface SystemValidationConfig {
  validatorId: string; // e.g., "required", "range", "dateFormat"
  fieldName: string;
  params?: Record<string, any>; // e.g., { min: 0, max: 100 }
  severity: 'error' | 'warning' | 'info';
}

// 2. Custom validator config
export interface CustomValidatorConfig {
  validatorId: string; // e.g., "custom_bmi_validator"
  validatorClass: string; // e.g., "BMIValidator"
  fieldName: string;
  checkId: string;
  severity: 'error' | 'warning' | 'info';
  
  // Module Federation remote URL
  remoteEntry?: string; // e.g., "https://cdn.example.com/validators/bmi-validator.js"
  
  // Or inline code (for small validators)
  inlineCode?: string;
}

// 3. Custom edit check config (Blockly-generated)
export interface CustomEditCheckConfig {
  editCheckId: string; // e.g., "ec_conditional_bmi_required"
  editCheckName: string; // e.g., "Conditional BMI Required"
  fieldName: string;
  severity: 'error' | 'warning' | 'info';
  
  // Blockly workspace JSON
  workspaceJson: string;
  
  // Pre-generated code (optional, for performance)
  generatedCode?: {
    typescript: string;
    csharp: string;
  };
  
  // CDN URL for generated module (Module Federation)
  remoteEntry?: string;
}

// 4. System-defined edit check mapping config
export interface EditCheckMappingConfig {
  editCheckId: string; // e.g., "ec_range_weight"
  editCheckType: 'range' | 'required' | 'dateOrder' | 'crossForm';
  fieldName: string;
  params: Record<string, any>;
  severity: 'error' | 'warning' | 'info';
}
```

**Example Form Configuration (JSON from Server):**

```json
{
  "formId": "vital_signs_v1",
  "formName": "Vital Signs",
  "version": "1.0.0",
  
  "fields": [
    {
      "fieldName": "weight",
      "fieldType": "number",
      "label": "Weight (kg)",
      "required": true
    },
    {
      "fieldName": "height",
      "fieldType": "number",
      "label": "Height (cm)",
      "required": true
    },
    {
      "fieldName": "bmi",
      "fieldType": "number",
      "label": "BMI",
      "required": false
    }
  ],
  
  "validations": {
    "systemValidations": [
      {
        "validatorId": "required",
        "fieldName": "weight",
        "severity": "error"
      },
      {
        "validatorId": "range",
        "fieldName": "weight",
        "params": { "min": 30, "max": 300 },
        "severity": "error"
      },
      {
        "validatorId": "required",
        "fieldName": "height",
        "severity": "error"
      }
    ],
    
    "customValidators": [
      {
        "validatorId": "custom_bmi_calculator",
        "validatorClass": "BMICalculatorValidator",
        "fieldName": "bmi",
        "checkId": "bmi-calculation",
        "severity": "error",
        "remoteEntry": "https://cdn.example.com/validators/bmi-calculator-v1.js"
      }
    ],
    
    "customEditChecks": [
      {
        "editCheckId": "ec_conditional_bmi_required",
        "editCheckName": "BMI Required if Weight > 200kg",
        "fieldName": "bmi",
        "severity": "warning",
        "workspaceJson": "{\"blocks\":{...}}",
        "generatedCode": {
          "typescript": "export async function validate(context) { ... }",
          "csharp": "public class BMIConditionalValidator { ... }"
        },
        "remoteEntry": "https://cdn.example.com/validators/ec-conditional-bmi-v1.js"
      }
    ],
    
    "editCheckMappings": [
      {
        "editCheckId": "ec_range_bmi",
        "editCheckType": "range",
        "fieldName": "bmi",
        "params": {
          "min": 12,
          "max": 60,
          "units": "kg/m²"
        },
        "severity": "error"
      }
    ]
  }
}
```

---

### 15.3 Validation Registry Service

**Purpose:** Central registry for loading, caching, and resolving validators

```typescript
// libs/form-renderer/src/lib/services/validation-registry.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';

export interface IValidator {
  validatorId: string;
  validate(value: any, context: ValidationContext): Promise<ValidationResult>;
}

export interface ValidationContext {
  fieldName: string;
  value: any;
  formData: Record<string, any>;
  subjectData?: Record<string, any>;
  studyConfig?: Record<string, any>;
}

export interface ValidationResult {
  status: 'pass' | 'fail' | 'warn';
  message?: string;
  severity?: 'error' | 'warning' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ValidationRegistryService {
  private readonly API_BASE = '/api/validations';
  
  // In-memory cache for loaded validators
  private validatorCache = new Map<string, IValidator>();
  
  // Module cache (Module Federation remote modules)
  private moduleCache = new Map<string, any>();
  
  // System validators (always available, no loading needed)
  private systemValidators = new Map<string, IValidator>();
  
  constructor(private http: HttpClient) {
    this.initializeSystemValidators();
  }
  
  /**
   * Initialize built-in system validators
   */
  private initializeSystemValidators(): void {
    // Register all system validators
    this.systemValidators.set('required', new RequiredValidator());
    this.systemValidators.set('range', new RangeValidator());
    this.systemValidators.set('dateFormat', new DateFormatValidator());
    this.systemValidators.set('email', new EmailValidator());
    this.systemValidators.set('phone', new PhoneValidator());
    // ... 15 more system validators
  }
  
  /**
   * Load all validators required for a form
   * 
   * Example: Form has 20 system + 20 custom + 10 edit checks + 30 mappings = 80 validators
   */
  async loadValidatorsForForm(
    formConfig: FormConfiguration
  ): Promise<Map<string, IValidator[]>> {
    const { validations } = formConfig;
    
    console.log(`[ValidationRegistry] Loading validators for form: ${formConfig.formId}`);
    console.log(`  System validations: ${validations.systemValidations.length}`);
    console.log(`  Custom validators: ${validations.customValidators.length}`);
    console.log(`  Custom edit checks: ${validations.customEditChecks.length}`);
    console.log(`  Edit check mappings: ${validations.editCheckMappings.length}`);
    
    const startTime = performance.now();
    
    // Load all validators in parallel
    const [
      systemValidators,
      customValidators,
      editCheckValidators,
      mappingValidators
    ] = await Promise.all([
      this.loadSystemValidators(validations.systemValidations),
      this.loadCustomValidators(validations.customValidators),
      this.loadCustomEditChecks(validations.customEditChecks),
      this.loadEditCheckMappings(validations.editCheckMappings)
    ]);
    
    const loadTime = performance.now() - startTime;
    console.log(`[ValidationRegistry] All validators loaded in ${loadTime.toFixed(2)}ms`);
    
    // Group validators by field name
    const validatorsByField = new Map<string, IValidator[]>();
    
    const allValidators = [
      ...systemValidators,
      ...customValidators,
      ...editCheckValidators,
      ...mappingValidators
    ];
    
    allValidators.forEach(validator => {
      const fieldName = (validator as any).fieldName || 'global';
      
      if (!validatorsByField.has(fieldName)) {
        validatorsByField.set(fieldName, []);
      }
      
      validatorsByField.get(fieldName)!.push(validator);
    });
    
    return validatorsByField;
  }
  
  /**
   * 1. Load system-defined validators (instant, already in memory)
   */
  private async loadSystemValidators(
    configs: SystemValidationConfig[]
  ): Promise<IValidator[]> {
    console.log(`[ValidationRegistry] Loading ${configs.length} system validators (instant)`);
    
    return configs.map(config => {
      const validator = this.systemValidators.get(config.validatorId);
      
      if (!validator) {
        throw new Error(`System validator not found: ${config.validatorId}`);
      }
      
      // Create configured instance
      return new ConfiguredValidator(
        validator,
        config.fieldName,
        config.params,
        config.severity
      );
    });
  }
  
  /**
   * 2. Load custom code-based validators (dynamic import via Module Federation)
   */
  private async loadCustomValidators(
    configs: CustomValidatorConfig[]
  ): Promise<IValidator[]> {
    console.log(`[ValidationRegistry] Loading ${configs.length} custom validators`);
    
    if (configs.length === 0) {
      return [];
    }
    
    // Load all custom validators in parallel
    const validatorPromises = configs.map(config =>
      this.loadCustomValidator(config)
    );
    
    return Promise.all(validatorPromises);
  }
  
  private async loadCustomValidator(
    config: CustomValidatorConfig
  ): Promise<IValidator> {
    // Check cache first
    if (this.validatorCache.has(config.validatorId)) {
      console.log(`  ✓ ${config.validatorId} (cached)`);
      return this.validatorCache.get(config.validatorId)!;
    }
    
    let validator: IValidator;
    
    if (config.inlineCode) {
      // Inline code: evaluate directly (fast, but security risk)
      validator = this.evaluateInlineValidator(config.inlineCode, config.validatorClass);
    } else if (config.remoteEntry) {
      // Module Federation: load from CDN (slower, but secure)
      validator = await this.loadRemoteValidator(config.remoteEntry, config.validatorClass);
    } else {
      throw new Error(`No code source for custom validator: ${config.validatorId}`);
    }
    
    // Cache for future use
    this.validatorCache.set(config.validatorId, validator);
    console.log(`  ✓ ${config.validatorId} (loaded from ${config.remoteEntry ? 'CDN' : 'inline'})`);
    
    return validator;
  }
  
  private async loadRemoteValidator(
    remoteEntry: string,
    validatorClass: string
  ): Promise<IValidator> {
    // Check module cache
    if (this.moduleCache.has(remoteEntry)) {
      const module = this.moduleCache.get(remoteEntry);
      return new module[validatorClass]();
    }
    
    // Dynamic import via Module Federation
    // Note: Webpack will handle this at build time
    const module = await import(/* webpackIgnore: true */ remoteEntry);
    
    // Cache module
    this.moduleCache.set(remoteEntry, module);
    
    // Instantiate validator class
    return new module[validatorClass]();
  }
  
  private evaluateInlineValidator(
    code: string,
    validatorClass: string
  ): IValidator {
    // WARNING: Eval is dangerous! Only use for trusted code
    // In production, use CSP and code signing
    const module = new Function(`return ${code}`)();
    return new module[validatorClass]();
  }
  
  /**
   * 3. Load custom edit checks (Blockly-generated validators)
   */
  private async loadCustomEditChecks(
    configs: CustomEditCheckConfig[]
  ): Promise<IValidator[]> {
    console.log(`[ValidationRegistry] Loading ${configs.length} custom edit checks (Blockly)`);
    
    if (configs.length === 0) {
      return [];
    }
    
    // Load all edit checks in parallel
    const editCheckPromises = configs.map(config =>
      this.loadCustomEditCheck(config)
    );
    
    return Promise.all(editCheckPromises);
  }
  
  private async loadCustomEditCheck(
    config: CustomEditCheckConfig
  ): Promise<IValidator> {
    // Check cache first
    if (this.validatorCache.has(config.editCheckId)) {
      console.log(`  ✓ ${config.editCheckId} (cached)`);
      return this.validatorCache.get(config.editCheckId)!;
    }
    
    let validator: IValidator;
    
    if (config.generatedCode?.typescript) {
      // Pre-generated code available (fast path)
      validator = this.evaluateGeneratedCode(
        config.generatedCode.typescript,
        config.editCheckId
      );
    } else if (config.remoteEntry) {
      // Load from CDN (Module Federation)
      validator = await this.loadRemoteValidator(
        config.remoteEntry,
        `EditCheck_${config.editCheckId}`
      );
    } else if (config.workspaceJson) {
      // Generate code on-the-fly from Blockly workspace (slowest path)
      validator = await this.generateValidatorFromWorkspace(
        config.workspaceJson,
        config.editCheckId
      );
    } else {
      throw new Error(`No code source for edit check: ${config.editCheckId}`);
    }
    
    // Cache for future use
    this.validatorCache.set(config.editCheckId, validator);
    console.log(`  ✓ ${config.editCheckId} (loaded)`);
    
    return validator;
  }
  
  private evaluateGeneratedCode(
    typescript: string,
    editCheckId: string
  ): IValidator {
    // Evaluate generated TypeScript code
    // In production, this would be pre-compiled
    const validatorFunction = new Function(`return ${typescript}`)();
    
    return {
      validatorId: editCheckId,
      validate: validatorFunction
    };
  }
  
  private async generateValidatorFromWorkspace(
    workspaceJson: string,
    editCheckId: string
  ): Promise<IValidator> {
    // This should rarely happen (only if code not pre-generated)
    console.warn(`[ValidationRegistry] Generating code on-the-fly for: ${editCheckId}`);
    
    // Call code generation service
    const generatedCode = await this.http.post<{ typescript: string }>(
      `${this.API_BASE}/generate`,
      { workspaceJson, target: 'typescript' }
    ).toPromise();
    
    return this.evaluateGeneratedCode(generatedCode!.typescript, editCheckId);
  }
  
  /**
   * 4. Load system-defined edit check mappings (instant, config-based)
   */
  private async loadEditCheckMappings(
    configs: EditCheckMappingConfig[]
  ): Promise<IValidator[]> {
    console.log(`[ValidationRegistry] Loading ${configs.length} edit check mappings (instant)`);
    
    return configs.map(config => {
      // Create validator from mapping config
      return this.createMappingValidator(config);
    });
  }
  
  private createMappingValidator(config: EditCheckMappingConfig): IValidator {
    // Map edit check type to system validator
    switch (config.editCheckType) {
      case 'range':
        return new ConfiguredValidator(
          this.systemValidators.get('range')!,
          config.fieldName,
          config.params,
          config.severity
        );
      
      case 'required':
        return new ConfiguredValidator(
          this.systemValidators.get('required')!,
          config.fieldName,
          config.params,
          config.severity
        );
      
      case 'dateOrder':
        return new ConfiguredValidator(
          this.systemValidators.get('dateOrder')!,
          config.fieldName,
          config.params,
          config.severity
        );
      
      case 'crossForm':
        return new CrossFormValidator(config);
      
      default:
        throw new Error(`Unknown edit check type: ${config.editCheckType}`);
    }
  }
  
  /**
   * Clear cache (useful for hot-reload during development)
   */
  clearCache(): void {
    this.validatorCache.clear();
    this.moduleCache.clear();
    console.log('[ValidationRegistry] Cache cleared');
  }
}

/**
 * Wrapper for system validators with configuration
 */
class ConfiguredValidator implements IValidator {
  constructor(
    private baseValidator: IValidator,
    public fieldName: string,
    private params?: Record<string, any>,
    private severity?: 'error' | 'warning' | 'info'
  ) {}
  
  get validatorId(): string {
    return this.baseValidator.validatorId;
  }
  
  async validate(value: any, context: ValidationContext): Promise<ValidationResult> {
    const result = await this.baseValidator.validate(value, {
      ...context,
      ...this.params
    });
    
    // Override severity if specified
    if (this.severity && result.status !== 'pass') {
      result.severity = this.severity;
    }
    
    return result;
  }
}
```

---

### 15.4 Form Validation Pipeline

**Purpose:** Execute all validators for a form in correct order with caching

```typescript
// libs/form-renderer/src/lib/services/form-validation.service.ts
import { Injectable } from '@angular/core';
import { ValidationRegistryService } from './validation-registry.service';

export interface FormValidationResult {
  valid: boolean;
  fieldResults: Map<string, ValidationResult[]>;
  executionTime: number;
  validatorCounts: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class FormValidationService {
  // Cache validators per form
  private validatorsByForm = new Map<string, Map<string, IValidator[]>>();
  
  constructor(private registry: ValidationRegistryService) {}
  
  /**
   * Validate entire form with all validators
   * 
   * Example: 80 validators (20 system + 20 custom + 10 edit checks + 30 mappings)
   */
  async validateForm(
    formConfig: FormConfiguration,
    formData: Record<string, any>,
    context?: Partial<ValidationContext>
  ): Promise<FormValidationResult> {
    const startTime = performance.now();
    
    console.log(`[FormValidation] Validating form: ${formConfig.formId}`);
    
    // 1. Load validators (uses cache if available)
    const validatorsByField = await this.getValidatorsForForm(formConfig);
    
    // 2. Execute validators by field
    const fieldResults = new Map<string, ValidationResult[]>();
    let totalValidators = 0;
    let passed = 0;
    let failed = 0;
    let warnings = 0;
    
    // Validate each field in parallel
    const fieldValidationPromises = Array.from(validatorsByField.entries()).map(
      async ([fieldName, validators]) => {
        const fieldValue = formData[fieldName];
        
        const validationContext: ValidationContext = {
          fieldName,
          value: fieldValue,
          formData,
          subjectData: context?.subjectData,
          studyConfig: context?.studyConfig
        };
        
        // Run all validators for this field
        const results = await this.validateField(validators, validationContext);
        
        fieldResults.set(fieldName, results);
        
        // Update counters
        totalValidators += results.length;
        results.forEach(result => {
          if (result.status === 'pass') {
            passed++;
          } else if (result.status === 'fail') {
            failed++;
          } else if (result.status === 'warn') {
            warnings++;
          }
        });
      }
    );
    
    await Promise.all(fieldValidationPromises);
    
    const executionTime = performance.now() - startTime;
    
    console.log(`[FormValidation] Validation complete in ${executionTime.toFixed(2)}ms`);
    console.log(`  Total validators: ${totalValidators}`);
    console.log(`  Passed: ${passed}`);
    console.log(`  Failed: ${failed}`);
    console.log(`  Warnings: ${warnings}`);
    
    return {
      valid: failed === 0,
      fieldResults,
      executionTime,
      validatorCounts: {
        total: totalValidators,
        passed,
        failed,
        warnings
      }
    };
  }
  
  /**
   * Validate single field with all its validators
   */
  async validateField(
    validators: IValidator[],
    context: ValidationContext
  ): Promise<ValidationResult[]> {
    // Execute validators in order:
    // 1. System validators (fast, always pass/fail quickly)
    // 2. Custom validators (may be async, DB calls, etc.)
    // 3. Edit checks (complex logic)
    
    const results: ValidationResult[] = [];
    
    for (const validator of validators) {
      try {
        const result = await validator.validate(context.value, context);
        results.push(result);
        
        // Short-circuit on error (optional)
        if (result.status === 'fail' && result.severity === 'error') {
          // Stop validation for this field if critical error
          // (Comment out to run all validators regardless)
          // break;
        }
      } catch (error) {
        console.error(`[FormValidation] Validator error:`, validator.validatorId, error);
        results.push({
          status: 'fail',
          message: `Validator error: ${(error as Error).message}`,
          severity: 'error'
        });
      }
    }
    
    return results;
  }
  
  /**
   * Get validators for form (with caching)
   */
  private async getValidatorsForForm(
    formConfig: FormConfiguration
  ): Promise<Map<string, IValidator[]>> {
    // Check cache
    if (this.validatorsByForm.has(formConfig.formId)) {
      console.log(`[FormValidation] Using cached validators for: ${formConfig.formId}`);
      return this.validatorsByForm.get(formConfig.formId)!;
    }
    
    // Load validators
    const validators = await this.registry.loadValidatorsForForm(formConfig);
    
    // Cache for future use
    this.validatorsByForm.set(formConfig.formId, validators);
    
    return validators;
  }
  
  /**
   * Clear cache (useful for hot-reload or form version changes)
   */
  clearCache(formId?: string): void {
    if (formId) {
      this.validatorsByForm.delete(formId);
    } else {
      this.validatorsByForm.clear();
    }
    
    this.registry.clearCache();
  }
}
```

---

### 15.5 Form Renderer Component

**Purpose:** Integrate validation pipeline into form rendering

```typescript
// libs/form-renderer/src/lib/components/form-renderer.component.ts
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { FormValidationService } from '../services/form-validation.service';

@Component({
  selector: 'app-form-renderer',
  template: `
    <form [formGroup]="formGroup" (ngSubmit)="onSubmit()">
      <div *ngFor="let field of formConfig.fields" class="form-field">
        <label [for]="field.fieldName">
          {{ field.label }}
          <span *ngIf="field.required" class="required">*</span>
        </label>
        
        <input
          [id]="field.fieldName"
          [formControlName]="field.fieldName"
          [type]="getInputType(field.fieldType)"
          (blur)="onFieldBlur(field.fieldName)"
        />
        
        <!-- Validation errors/warnings -->
        <div *ngIf="fieldValidationResults.get(field.fieldName) as results" class="validation-messages">
          <div
            *ngFor="let result of results"
            [class.error]="result.status === 'fail' && result.severity === 'error'"
            [class.warning]="result.status === 'warn' || result.severity === 'warning'"
            [class.info]="result.severity === 'info'"
          >
            {{ result.message }}
          </div>
        </div>
      </div>
      
      <div class="form-actions">
        <button type="submit" [disabled]="!formGroup.valid">Submit</button>
        <button type="button" (click)="validateAll()">Validate All</button>
      </div>
      
      <!-- Validation summary -->
      <div *ngIf="lastValidationResult" class="validation-summary">
        <h4>Validation Summary</h4>
        <p>Total validators: {{ lastValidationResult.validatorCounts.total }}</p>
        <p>Passed: {{ lastValidationResult.validatorCounts.passed }}</p>
        <p>Failed: {{ lastValidationResult.validatorCounts.failed }}</p>
        <p>Warnings: {{ lastValidationResult.validatorCounts.warnings }}</p>
        <p>Execution time: {{ lastValidationResult.executionTime.toFixed(2) }}ms</p>
      </div>
    </form>
  `
})
export class FormRendererComponent implements OnInit, OnDestroy {
  @Input() formConfig!: FormConfiguration;
  @Input() initialData?: Record<string, any>;
  
  formGroup!: FormGroup;
  fieldValidationResults = new Map<string, ValidationResult[]>();
  lastValidationResult?: FormValidationResult;
  
  private destroy$ = new Subject<void>();
  
  constructor(private validationService: FormValidationService) {}
  
  ngOnInit(): void {
    // 1. Create form group
    this.formGroup = this.createFormGroup();
    
    // 2. Pre-load validators for this form (async, non-blocking)
    this.preloadValidators();
    
    // 3. Set up real-time validation (debounced)
    this.setupRealtimeValidation();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  private createFormGroup(): FormGroup {
    const controls: Record<string, FormControl> = {};
    
    this.formConfig.fields.forEach(field => {
      const initialValue = this.initialData?.[field.fieldName] ?? null;
      controls[field.fieldName] = new FormControl(initialValue);
    });
    
    return new FormGroup(controls);
  }
  
  /**
   * Pre-load all validators for this form in the background
   * This happens asynchronously so form renders immediately
   */
  private async preloadValidators(): Promise<void> {
    console.log('[FormRenderer] Pre-loading validators...');
    
    const startTime = performance.now();
    
    try {
      // This will cache validators for later use
      await this.validationService.validateForm(
        this.formConfig,
        this.formGroup.value
      );
      
      const loadTime = performance.now() - startTime;
      console.log(`[FormRenderer] Validators pre-loaded in ${loadTime.toFixed(2)}ms`);
    } catch (error) {
      console.error('[FormRenderer] Failed to pre-load validators:', error);
    }
  }
  
  /**
   * Set up real-time validation with debouncing
   */
  private setupRealtimeValidation(): void {
    this.formGroup.valueChanges
      .pipe(
        debounceTime(500), // Wait 500ms after last change
        takeUntil(this.destroy$)
      )
      .subscribe(async () => {
        await this.validateAll();
      });
  }
  
  /**
   * Validate single field on blur
   */
  async onFieldBlur(fieldName: string): Promise<void> {
    const result = await this.validationService.validateForm(
      this.formConfig,
      this.formGroup.value
    );
    
    // Update only this field's validation results
    const fieldResults = result.fieldResults.get(fieldName);
    if (fieldResults) {
      this.fieldValidationResults.set(fieldName, fieldResults);
    }
  }
  
  /**
   * Validate all fields
   */
  async validateAll(): Promise<void> {
    const result = await this.validationService.validateForm(
      this.formConfig,
      this.formGroup.value
    );
    
    this.lastValidationResult = result;
    this.fieldValidationResults = result.fieldResults;
    
    // Update Angular form validity
    if (result.valid) {
      this.formGroup.setErrors(null);
    } else {
      this.formGroup.setErrors({ validationFailed: true });
    }
  }
  
  async onSubmit(): Promise<void> {
    // Final validation before submit
    await this.validateAll();
    
    if (this.lastValidationResult?.valid) {
      console.log('Form is valid, submitting...', this.formGroup.value);
      // Submit to server
    } else {
      console.warn('Form has validation errors');
    }
  }
  
  getInputType(fieldType: string): string {
    const typeMap: Record<string, string> = {
      text: 'text',
      number: 'number',
      date: 'date',
      email: 'email',
      phone: 'tel'
    };
    return typeMap[fieldType] || 'text';
  }
}
```

---

### 15.6 Complete Flow Example

**Scenario:** User opens "Vital Signs" form with 80 validators

**Step-by-Step Flow:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 1: Form Configuration Load (from server)                          │
│ Time: 50-100ms (HTTP request)                                          │
└─────────────────────────────────────────────────────────────────────────┘
    ↓
GET /api/forms/vital_signs_v1/config
Response: {
  "formId": "vital_signs_v1",
  "validations": {
    "systemValidations": [20 configs],      // 0 bytes (config only)
    "customValidators": [20 configs],       // ~20KB total (if CDN)
    "customEditChecks": [10 configs],       // ~15KB total (if CDN)
    "editCheckMappings": [30 configs]       // 0 bytes (config only)
  }
}

┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 2: Form Renderer Initialization                                   │
│ Time: 10-20ms (Angular component creation)                             │
└─────────────────────────────────────────────────────────────────────────┘
    ↓
- Create FormGroup with all fields
- Render form UI (fields, labels, buttons)
- ✅ Form is now visible and usable (no blocking)

┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 3: Validator Pre-Loading (async, in background)                   │
│ Time: 100-300ms (parallel loading)                                     │
└─────────────────────────────────────────────────────────────────────────┘
    ↓
[ValidationRegistry.loadValidatorsForForm]
    │
    ├─→ [Load System Validators: 20 validators]
    │   Time: ~1ms (instant, already in memory)
    │   ✓ RequiredValidator (13 instances)
    │   ✓ RangeValidator (5 instances)
    │   ✓ DateFormatValidator (2 instances)
    │
    ├─→ [Load Custom Validators: 20 validators] (parallel)
    │   Time: ~150ms (CDN downloads)
    │   ✓ BMICalculatorValidator (from CDN, cached)
    │   ✓ EGFRCalculatorValidator (from CDN, cached)
    │   ✓ CustomRangeValidator (inline code)
    │   ... 17 more
    │
    ├─→ [Load Custom Edit Checks: 10 validators] (parallel)
    │   Time: ~100ms (pre-generated code or CDN)
    │   ✓ EC_ConditionalBMIRequired (pre-generated)
    │   ✓ EC_CrossFormValidation (from CDN)
    │   ✓ EC_DateOrderingCheck (pre-generated)
    │   ... 7 more
    │
    └─→ [Load Edit Check Mappings: 30 validators]
        Time: ~1ms (instant, config-based)
        ✓ EC_Range_Weight (maps to RangeValidator)
        ✓ EC_Range_Height (maps to RangeValidator)
        ✓ EC_Required_BMI (maps to RequiredValidator)
        ... 27 more

Result: 80 validators loaded and cached in ~250ms total

┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 4: User Enters Data                                               │
│ Time: N/A (user interaction)                                            │
└─────────────────────────────────────────────────────────────────────────┘
    ↓
User types: weight = 75, height = 180

┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 5: Real-Time Validation (debounced 500ms)                         │
│ Time: 30-50ms (cached validators, parallel execution)                  │
└─────────────────────────────────────────────────────────────────────────┘
    ↓
[FormValidationService.validateForm]
    │
    ├─→ Validate "weight" field (6 validators)
    │   ├─ RequiredValidator → PASS (value exists)
    │   ├─ RangeValidator(30-300) → PASS (75 in range)
    │   ├─ EC_Range_Weight → PASS
    │   ├─ CustomWeightValidator → PASS
    │   ├─ EC_WeightUnitCheck → PASS
    │   └─ EC_WeightTrendCheck → PASS
    │   Time: ~5ms
    │
    ├─→ Validate "height" field (5 validators)
    │   ├─ RequiredValidator → PASS
    │   ├─ RangeValidator(50-250) → PASS (180 in range)
    │   ├─ EC_Range_Height → PASS
    │   ├─ CustomHeightValidator → PASS
    │   └─ EC_HeightUnitCheck → PASS
    │   Time: ~4ms
    │
    └─→ Validate "bmi" field (8 validators)
        ├─ BMICalculatorValidator → PASS (calculated: 23.1)
        ├─ RangeValidator(12-60) → PASS
        ├─ EC_ConditionalBMIRequired → PASS
        ├─ EC_BMITrendCheck → PASS
        ├─ EC_BMIOutlierDetection → PASS
        ... 3 more
        Time: ~8ms

Total validation time: ~20ms for all 80 validators
Result: ALL PASS ✅

┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 6: Form Submission                                                │
│ Time: 30ms (final validation) + 200ms (server round-trip)              │
└─────────────────────────────────────────────────────────────────────────┘
    ↓
1. Run final validation (cached, fast)
2. If valid: Submit form data to server
3. Server runs same validators in C# (server-side validation)
4. Return success/failure

```

**Performance Summary:**

| Phase | Time | Description |
|-------|------|-------------|
| **1. Config Load** | 50-100ms | HTTP request for form config |
| **2. Form Render** | 10-20ms | Angular component creation |
| **3. Validator Load** | 100-300ms | Background loading (non-blocking) |
| **4. Real-time Validation** | 30-50ms | Execute 80 validators (cached) |
| **5. Submit Validation** | 30ms | Final check before submit |
| **Total Time to Interactive** | **60-120ms** | Form usable in <200ms |
| **Total Time to Validated** | **190-470ms** | Fully loaded and validated |

---

### 15.7 Caching Strategy

**Multi-Level Cache:**

```typescript
// 1. Memory Cache (fastest)
private validatorCache = new Map<string, IValidator>(); // Per-validator instance

// 2. Form Cache (fast)
private validatorsByForm = new Map<string, Map<string, IValidator[]>>(); // Per-form grouped validators

// 3. Module Cache (medium)
private moduleCache = new Map<string, any>(); // Loaded ES modules

// 4. Browser Cache (medium-slow)
// CDN files with Cache-Control: max-age=31536000, immutable

// 5. Service Worker Cache (medium)
// PWA offline support for validator modules
```

**Cache Invalidation:**

```typescript
// Clear cache when form version changes
if (formConfig.version !== cachedVersion) {
  validationService.clearCache(formConfig.formId);
}

// Clear cache when custom validator updated
if (validatorUpdated) {
  registry.clearCache();
}

// Clear all caches on logout
authService.logout$.subscribe(() => {
  validationService.clearCache();
});
```

---

### 15.8 Bundle Size Impact

**Form Renderer Bundle (without validators):**

```
form-renderer.component.ts    ~15 KB
form-validation.service.ts    ~12 KB
validation-registry.service.ts ~18 KB
system-validators (20)         ~40 KB
Angular framework deps        ~200 KB
──────────────────────────────────────
Total (main bundle)           ~285 KB (gzipped)
```

**Lazy-Loaded Validators (on-demand):**

```
Custom validators (20)        ~20 KB each = ~400 KB total
Custom edit checks (10)       ~15 KB each = ~150 KB total
──────────────────────────────────────
Total (lazy-loaded)           ~550 KB (loaded only once, cached)
```

**Memory Usage (runtime):**

```
System validators (20)        ~5 KB (always in memory)
Custom validators (20)        ~80 KB (loaded on-demand)
Edit checks (10)              ~50 KB (loaded on-demand)
Form data + validation results ~10 KB
──────────────────────────────────────
Total (per form instance)     ~145 KB
```

---

### 15.9 Performance Optimization Checklist

**✅ Loading Optimizations:**

- [ ] Pre-load validators in background (non-blocking UI)
- [ ] Use Module Federation for code-splitting
- [ ] Lazy-load custom validators from CDN
- [ ] Pre-generate code for edit checks (avoid runtime generation)
- [ ] Enable HTTP/2 multiplexing for parallel CDN downloads
- [ ] Use CDN with global edge locations (CloudFlare, Fastly)
- [ ] Implement Service Worker for offline validator caching

**✅ Execution Optimizations:**

- [ ] Cache validator instances per form
- [ ] Execute field validations in parallel
- [ ] Debounce real-time validation (500ms)
- [ ] Short-circuit on critical errors (optional)
- [ ] Use Web Workers for CPU-intensive validators
- [ ] Memoize expensive calculations (BMI, eGFR)

**✅ Bundle Optimizations:**

- [ ] Tree-shake unused system validators
- [ ] Minify and compress validator code
- [ ] Use dynamic imports for rarely-used validators
- [ ] Enable Brotli compression on CDN
- [ ] Set aggressive cache headers (1 year)
- [ ] Version validator URLs for cache busting

---

**END OF DOCUMENTATION**

---

## Summary

This documentation provides a comprehensive guide to implementing Google Blockly for visual programming in clinical trial EDC platforms. Key takeaways:

✅ **Decision Rationale:** Blockly chosen for healthcare-friendly UI, extensive customization, and dual-target code generation  
✅ **Architecture:** Module Federation lazy-loading, Angular integration, TypeScript + C# generators  
✅ **Custom Blocks:** 25 edit check blocks + 20 workflow blocks tailored to clinical data management  
✅ **Code Generation:** Template-based generators with optimization, auto-tests, and audit compliance  
✅ **Workflows:** Complete examples for auto-queries, SAE notifications, and visit compliance  
✅ **Implementation:** Angular component, service layer, state management, and testing strategy  
✅ **Performance:** Bundle optimization, CDN strategy, Web Workers, and benchmarks  
✅ **Deployment:** Production checklist, monitoring, and accessibility compliance  

**Next Steps:**

1. Review with stakeholders (clinical operations, IT, QA)
2. Prototype BlocklyWorkspace component with 5-10 core blocks
3. User testing with study designers (non-programmers)
4. Iterate based on feedback
5. Gradual rollout starting with simple validators
6. Monitor adoption metrics and performance

**Related Documentation:**

- [Form Builder Custom Programming Implementation](form-builder-custom-programming-implementation.md)
- [Form Builder Server-Side Validator Library](form-builder-server-side-validator-library.md)
- [Form Builder Custom Validators](form-builder-custom-validators.md)

---

**Document Version:** 1.0  
**Last Updated:** May 30, 2026  
**Author:** Clinical EDC Platform Team  
**Status:** ✅ Complete
