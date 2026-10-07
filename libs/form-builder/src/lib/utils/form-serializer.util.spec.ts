import { describe, it, expect } from 'vitest';
import { serializeForm } from './form-serializer.util';
import type { FormSchema } from '../types';

describe('serializeForm', () => {
  it('should project flat fields with primitives', () => {
    const schema: FormSchema = {
      id: 'f1',
      schemaVersion: '1',
      title: 'Test',
      display: 'form',
      createdAt: '',
      updatedAt: '',
      components: [
        { id: '1', type: 'text-input', key: 'firstName', label: 'First Name' },
        { id: '2', type: 'text-input', key: 'lastName', label: 'Last Name' },
      ],
    };

    const formValues = {
      firstName: 'John',
      lastName: 'Doe',
      unmappedField: 'Ignored', // Should be ignored as it's not in schema
    };

    const result = serializeForm(schema, formValues);
    expect(result).toEqual({
      firstName: 'John',
      lastName: 'Doe',
    });
  });

  it('should traverse layout components to find keys', () => {
    const schema: FormSchema = {
      id: 'f1',
      schemaVersion: '1',
      title: 'Test',
      display: 'form',
      createdAt: '',
      updatedAt: '',
      components: [
        {
          id: 'panel1',
          type: 'panel',
          label: 'Panel',
          layoutConfig: {} as any,
          components: [
            { id: '1', type: 'text-input', key: 'email', label: 'Email' },
          ],
        },
      ],
    };

    const result = serializeForm(schema, { email: 'test@test.com' });
    expect(result).toEqual({ email: 'test@test.com' });
  });

  it('should map FieldValue based on valueMapping', () => {
    const schema: FormSchema = {
      id: 'f1',
      schemaVersion: '1',
      title: 'Test',
      display: 'form',
      createdAt: '',
      updatedAt: '',
      components: [
        // Default (value)
        { id: '1', type: 'date', key: 'dob1', label: 'DOB1' },
        // Mapped to rawValue
        { id: '2', type: 'date', key: 'dob2', label: 'DOB2', valueMapping: 'rawValue' },
        // Mapped to displayValue
        { id: '3', type: 'date', key: 'dob3', label: 'DOB3', valueMapping: 'displayValue' },
      ],
    };

    const dateValue = {
      value: '2025-01-15',
      rawValue: { day: 15, month: 1, year: 2025 },
      displayValue: '15/01/2025',
    };

    const formValues = {
      dob1: dateValue,
      dob2: dateValue,
      dob3: dateValue,
    };

    const result = serializeForm(schema, formValues);
    expect(result).toEqual({
      dob1: '2025-01-15',
      dob2: { day: 15, month: 1, year: 2025 },
      dob3: '15/01/2025',
    });
  });

  it('should pass through null or undefined values', () => {
    const schema: FormSchema = {
      id: 'f1',
      schemaVersion: '1',
      title: 'Test',
      display: 'form',
      createdAt: '',
      updatedAt: '',
      components: [
        { id: '1', type: 'date', key: 'dob', label: 'DOB', valueMapping: 'rawValue' },
      ],
    };

    expect(serializeForm(schema, { dob: null })).toEqual({ dob: null });
    expect(serializeForm(schema, { dob: undefined })).toEqual({ dob: undefined });
  });
});
