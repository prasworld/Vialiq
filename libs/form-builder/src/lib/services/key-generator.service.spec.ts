import { KeyGeneratorService } from './key-generator.service';

describe('KeyGeneratorService', () => {
  let service: KeyGeneratorService;

  beforeEach(() => {
    service = new KeyGeneratorService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('labelToKey', () => {
    it('should convert simple label to camelCase', () => {
      expect(service.labelToKey('First Name')).toBe('firstName');
      expect(service.labelToKey('Last Name')).toBe('lastName');
    });

    it('should strip special characters', () => {
      expect(service.labelToKey('Email Address 2!')).toBe('emailAddress2');
      expect(service.labelToKey('Phone # (Mobile)')).toBe('phoneMobile');
    });

    it('should handle single words', () => {
      expect(service.labelToKey('Submit')).toBe('submit');
      expect(service.labelToKey('AGE')).toBe('age');
    });

    it('should handle empty or undefined strings', () => {
      expect(service.labelToKey('')).toBe('');
      expect(service.labelToKey(undefined as any)).toBe('');
    });
  });

  describe('deduplicateKey', () => {
    it('should return base key if it does not exist', () => {
      expect(service.deduplicateKey('firstName', ['lastName'])).toBe('firstName');
    });

    it('should append a number if key exists', () => {
      expect(service.deduplicateKey('firstName', ['firstName'])).toBe('firstName2');
    });

    it('should increment number until a unique key is found', () => {
      expect(service.deduplicateKey('firstName', ['firstName', 'firstName2', 'firstName3'])).toBe('firstName4');
    });

    it('should work with a Set', () => {
      expect(service.deduplicateKey('age', new Set(['age', 'age2']))).toBe('age3');
    });
  });
});
