import { Injectable } from '@angular/core';

@Injectable({
  providedIn: null
})
export class KeyGeneratorService {

  /**
   * Generates a camelCase key from a human-readable label.
   * E.g. "First Name" -> "firstName"
   * "Email Address 2!" -> "emailAddress2"
   */
  labelToKey(label: string): string {
    if (!label) return '';
    
    // Remove non-alphanumeric characters except spaces
    const cleanLabel = label.replace(/[^a-zA-Z0-9 ]/g, '');
    
    // Split by spaces, capitalize words except the first, and join
    const words = cleanLabel.split(/\s+/).filter(w => w.length > 0);
    
    if (words.length === 0) return '';
    
    const camelCase = words.map((word, index) => {
      const lowerWord = word.toLowerCase();
      if (index === 0) {
        return lowerWord;
      }
      return lowerWord.charAt(0).toUpperCase() + lowerWord.slice(1);
    }).join('');
    
    return camelCase;
  }

  /**
   * Deduplicates a key against an array of existing keys.
   * If "firstName" exists, it generates "firstName2", "firstName3", etc.
   */
  deduplicateKey(baseKey: string, existingKeys: Set<string> | string[]): string {
    const existing = new Set(existingKeys);
    if (!baseKey) return '';
    if (!existing.has(baseKey)) {
      return baseKey;
    }

    let counter = 2;
    let newKey = `${baseKey}${counter}`;
    
    while (existing.has(newKey)) {
      counter++;
      newKey = `${baseKey}${counter}`;
    }
    
    return newKey;
  }
}
