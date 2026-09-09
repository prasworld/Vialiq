# Modern Angular Patterns

## Control Flow
Use modern Angular block syntax for structural directives.
**DO NOT** use `*ngIf`, `*ngFor`, or `*ngSwitch` and **DO NOT** import `CommonModule` just for these.
**ALWAYS** use `@if`, `@else`, `@for`, and `@switch`.

## Signal Inputs and Outputs
Use Angular Signal-based inputs and outputs.
**DO NOT** use `@Input()` or `@Output()` decorators.
**ALWAYS** use `input()`, `input.required()`, `output()`, and `model()`.

```typescript
// BAD
@Input() title = '';
@Input({ required: true }) id!: string;
@Output() titleChange = new EventEmitter<string>();

// GOOD
title = input('');
id = input.required<string>();
titleChange = output<string>();
```

## Dependency Injection
Use the `inject()` function for dependency injection.
**DO NOT** use constructor-based dependency injection.
**ALWAYS** use `inject()` at the property level or within a function context.

```typescript
// BAD
constructor(private formService: FormService) {}

// GOOD
private formService = inject(FormService);
```
