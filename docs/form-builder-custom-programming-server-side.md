# Form Builder — Server-Side Edit Checks (C# .NET)

> **Status:** Architecture Design — Functional Validation Pipeline  
> **Date:** 2026-05-30  
> **Audience:** Platform architects, .NET developers, data engineers  
> Related docs: [validator library catalog](./form-builder-server-side-validator-library.md) · [use-cases](./form-builder-custom-programming-use-cases.md) · [client-side implementation](./form-builder-custom-programming-implementation.md) · [custom-validators SDK](./form-builder-custom-validators.md)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Architecture — Functional Validation Pipeline](#2-architecture--functional-validation-pipeline)
3. [FP Foundations in C#](#3-fp-foundations-in-c)
4. [Validation Context & Data Access](#4-validation-context--data-access)
5. [Custom Edit Check Implementation](#5-custom-edit-check-implementation)
6. [Cross-Visit Validation](#6-cross-visit-validation)
7. [Medical Coding Validation](#7-medical-coding-validation)
8. [SAE Regulatory Timeline Checks](#8-sae-regulatory-timeline-checks)
9. [Query Generation & Audit Trail](#9-query-generation--audit-trail)
10. [Testing Strategy](#10-testing-strategy)
11. [Performance Optimization](#11-performance-optimization)

---

## 1. Overview

> **Note:** This document covers **custom validator implementation** for developers. For pre-built, configurable validators that study designers can use without coding, see the **[Server-Side Validator Library](./form-builder-server-side-validator-library.md)** (17+ validators including SAE timelines, cross-visit checks, medical coding validation).

### 1.1 Why Server-Side Validation?

**Client-side validation** (covered in [implementation.md](./form-builder-custom-programming-implementation.md)) provides **immediate UX feedback** but has limitations:

❌ **Cannot do:**
- Access historical data (cross-visit validation)
- Query external systems (MedDRA dictionary, WHODrug)
- Validate against other subjects' data (cohort-level checks)
- Enforce regulatory timelines (SAE reporting windows)
- Generate audit-trail queries

✅ **Server-side is authoritative** — client validation is UX only.

### 1.2 The Solution — Functional Pipeline Architecture

**Traditional approach (imperative):**
```csharp
// ❌ Mutable state, side effects, hard to test
public async Task<ValidationResult> ValidateBMI(FormData data)
{
    var errors = new List<string>();
    
    if (data.Fields.ContainsKey("weight"))
    {
        var weight = (double)data.Fields["weight"];
        if (data.Fields.ContainsKey("height"))
        {
            var height = (double)data.Fields["height"];
            var bmi = weight / Math.Pow(height / 100, 2);
            
            if (data.Fields.ContainsKey("bmiEntered"))
            {
                var entered = (double)data.Fields["bmiEntered"];
                if (Math.Abs(bmi - entered) > 0.5)
                {
                    errors.Add("BMI does not match computed value");
                }
            }
        }
    }
    
    return errors.Any() 
        ? ValidationResult.Fail(errors) 
        : ValidationResult.Pass();
}
```

**Functional approach (adopted):**
```csharp
// ✅ Pure functions, composable, immutable
public static readonly EditCheck<FormData> BmiConsistency = 
    from weight  in GetField<double>("weight")
    from height  in GetField<double>("height")
    from entered in GetField<double>("bmiEntered")
    let computed = weight / Math.Pow(height / 100, 2)
    let diff = Math.Abs(computed - entered)
    select diff > 0.5
        ? Fail($"BMI {entered:F1} does not match computed {computed:F1} (tolerance ±0.5)")
        : Pass();
```

**Benefits:**
- **Composable**: Chain validators with LINQ
- **Testable**: Pure functions, no mocks needed
- **Type-safe**: Compile-time guarantees
- **Async-friendly**: Native `Task<T>` support
- **Fail-open**: Missing data returns `Pass()` (validated elsewhere)

---

## 2. Architecture — Functional Validation Pipeline

### 2.1 System Context

```
┌─────────────────────────────────────────────────────────────────────┐
│  Client (Angular)                                                   │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ FormRendererComponent                                         │  │
│  │  • Client-side validators (UX feedback)                       │  │
│  │  • On Save → POST /api/forms/{studyId}/{subjectId}/{formId}  │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓ HTTP POST
┌─────────────────────────────────────────────────────────────────────┐
│  ASP.NET Core Web API                                               │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ FormsController.SaveForm()                                    │  │
│  │  ├─ 1. Validate schema                                        │  │
│  │  ├─ 2. Run built-in validators                               │  │
│  │  ├─ 3. Load custom edit checks (study-specific)              │  │
│  │  ├─ 4. Execute validation pipeline                           │  │
│  │  └─ 5. Save + generate queries if errors                     │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                  ↓                                   │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ ValidationPipeline (Functional Core)                          │  │
│  │  • EditCheck<T> = Func<ValidationContext<T>, Task<Result>>   │  │
│  │  • Compose checks with LINQ query syntax                     │  │
│  │  • Async/await throughout                                    │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                  ↓                                   │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ ValidationContext (Immutable)                                 │  │
│  │  • Current form data                                          │  │
│  │  • Historical visits (read-only)                             │  │
│  │  • Study metadata                                             │  │
│  │  • Subject demographics                                       │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                  ↓                                   │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ Data Access Layer                                             │  │
│  │  • IFormRepository (EF Core)                                  │  │
│  │  • IMedDRAService (dictionary lookup)                        │  │
│  │  • ISubjectRepository (demographics, enrollment)             │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
                    ┌─────────────────────────┐
                    │ SQL Server              │
                    │  • Forms                │
                    │  • Subjects             │
                    │  • Visits               │
                    │  • Queries              │
                    │  • Audit Log            │
                    └─────────────────────────┘
```

### 2.2 Key Architectural Decisions

#### Decision 1: Functional Core, Imperative Shell

**Pattern:**
- **Functional Core**: Pure functions, immutable data structures (`ValidationContext<T>`, `Result<T>`)
- **Imperative Shell**: ASP.NET controller, EF Core queries, side effects isolated at boundaries

**Benefits:**
- Core validation logic is 100% testable without mocks
- Side effects (DB, external APIs) pushed to edges
- Easy to reason about, no hidden state

#### Decision 2: Task-Based Async Throughout

All validation is `async` by default — even pure computations:

```csharp
public delegate Task<Result<T>> EditCheck<T>(ValidationContext<T> context);
```

**Why async everywhere?**
- Cross-visit queries are async (DB access)
- Medical coding lookups are async (external API)
- Consistent pipeline — no mixing sync/async
- Future-proof for distributed caching, microservices

**Trade-off:**
- Slight overhead for pure computations (mitigated by `ValueTask<T>`)

#### Decision 3: Railway-Oriented Programming

Validation results use **discriminated unions**:

```csharp
public abstract record Result
{
    public record Pass : Result;
    public record Fail(string Message) : Result;
    public record Warn(string Message) : Result;
    
    // Monadic bind
    public Task<Result> BindAsync(Func<Task<Result>> next) =>
        this switch
        {
            Pass => next(),
            Fail f => Task.FromResult<Result>(f),
            Warn w => Task.FromResult<Result>(w),
        };
}
```

Validators short-circuit on first failure (fail-fast).

---

## 3. FP Foundations in C#

### 3.1 Core Abstractions

#### `ValidationContext<T>` — Immutable Context

```csharp
// ViaLiq.EDC.Validation/Core/ValidationContext.cs
public sealed record ValidationContext<T>
{
    public required T CurrentData { get; init; }
    public required string StudyId { get; init; }
    public required string SubjectId { get; init; }
    public required string FormId { get; init; }
    public required string VisitId { get; init; }
    public required DateTimeOffset SubmittedAt { get; init; }
    
    // Historical data (lazy-loaded)
    private readonly Lazy<Task<IReadOnlyList<FormSnapshot>>> _history;
    public Task<IReadOnlyList<FormSnapshot>> History => _history.Value;
    
    // Study metadata
    public required StudyMeta StudyMeta { get; init; }
    
    // Subject demographics (from carried data)
    public required SubjectDemographics Subject { get; init; }
    
    // Services (read-only)
    public required IFormRepository Forms { get; init; }
    public required IMedDRAService MedDRA { get; init; }
    public required IWHODrugService WHODrug { get; init; }
    
    internal ValidationContext(
        T currentData,
        string studyId,
        string subjectId,
        string formId,
        string visitId,
        DateTimeOffset submittedAt,
        StudyMeta studyMeta,
        SubjectDemographics subject,
        IFormRepository forms,
        IMedDRAService medDRA,
        IWHODrugService whoDrug)
    {
        CurrentData = currentData;
        StudyId = studyId;
        SubjectId = subjectId;
        FormId = formId;
        VisitId = visitId;
        SubmittedAt = submittedAt;
        StudyMeta = studyMeta;
        Subject = subject;
        Forms = forms;
        MedDRA = medDRA;
        WHODrug = whoDrug;
        
        // Lazy-load history only if needed
        _history = new Lazy<Task<IReadOnlyList<FormSnapshot>>>(
            () => forms.GetFormHistoryAsync(studyId, subjectId, formId)
        );
    }
}
```

#### `EditCheck<T>` — Functional Validator

```csharp
// ViaLiq.EDC.Validation/Core/EditCheck.cs
public delegate Task<Result> EditCheck<T>(ValidationContext<T> context);

// Extension methods for composition
public static class EditCheckExtensions
{
    // Combine multiple checks (all must pass)
    public static EditCheck<T> And<T>(
        this EditCheck<T> first, 
        EditCheck<T> second) =>
        async context =>
        {
            var result1 = await first(context);
            if (result1 is Result.Fail) return result1;
            
            var result2 = await second(context);
            return result2;
        };
    
    // Short-circuit on first failure
    public static EditCheck<T> Or<T>(
        this EditCheck<T> first, 
        EditCheck<T> second) =>
        async context =>
        {
            var result1 = await first(context);
            if (result1 is Result.Pass) return result1;
            
            var result2 = await second(context);
            return result2;
        };
    
    // Run check only if condition is true
    public static EditCheck<T> When<T>(
        this EditCheck<T> check,
        Func<ValidationContext<T>, bool> predicate) =>
        context => predicate(context) 
            ? check(context) 
            : Task.FromResult<Result>(new Result.Pass());
    
    // Map over success
    public static EditCheck<T> Map<T>(
        this EditCheck<T> check,
        Func<Result, Result> mapper) =>
        async context =>
        {
            var result = await check(context);
            return mapper(result);
        };
}
```

### 3.2 LINQ Query Syntax for Validation

C# LINQ query syntax provides monadic composition:

```csharp
// Define helper to extract fields
public static Func<ValidationContext<FormData>, Task<Option<T>>> GetField<T>(string key) =>
    context => Task.FromResult(
        context.CurrentData.Fields.TryGetValue(key, out var value) && value is T typed
            ? Option<T>.Some(typed)
            : Option<T>.None
    );

// Compose validators with LINQ
public static readonly EditCheck<FormData> BmiConsistency =
    async context =>
    {
        var weight = await GetField<double>("weight")(context);
        if (weight.IsNone) return new Result.Pass(); // Fail-open
        
        var height = await GetField<double>("height")(context);
        if (height.IsNone) return new Result.Pass();
        
        var entered = await GetField<double>("bmiEntered")(context);
        if (entered.IsNone) return new Result.Pass();
        
        var computed = weight.Value / Math.Pow(height.Value / 100, 2);
        var diff = Math.Abs(computed - entered.Value);
        
        return diff > 0.5
            ? new Result.Fail($"BMI {entered.Value:F1} does not match computed {computed:F1} (tolerance ±0.5)")
            : new Result.Pass();
    };
```

**With custom LINQ operators (advanced):**

```csharp
// Define SelectMany for monadic binding
public static EditCheck<TResult> SelectMany<TSource, TResult>(
    this EditCheck<TSource> source,
    Func<TSource, EditCheck<TResult>> selector) =>
    async context =>
    {
        var sourceResult = await source(context);
        return sourceResult switch
        {
            Result.Pass => await selector(/* ... */)(context),
            Result.Fail f => f,
            Result.Warn w => w,
        };
    };
```

### 3.3 Option Type for Safe Field Access

```csharp
// ViaLiq.EDC.Validation/Core/Option.cs
public abstract record Option<T>
{
    private Option() { }
    
    public sealed record Some(T Value) : Option<T>;
    public sealed record None : Option<T>;
    
    public bool IsSome => this is Some;
    public bool IsNone => this is None;
    
    public T ValueOr(T defaultValue) =>
        this is Some some ? some.Value : defaultValue;
    
    public Option<TResult> Map<TResult>(Func<T, TResult> mapper) =>
        this is Some some 
            ? new Option<TResult>.Some(mapper(some.Value)) 
            : new Option<TResult>.None();
    
    public async Task<Option<TResult>> MapAsync<TResult>(Func<T, Task<TResult>> mapper) =>
        this is Some some 
            ? new Option<TResult>.Some(await mapper(some.Value))
            : new Option<TResult>.None();
}
```

---

## 4. Validation Context & Data Access

### 4.1 Building Validation Context

```csharp
// ViaLiq.EDC.Api/Controllers/FormsController.cs
[ApiController]
[Route("api/forms/{studyId}/{subjectId}")]
public class FormsController : ControllerBase
{
    private readonly IFormRepository _forms;
    private readonly ISubjectRepository _subjects;
    private readonly IValidationPipeline _validationPipeline;
    private readonly IMedDRAService _medDRA;
    private readonly IWHODrugService _whoDrug;
    
    [HttpPost("{formId}")]
    public async Task<IActionResult> SaveForm(
        string studyId,
        string subjectId,
        string formId,
        [FromBody] FormSubmissionDto submission)
    {
        // 1. Load study metadata
        var studyMeta = await _forms.GetStudyMetaAsync(studyId);
        
        // 2. Load subject demographics
        var subject = await _subjects.GetDemographicsAsync(studyId, subjectId);
        
        // 3. Build immutable context
        var context = new ValidationContext<FormData>(
            currentData: submission.Data,
            studyId: studyId,
            subjectId: subjectId,
            formId: formId,
            visitId: submission.VisitId,
            submittedAt: DateTimeOffset.UtcNow,
            studyMeta: studyMeta,
            subject: subject,
            forms: _forms,
            medDRA: _medDRA,
            whoDrug: _whoDrug
        );
        
        // 4. Run validation pipeline
        var validationResult = await _validationPipeline.ValidateAsync(context);
        
        // 5. Handle result
        if (validationResult.IsValid)
        {
            await _forms.SaveAsync(context);
            return Ok(new { success = true });
        }
        else
        {
            // Generate queries for errors
            await GenerateQueriesAsync(context, validationResult.Errors);
            
            return BadRequest(new 
            { 
                success = false, 
                errors = validationResult.Errors 
            });
        }
    }
}
```

### 4.2 Data Access Layer — Repository Pattern

```csharp
// ViaLiq.EDC.Data/Repositories/IFormRepository.cs
public interface IFormRepository
{
    // Get form data for a specific visit
    Task<Option<FormSnapshot>> GetFormAsync(
        string studyId, 
        string subjectId, 
        string formId, 
        string visitId);
    
    // Get all historical versions of a form (for cross-visit validation)
    Task<IReadOnlyList<FormSnapshot>> GetFormHistoryAsync(
        string studyId, 
        string subjectId, 
        string formId);
    
    // Get all forms for a subject at a specific visit
    Task<IReadOnlyList<FormSnapshot>> GetVisitFormsAsync(
        string studyId, 
        string subjectId, 
        string visitId);
    
    // Get baseline data (first visit)
    Task<Option<FormSnapshot>> GetBaselineFormAsync(
        string studyId, 
        string subjectId, 
        string formId);
    
    // Save form (transactional)
    Task SaveAsync(ValidationContext<FormData> context);
    
    // Study metadata
    Task<StudyMeta> GetStudyMetaAsync(string studyId);
}

// Implementation with EF Core
public class FormRepository : IFormRepository
{
    private readonly EdcDbContext _db;
    
    public FormRepository(EdcDbContext db) => _db = db;
    
    public async Task<IReadOnlyList<FormSnapshot>> GetFormHistoryAsync(
        string studyId, 
        string subjectId, 
        string formId)
    {
        return await _db.Forms
            .Where(f => 
                f.StudyId == studyId && 
                f.SubjectId == subjectId && 
                f.FormId == formId)
            .OrderBy(f => f.VisitDate)
            .Select(f => new FormSnapshot(
                f.VisitId,
                f.VisitDate,
                f.Data,
                f.SubmittedAt
            ))
            .ToListAsync();
    }
    
    public async Task<Option<FormSnapshot>> GetBaselineFormAsync(
        string studyId, 
        string subjectId, 
        string formId)
    {
        var baseline = await _db.Forms
            .Where(f => 
                f.StudyId == studyId && 
                f.SubjectId == subjectId && 
                f.FormId == formId &&
                f.VisitId == "SCREENING" || f.VisitId == "BASELINE")
            .OrderBy(f => f.VisitDate)
            .FirstOrDefaultAsync();
        
        return baseline != null
            ? Option<FormSnapshot>.Some(new FormSnapshot(
                baseline.VisitId,
                baseline.VisitDate,
                baseline.Data,
                baseline.SubmittedAt
              ))
            : Option<FormSnapshot>.None();
    }
}
```

### 4.3 FormSnapshot — Immutable Historical Data

```csharp
// ViaLiq.EDC.Validation/Core/FormSnapshot.cs
public sealed record FormSnapshot(
    string VisitId,
    DateOnly VisitDate,
    FormData Data,
    DateTimeOffset SubmittedAt
)
{
    public Option<T> GetField<T>(string key) =>
        Data.Fields.TryGetValue(key, out var value) && value is T typed
            ? Option<T>.Some(typed)
            : Option<T>.None();
    
    public bool HasField(string key) => 
        Data.Fields.ContainsKey(key);
}
```

---

## 5. Custom Edit Check Implementation

### 5.1 Study-Specific Validator Registry

```csharp
// ViaLiq.EDC.Validation.Studies/StudyXYZ001/EditChecks.cs
namespace ViaLiq.EDC.Validation.Studies.StudyXYZ001;

public static class EditChecks
{
    // Registry of all custom edit checks for study XYZ-001
    public static IReadOnlyDictionary<string, EditCheck<FormData>> All { get; } = 
        new Dictionary<string, EditCheck<FormData>>
        {
            ["bmiConsistency"] = BmiConsistency,
            ["ctcaeGradeOutcome"] = CtcaeGradeOutcome,
            ["recistTargetLesionSum"] = RecistTargetLesionSum,
            ["saeNotificationRequired"] = SaeNotificationRequired,
            ["baselineEligibility"] = BaselineEligibility,
            ["tumorResponseConfirmation"] = TumorResponseConfirmation,
        };
    
    // Individual checks defined below...
}
```

### 5.2 Example: BMI Consistency Check

```csharp
public static readonly EditCheck<FormData> BmiConsistency = async context =>
{
    // Extract fields using Option pattern
    var weight = GetField<double>("weight", context.CurrentData);
    var height = GetField<double>("height", context.CurrentData);
    var entered = GetField<double>("bmiEntered", context.CurrentData);
    
    // Fail-open if any field is missing
    if (weight.IsNone || height.IsNone || entered.IsNone)
        return new Result.Pass();
    
    // Compute BMI (weight in kg, height in cm)
    var computed = weight.Value / Math.Pow(height.Value / 100, 2);
    
    // Check tolerance
    const double tolerance = 0.5;
    var diff = Math.Abs(computed - entered.Value);
    
    if (diff > tolerance)
    {
        return new Result.Fail(
            $"BMI {entered.Value:F1} does not match computed value {computed:F1} " +
            $"(tolerance ±{tolerance}). " +
            $"Please verify weight and height measurements."
        );
    }
    
    // Check physiological range (BMI 10-80)
    if (entered.Value < 10 || entered.Value > 80)
    {
        return new Result.Warn(
            $"BMI {entered.Value:F1} is outside typical range (10-80). " +
            $"Please confirm this value is correct."
        );
    }
    
    return new Result.Pass();
};

// Helper
private static Option<T> GetField<T>(string key, FormData data) =>
    data.Fields.TryGetValue(key, out var value) && value is T typed
        ? Option<T>.Some(typed)
        : Option<T>.None();
```

### 5.3 Example: CTCAE Grade vs Outcome

```csharp
public static readonly EditCheck<FormData> CtcaeGradeOutcome = async context =>
{
    var grade = GetField<int>("ctcaeGrade", context.CurrentData);
    if (grade.IsNone) return new Result.Pass();
    
    // Grade 0 is invalid for existing AE
    if (grade.Value == 0)
    {
        return new Result.Fail(
            "CTCAE grade 0 indicates no adverse event. " +
            "If AE is present, grade must be 1-5."
        );
    }
    
    // Grade must be 1-5
    if (grade.Value < 1 || grade.Value > 5)
    {
        return new Result.Fail($"CTCAE grade must be 1-5 (entered: {grade.Value})");
    }
    
    // Grade 5 = death → outcome must be FATAL
    if (grade.Value == 5)
    {
        var outcome = GetField<string>("aeOutcome", context.CurrentData);
        var deathDate = GetField<DateOnly>("deathDate", context.CurrentData);
        
        if (outcome.IsNone || outcome.Value != "FATAL")
        {
            return new Result.Fail(
                "CTCAE grade 5 indicates a fatal outcome. " +
                "AE Outcome must be set to 'FATAL'."
            );
        }
        
        if (deathDate.IsNone)
        {
            return new Result.Fail(
                "CTCAE grade 5 requires Death Date to be populated."
            );
        }
        
        // Death date must be >= AE start date
        var aeStartDate = GetField<DateOnly>("aeStartDate", context.CurrentData);
        if (aeStartDate.IsSome && deathDate.Value < aeStartDate.Value)
        {
            return new Result.Fail(
                $"Death Date ({deathDate.Value:yyyy-MM-dd}) cannot be before " +
                $"AE Start Date ({aeStartDate.Value:yyyy-MM-dd})."
            );
        }
    }
    
    return new Result.Pass();
};
```

---

## 6. Cross-Visit Validation

### 6.1 Baseline Consistency Check

**Use case:** Ensure subject demographics (sex, DOB) don't change after baseline.

```csharp
public static readonly EditCheck<FormData> DemographicsImmutable = async context =>
{
    // Only applies to Demographics form
    if (context.FormId != "DM") return new Result.Pass();
    
    // Skip for baseline visit
    if (context.VisitId == "BASELINE") return new Result.Pass();
    
    // Get baseline demographics
    var baseline = await context.Forms.GetBaselineFormAsync(
        context.StudyId, 
        context.SubjectId, 
        "DM"
    );
    
    if (baseline.IsNone) return new Result.Pass(); // No baseline yet
    
    // Check sex hasn't changed
    var currentSex = GetField<string>("sex", context.CurrentData);
    var baselineSex = baseline.Value.GetField<string>("sex");
    
    if (currentSex.IsSome && baselineSex.IsSome && currentSex.Value != baselineSex.Value)
    {
        return new Result.Fail(
            $"Subject sex cannot change after baseline. " +
            $"Baseline: {baselineSex.Value}, Current: {currentSex.Value}"
        );
    }
    
    // Check DOB hasn't changed
    var currentDob = GetField<DateOnly>("dateOfBirth", context.CurrentData);
    var baselineDob = baseline.Value.GetField<DateOnly>("dateOfBirth");
    
    if (currentDob.IsSome && baselineDob.IsSome && currentDob.Value != baselineDob.Value)
    {
        return new Result.Fail(
            $"Date of birth cannot change after baseline. " +
            $"Baseline: {baselineDob.Value:yyyy-MM-dd}, Current: {currentDob.Value:yyyy-MM-dd}"
        );
    }
    
    return new Result.Pass();
};
```

### 6.2 Visit Window Compliance

**Use case:** Vital signs must be collected within protocol-defined visit window.

```csharp
public static readonly EditCheck<FormData> VisitWindowCompliance = async context =>
{
    // Get expected visit date from subject enrollment
    var subject = context.Subject;
    var enrollmentDate = subject.EnrollmentDate;
    
    // Get visit window from study metadata
    var visitSchedule = context.StudyMeta.VisitSchedule
        .FirstOrDefault(v => v.VisitId == context.VisitId);
    
    if (visitSchedule == null) return new Result.Pass(); // Unscheduled visit
    
    var visitDate = GetField<DateOnly>("visitDate", context.CurrentData);
    if (visitDate.IsNone) return new Result.Pass();
    
    // Calculate expected window
    var daysSinceEnrollment = (visitDate.Value.ToDateTime(TimeOnly.MinValue) - 
                               enrollmentDate.ToDateTime(TimeOnly.MinValue)).Days;
    
    var expectedDay = visitSchedule.DayOffset;
    var windowStart = expectedDay + visitSchedule.WindowStart;
    var windowEnd = expectedDay + visitSchedule.WindowEnd;
    
    if (daysSinceEnrollment < windowStart || daysSinceEnrollment > windowEnd)
    {
        return new Result.Warn(
            $"Visit {context.VisitId} collected outside protocol window. " +
            $"Expected: Day {windowStart}-{windowEnd}, Actual: Day {daysSinceEnrollment}. " +
            $"Protocol deviation may be required."
        );
    }
    
    return new Result.Pass();
};
```

### 6.3 Tumor Response Confirmation (RECIST 1.1)

**Use case:** Partial Response (PR) or Complete Response (CR) must be confirmed by a second assessment ≥4 weeks later.

```csharp
public static readonly EditCheck<FormData> TumorResponseConfirmation = async context =>
{
    // Only applies to Tumor Assessment form
    if (context.FormId != "TU") return new Result.Pass();
    
    var response = GetField<string>("overallResponse", context.CurrentData);
    if (response.IsNone) return new Result.Pass();
    
    // Only CR and PR require confirmation
    if (response.Value != "CR" && response.Value != "PR")
        return new Result.Pass();
    
    var currentDate = GetField<DateOnly>("assessmentDate", context.CurrentData);
    if (currentDate.IsNone) return new Result.Pass();
    
    // Get historical tumor assessments
    var history = await context.History;
    
    // Find previous assessment with same response
    var previousResponse = history
        .Where(h => h.VisitDate < currentDate.Value)
        .Select(h => new
        {
            Date = h.VisitDate,
            Response = h.GetField<string>("overallResponse")
        })
        .Where(x => x.Response.IsSome && x.Response.Value == response.Value)
        .OrderByDescending(x => x.Date)
        .FirstOrDefault();
    
    if (previousResponse == null)
    {
        // This is the first time this response is recorded
        return new Result.Warn(
            $"{response.Value} recorded at {currentDate.Value:yyyy-MM-dd}. " +
            $"Per RECIST 1.1, this must be confirmed by a second assessment ≥4 weeks later."
        );
    }
    
    // Check confirmation window (≥28 days)
    var daysBetween = (currentDate.Value.ToDateTime(TimeOnly.MinValue) - 
                       previousResponse.Date.ToDateTime(TimeOnly.MinValue)).Days;
    
    if (daysBetween < 28)
    {
        return new Result.Fail(
            $"{response.Value} confirmation must be ≥4 weeks (28 days) after initial assessment. " +
            $"Initial: {previousResponse.Date:yyyy-MM-dd}, Current: {currentDate.Value:yyyy-MM-dd} " +
            $"({daysBetween} days)."
        );
    }
    
    return new Result.Pass();
};
```

---

## 7. Medical Coding Validation

### 7.1 MedDRA Service Interface

```csharp
// ViaLiq.EDC.MedicalCoding/IMedDRAService.cs
public interface IMedDRAService
{
    // Validate PT code exists in specified version
    Task<bool> IsValidPTAsync(string ptCode, string version);
    
    // Get SOC for a given PT
    Task<Option<string>> GetSOCAsync(string ptCode, string version);
    
    // Get all LLTs for a PT
    Task<IReadOnlyList<string>> GetLLTsAsync(string ptCode, string version);
    
    // Validate hierarchy: LLT → PT → HLGT → HLT → SOC
    Task<bool> ValidateHierarchyAsync(
        string lltCode, 
        string ptCode, 
        string socCode, 
        string version);
    
    // Check if AE is a SUSAR (Suspected Unexpected Serious Adverse Reaction)
    Task<bool> IsSUSARAsync(
        string ptCode, 
        string version, 
        string productName);
}
```

### 7.2 MedDRA PT Validation

```csharp
public static readonly EditCheck<FormData> MedDRAPTValid = async context =>
{
    var ptCode = GetField<string>("meddraPT", context.CurrentData);
    if (ptCode.IsNone) return new Result.Pass();
    
    // Validate code format (8 digits)
    if (!System.Text.RegularExpressions.Regex.IsMatch(ptCode.Value, @"^\d{8}$"))
    {
        return new Result.Fail(
            $"MedDRA PT code must be 8 digits (entered: {ptCode.Value})"
        );
    }
    
    // Validate code exists in study MedDRA version
    var version = context.StudyMeta.MedDRAVersion; // e.g., "27.1"
    var isValid = await context.MedDRA.IsValidPTAsync(ptCode.Value, version);
    
    if (!isValid)
    {
        return new Result.Fail(
            $"MedDRA PT code {ptCode.Value} not found in version {version}. " +
            $"Please verify the code or update to a valid PT."
        );
    }
    
    return new Result.Pass();
};
```

### 7.3 MedDRA SOC Consistency

```csharp
public static readonly EditCheck<FormData> MedDRASOCConsistent = async context =>
{
    var ptCode = GetField<string>("meddraPT", context.CurrentData);
    var socCode = GetField<string>("meddraSOC", context.CurrentData);
    
    if (ptCode.IsNone || socCode.IsNone) return new Result.Pass();
    
    // Get expected SOC from PT
    var version = context.StudyMeta.MedDRAVersion;
    var expectedSOC = await context.MedDRA.GetSOCAsync(ptCode.Value, version);
    
    if (expectedSOC.IsNone)
    {
        return new Result.Fail($"Could not determine SOC for PT {ptCode.Value}");
    }
    
    if (expectedSOC.Value != socCode.Value)
    {
        return new Result.Fail(
            $"SOC {socCode.Value} is inconsistent with PT {ptCode.Value}. " +
            $"Expected SOC: {expectedSOC.Value}"
        );
    }
    
    return new Result.Pass();
};
```

### 7.4 SUSAR Detection

```csharp
public static readonly EditCheck<FormData> SUSARDetection = async context =>
{
    // Only applies to SAEs
    var isSerious = GetField<string>("aeSerious", context.CurrentData);
    if (isSerious.IsNone || isSerious.Value != "Y") return new Result.Pass();
    
    var ptCode = GetField<string>("meddraPT", context.CurrentData);
    if (ptCode.IsNone) return new Result.Pass();
    
    // Check if this is a SUSAR (unexpected + serious + suspected relationship)
    var version = context.StudyMeta.MedDRAVersion;
    var productName = context.StudyMeta.InvestigationalProduct;
    
    var isSUSAR = await context.MedDRA.IsSUSARAsync(
        ptCode.Value, 
        version, 
        productName
    );
    
    if (isSUSAR)
    {
        return new Result.Warn(
            $"This SAE (PT {ptCode.Value}) is a Suspected Unexpected Serious Adverse Reaction (SUSAR). " +
            $"Regulatory reporting to EMA/FDA may be required within 15 days."
        );
    }
    
    return new Result.Pass();
};
```

---

## 8. SAE Regulatory Timeline Checks

### 8.1 SAE Notification Timeline (GCP)

**Regulation:** ICH-GCP E2A requires SAE notification within 24 hours of awareness.

```csharp
public static readonly EditCheck<FormData> SAENotificationTimeline = async context =>
{
    var isSerious = GetField<string>("aeSerious", context.CurrentData);
    if (isSerious.IsNone || isSerious.Value != "Y") return new Result.Pass();
    
    var awarenessDate = GetField<DateOnly>("siteAwarenessDate", context.CurrentData);
    var notificationDate = GetField<DateOnly>("saeNotificationDate", context.CurrentData);
    
    if (awarenessDate.IsNone || notificationDate.IsNone) return new Result.Pass();
    
    // Calculate hours between awareness and notification
    var hoursBetween = (notificationDate.Value.ToDateTime(TimeOnly.MinValue) - 
                        awarenessDate.Value.ToDateTime(TimeOnly.MinValue)).TotalHours;
    
    if (hoursBetween > 24)
    {
        return new Result.Fail(
            $"SAE notification exceeded 24-hour GCP requirement. " +
            $"Awareness: {awarenessDate.Value:yyyy-MM-dd}, " +
            $"Notification: {notificationDate.Value:yyyy-MM-dd} " +
            $"({hoursBetween:F1} hours). " +
            $"Protocol deviation must be documented."
        );
    }
    
    if (hoursBetween > 20) // Warn approaching deadline
    {
        return new Result.Warn(
            $"SAE notification was within 24 hours but close to deadline ({hoursBetween:F1} hours)."
        );
    }
    
    return new Result.Pass();
};
```

### 8.2 SUSAR Reporting Timeline

**Regulation:** Fatal/life-threatening SUSARs → 7 days, Other SUSARs → 15 days.

```csharp
public static readonly EditCheck<FormData> SUSARReportingTimeline = async context =>
{
    // Check if this is a SUSAR
    var ptCode = GetField<string>("meddraPT", context.CurrentData);
    if (ptCode.IsNone) return new Result.Pass();
    
    var version = context.StudyMeta.MedDRAVersion;
    var productName = context.StudyMeta.InvestigationalProduct;
    var isSUSAR = await context.MedDRA.IsSUSARAsync(ptCode.Value, version, productName);
    
    if (!isSUSAR) return new Result.Pass();
    
    // Get severity
    var grade = GetField<int>("ctcaeGrade", context.CurrentData);
    var outcome = GetField<string>("aeOutcome", context.CurrentData);
    
    // Determine reporting deadline
    var isLifeThreatening = grade.IsSome && grade.Value >= 4;
    var isFatal = outcome.IsSome && outcome.Value == "FATAL";
    var deadlineDays = (isLifeThreatening || isFatal) ? 7 : 15;
    
    // Check if regulatory report was submitted
    var awarenessDate = GetField<DateOnly>("siteAwarenessDate", context.CurrentData);
    var reportDate = GetField<DateOnly>("regulatoryReportDate", context.CurrentData);
    
    if (awarenessDate.IsNone) return new Result.Pass();
    
    if (reportDate.IsNone)
    {
        var daysSinceAwareness = (DateOnly.FromDateTime(DateTime.UtcNow) - awarenessDate.Value).Days;
        
        if (daysSinceAwareness > deadlineDays)
        {
            return new Result.Fail(
                $"SUSAR regulatory report is overdue. " +
                $"Awareness: {awarenessDate.Value:yyyy-MM-dd}, " +
                $"Deadline: {deadlineDays} days, " +
                $"Current: {daysSinceAwareness} days."
            );
        }
        else if (daysSinceAwareness > deadlineDays - 2)
        {
            return new Result.Warn(
                $"SUSAR regulatory report approaching deadline " +
                $"({daysSinceAwareness}/{deadlineDays} days)."
            );
        }
    }
    else
    {
        var reportingDays = (reportDate.Value - awarenessDate.Value).Days;
        
        if (reportingDays > deadlineDays)
        {
            return new Result.Fail(
                $"SUSAR regulatory report exceeded {deadlineDays}-day deadline. " +
                $"Awareness: {awarenessDate.Value:yyyy-MM-dd}, " +
                $"Report: {reportDate.Value:yyyy-MM-dd} " +
                $"({reportingDays} days)."
            );
        }
    }
    
    return new Result.Pass();
};
```

---

## 9. Query Generation & Audit Trail

### 9.1 Automatic Query Creation

When validation fails, generate a data query for the site:

```csharp
// ViaLiq.EDC.Api/Services/QueryService.cs
public class QueryService : IQueryService
{
    private readonly EdcDbContext _db;
    
    public async Task CreateQueryAsync(
        ValidationContext<FormData> context,
        Result.Fail failure)
    {
        var query = new Query
        {
            QueryId = Guid.NewGuid().ToString(),
            StudyId = context.StudyId,
            SubjectId = context.SubjectId,
            FormId = context.FormId,
            VisitId = context.VisitId,
            
            QueryType = "VALIDATION_ERROR",
            Severity = failure.Severity,
            
            FieldKey = failure.FieldKey,
            FieldValue = failure.FieldValue,
            
            QueryText = failure.Message,
            
            RaisedBy = "SYSTEM",
            RaisedAt = DateTimeOffset.UtcNow,
            
            Status = "OPEN",
            
            AuditTrail = new List<QueryAuditEntry>
            {
                new QueryAuditEntry
                {
                    Timestamp = DateTimeOffset.UtcNow,
                    User = "SYSTEM",
                    Action = "QUERY_CREATED",
                    Reason = $"Validation rule failed: {failure.RuleId}"
                }
            }
        };
        
        _db.Queries.Add(query);
        await _db.SaveChangesAsync();
        
        // Send notification to site
        await SendQueryNotificationAsync(query);
    }
}
```

### 9.2 ALCOA-Compliant Audit Trail

```csharp
// ViaLiq.EDC.Data/Entities/FormAuditLog.cs
public class FormAuditLog
{
    public string AuditId { get; set; } = Guid.NewGuid().ToString();
    
    // ALCOA: Attributable
    public required string UserId { get; set; }
    public required string UserRole { get; set; }
    public required string UserName { get; set; }
    
    // ALCOA: Contemporaneous
    public required DateTimeOffset Timestamp { get; set; }
    
    // ALCOA: Original
    public required string StudyId { get; set; }
    public required string SubjectId { get; set; }
    public required string FormId { get; set; }
    public required string VisitId { get; set; }
    
    // Action
    public required string Action { get; set; } // CREATE, UPDATE, DELETE, LOCK, UNLOCK
    
    // ALCOA: Legible
    public string? Reason { get; set; }
    
    // ALCOA: Accurate (data snapshot)
    public string? DataBefore { get; set; } // JSON
    public string? DataAfter { get; set; }  // JSON
    
    // Validation results at time of save
    public string? ValidationResults { get; set; } // JSON
    
    // Digital signature (if applicable)
    public string? ElectronicSignature { get; set; }
}
```

---

## 10. Testing Strategy

### 10.1 Unit Tests — Pure Functions

```csharp
// ViaLiq.EDC.Validation.Tests/EditChecks/BmiConsistencyTests.cs
using Xunit;
using FluentAssertions;

public class BmiConsistencyTests
{
    [Fact]
    public async Task BmiConsistency_WithinTolerance_Passes()
    {
        // Arrange
        var context = new ValidationContextBuilder()
            .WithField("weight", 70.0)
            .WithField("height", 170.0)
            .WithField("bmiEntered", 24.2) // Actual: 24.22
            .Build();
        
        // Act
        var result = await EditChecks.BmiConsistency(context);
        
        // Assert
        result.Should().BeOfType<Result.Pass>();
    }
    
    [Fact]
    public async Task BmiConsistency_OutsideTolerance_Fails()
    {
        // Arrange
        var context = new ValidationContextBuilder()
            .WithField("weight", 70.0)
            .WithField("height", 170.0)
            .WithField("bmiEntered", 30.0) // Actual: 24.22
            .Build();
        
        // Act
        var result = await EditChecks.BmiConsistency(context);
        
        // Assert
        result.Should().BeOfType<Result.Fail>();
        var fail = (Result.Fail)result;
        fail.Message.Should().Contain("does not match computed value");
    }
    
    [Fact]
    public async Task BmiConsistency_MissingWeight_FailsOpen()
    {
        // Arrange
        var context = new ValidationContextBuilder()
            .WithField("height", 170.0)
            .WithField("bmiEntered", 24.2)
            .Build();
        
        // Act
        var result = await EditChecks.BmiConsistency(context);
        
        // Assert
        result.Should().BeOfType<Result.Pass>(); // Fail-open
    }
}
```

### 10.2 Integration Tests — Database Queries

```csharp
// ViaLiq.EDC.Validation.Tests/Integration/CrossVisitValidationTests.cs
public class CrossVisitValidationTests : IClassFixture<DatabaseFixture>
{
    private readonly DatabaseFixture _fixture;
    
    public CrossVisitValidationTests(DatabaseFixture fixture) => _fixture = fixture;
    
    [Fact]
    public async Task TumorResponseConfirmation_ConfirmationTooEarly_Fails()
    {
        // Arrange: Seed database with initial CR
        await _fixture.SeedFormAsync(new FormData
        {
            StudyId = "XYZ-001",
            SubjectId = "001-001",
            FormId = "TU",
            VisitId = "WEEK_4",
            Fields = new Dictionary<string, object>
            {
                ["assessmentDate"] = new DateOnly(2026, 1, 15),
                ["overallResponse"] = "CR"
            }
        });
        
        // Act: Submit confirmation 20 days later (too early)
        var context = await _fixture.BuildContextAsync(
            studyId: "XYZ-001",
            subjectId: "001-001",
            formId: "TU",
            visitId: "WEEK_8",
            data: new Dictionary<string, object>
            {
                ["assessmentDate"] = new DateOnly(2026, 2, 4), // 20 days later
                ["overallResponse"] = "CR"
            }
        );
        
        var result = await EditChecks.TumorResponseConfirmation(context);
        
        // Assert
        result.Should().BeOfType<Result.Fail>();
        var fail = (Result.Fail)result;
        fail.Message.Should().Contain("≥4 weeks");
        fail.Message.Should().Contain("20 days");
    }
}
```

### 10.3 Property-Based Testing

```csharp
// ViaLiq.EDC.Validation.Tests/Properties/BmiPropertyTests.cs
using FsCheck;
using FsCheck.Xunit;

public class BmiPropertyTests
{
    [Property]
    public Property BmiConsistency_AlwaysFailsOpen_WhenFieldsMissing()
    {
        var gen = from weight in Arb.Default.Float().Generator
                  from height in Arb.Default.Float().Generator
                  from entered in Arb.Default.Float().Generator
                  from missingField in Gen.Elements("weight", "height", "bmiEntered")
                  select new { weight, height, entered, missingField };
        
        return Prop.ForAll(gen.ToArbitrary(), async input =>
        {
            var builder = new ValidationContextBuilder();
            
            if (input.missingField != "weight") builder.WithField("weight", input.weight);
            if (input.missingField != "height") builder.WithField("height", input.height);
            if (input.missingField != "bmiEntered") builder.WithField("bmiEntered", input.entered);
            
            var context = builder.Build();
            var result = await EditChecks.BmiConsistency(context);
            
            return result is Result.Pass;
        });
    }
}
```

---

## 11. Performance Optimization

### 11.1 Lazy Loading Historical Data

```csharp
// Only load history if validator needs it
var context = new ValidationContext<FormData>(
    // ... other params
    _history: new Lazy<Task<IReadOnlyList<FormSnapshot>>>(
        async () => await forms.GetFormHistoryAsync(studyId, subjectId, formId)
    )
);

// Validators that don't need history don't trigger DB query
```

### 11.2 Caching Medical Coding Lookups

```csharp
// ViaLiq.EDC.MedicalCoding/CachedMedDRAService.cs
public class CachedMedDRAService : IMedDRAService
{
    private readonly IMedDRAService _inner;
    private readonly IMemoryCache _cache;
    
    public async Task<bool> IsValidPTAsync(string ptCode, string version)
    {
        var cacheKey = $"meddra:pt:{version}:{ptCode}";
        
        if (_cache.TryGetValue(cacheKey, out bool cachedResult))
            return cachedResult;
        
        var result = await _inner.IsValidPTAsync(ptCode, version);
        
        _cache.Set(cacheKey, result, TimeSpan.FromHours(24));
        
        return result;
    }
}
```

### 11.3 Parallel Validation Execution

```csharp
// Run independent checks in parallel
public async Task<ValidationResult> ValidateAsync(ValidationContext<FormData> context)
{
    var checks = new[]
    {
        EditChecks.BmiConsistency,
        EditChecks.CtcaeGradeOutcome,
        EditChecks.SaeNotificationRequired,
        EditChecks.MedDRAPTValid,
        // ... all checks
    };
    
    // Execute all checks in parallel
    var results = await Task.WhenAll(
        checks.Select(check => check(context))
    );
    
    // Collect failures
    var failures = results.OfType<Result.Fail>().ToList();
    var warnings = results.OfType<Result.Warn>().ToList();
    
    return new ValidationResult(
        IsValid: !failures.Any(),
        Errors: failures,
        Warnings: warnings
    );
}
```

### 11.4 Database Query Optimization

```csharp
// Use compiled queries for frequently executed queries
private static readonly Func<EdcDbContext, string, string, string, Task<FormEntity?>> 
    GetFormCompiled = EF.CompileAsyncQuery(
        (EdcDbContext db, string studyId, string subjectId, string formId) =>
            db.Forms
                .Where(f => 
                    f.StudyId == studyId && 
                    f.SubjectId == subjectId && 
                    f.FormId == formId)
                .OrderByDescending(f => f.SubmittedAt)
                .FirstOrDefault()
    );

// Use in repository
public async Task<Option<FormSnapshot>> GetFormAsync(
    string studyId, string subjectId, string formId)
{
    var form = await GetFormCompiled(_db, studyId, subjectId, formId);
    // ... map to FormSnapshot
}
```

---

## Appendix A: Full Example — Oncology Study Validator

Complete implementation for Study XYZ-001:

```csharp
// ViaLiq.EDC.Validation.Studies.StudyXYZ001/EditChecks.cs
namespace ViaLiq.EDC.Validation.Studies.StudyXYZ001;

public static class EditChecks
{
    public static IReadOnlyDictionary<string, EditCheck<FormData>> All { get; } = 
        new Dictionary<string, EditCheck<FormData>>
        {
            ["bmiConsistency"] = BmiConsistency,
            ["ctcaeGradeOutcome"] = CtcaeGradeOutcome,
            ["ecogPsRange"] = EcogPsRange,
            ["recistTargetLesionSum"] = RecistTargetLesionSum,
            ["saeNotificationRequired"] = SaeNotificationRequired,
            ["saeNotificationTimeline"] = SaeNotificationTimeline,
            ["meddraPTValid"] = MedDRAPTValid,
            ["meddraSOCConsistent"] = MedDRASOCConsistent,
            ["susarDetection"] = SUSARDetection,
            ["susarReportingTimeline"] = SUSARReportingTimeline,
            ["demographicsImmutable"] = DemographicsImmutable,
            ["visitWindowCompliance"] = VisitWindowCompliance,
            ["tumorResponseConfirmation"] = TumorResponseConfirmation,
        };
    
    // Individual checks implemented above...
    
    // Compose common patterns
    public static readonly EditCheck<FormData> AllSAEChecks =
        SaeNotificationRequired
            .And(SaeNotificationTimeline)
            .And(MedDRAPTValid)
            .And(SUSARDetection)
            .And(SUSARReportingTimeline);
}
```

---

## Appendix B: FP Helper Library

Reusable functional utilities:

```csharp
// ViaLiq.EDC.Validation/FP/Result.cs
public static class Result
{
    public static Task<Result> PassAsync() => 
        Task.FromResult<Result>(new Pass());
    
    public static Task<Result> FailAsync(string message) => 
        Task.FromResult<Result>(new Fail(message));
    
    public static Task<Result> WarnAsync(string message) => 
        Task.FromResult<Result>(new Warn(message));
    
    // Combine results
    public static Task<Result> All(params Task<Result>[] results) =>
        Task.WhenAll(results).ContinueWith(t =>
        {
            var failures = t.Result.OfType<Fail>().ToList();
            if (failures.Any())
                return (Result)new Fail(string.Join("; ", failures.Select(f => f.Message)));
            
            var warnings = t.Result.OfType<Warn>().ToList();
            if (warnings.Any())
                return (Result)new Warn(string.Join("; ", warnings.Select(w => w.Message)));
            
            return new Pass();
        });
}
```

---

**End of Document**

---

## Document Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-05-30 | Initial server-side implementation guide | Platform Team |
