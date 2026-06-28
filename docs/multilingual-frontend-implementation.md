# Multilingual Frontend Implementation (i18n)

**Version:** 1.0  
**Last Updated:** May 31, 2026  
**Status:** 🚧 In Progress

---

## Table of Contents

1. [Overview](#1-overview)
2. [Architecture](#2-architecture)
3. [Static Content Translation (Product Features)](#3-static-content-translation-product-features)
4. [Dynamic Content Translation (Study Metadata)](#4-dynamic-content-translation-study-metadata)
5. [Locale Detection & Language Switching](#5-locale-detection--language-switching)
6. [Translation Provider Plugin System](#6-translation-provider-plugin-system)
7. [Built-in Translation Providers](#7-built-in-translation-providers)
   - 7.1 [Google Cloud Translation](#71-google-cloud-translation)
   - 7.2 [AWS Translate](#72-aws-translate)
   - 7.3 [DeepL Translator](#73-deepl-translator)
   - 7.4 [Custom Provider (Plugin Example)](#74-custom-provider-plugin-example)
   - 7.5 [**Custom Provider: Complete Implementation Guide (Module Federation)**](#75-custom-provider-complete-implementation-guide-module-federation) ⭐ **NEW**
8. [Study Configuration](#8-study-configuration)
9. [Real-World Usage Scenarios](#9-real-world-usage-scenarios)
10. [Performance Optimization](#10-performance-optimization)
11. [Regulatory Compliance](#11-regulatory-compliance)
12. [Implementation Guide](#12-implementation-guide)

---

## 1. Overview

### 1.1 Problem Statement

**Clinical trials are global**, requiring support for multiple languages:

- **Multinational studies** conduct trials in 10-50 countries simultaneously
- **Site staff** speak different languages (English, French, Spanish, German, Japanese, etc.)
- **Regulatory requirements** mandate data submission in specific base language
- **Consistency is critical** for data quality and compliance

**Example: Oncology Study**
- **Study Languages:** English (en), French (fr), Spanish (es)
- **Base Language:** English (for FDA submission)
- **Sites:** 30 sites across USA, France, Spain, Mexico
- **Users:** 150+ site staff with varying language proficiency

### 1.2 Two-Tier Translation Model

```typescript
┌─────────────────────────────────────────────────────────────────────┐
│                    MULTILINGUAL EDC PLATFORM                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────────────────────────────────────────────────┐    │
│  │  TIER 1: Static Content (Product Features)                │    │
│  │  ─────────────────────────────────────────────────────────│    │
│  │  • UI Labels: "Save", "Cancel", "Submit"                  │    │
│  │  • Buttons: "Add Field", "Delete Form"                    │    │
│  │  • Error Messages: "Field is required"                    │    │
│  │  • Tooltips: "Click to edit"                              │    │
│  │  • Navigation: "Dashboard", "Settings"                    │    │
│  │                                                            │    │
│  │  Translation Method: Angular i18n (compile-time)          │    │
│  │  Files: messages.en.json, messages.fr.json                │    │
│  │  Scope: ALL product UI across all studies                 │    │
│  └───────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────┐    │
│  │  TIER 2: Dynamic Content (Study Metadata)                 │    │
│  │  ─────────────────────────────────────────────────────────│    │
│  │  • Form Names: "Vital Signs", "Adverse Events"            │    │
│  │  • Field Labels: "Weight (kg)", "Blood Pressure"          │    │
│  │  • Visit Names: "Screening", "Week 4 Follow-up"           │    │
│  │  • Dropdown Options: "Male", "Female", "Other"            │    │
│  │  • Instructions: "Measure after 5 min rest"               │    │
│  │                                                            │    │
│  │  Translation Method: Runtime via Translation Service      │    │
│  │  Storage: Database (per study, per language)              │    │
│  │  Scope: Study-specific configuration                      │    │
│  └───────────────────────────────────────────────────────────┘    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.3 Key Requirements

| Requirement | Implementation | Priority |
|-------------|----------------|----------|
| **Multiple Languages per Study** | Study config defines supported locales | ✅ Critical |
| **Browser Locale Detection** | Angular service detects browser language | ✅ Critical |
| **Language Switching** | User can override browser default | ✅ Critical |
| **Display Labels Translated** | All UI text in user's language | ✅ Critical |
| **Values in Base Language** | Data always stored/submitted in English | ✅ Critical |
| **Auto-Translation** | Optional AI-powered translation | 🔶 High |
| **Translation Provider Plugins** | Extensible provider system (Google, AWS, DeepL) | 🔶 High |
| **Offline Support** | Cached translations via Service Worker | 🔵 Medium |
| **RTL Support** | Right-to-left languages (Arabic, Hebrew) | 🔵 Medium |

### 1.4 Regulatory Considerations

**⚠️ CRITICAL: Values vs Labels**

```typescript
// ✅ CORRECT: Labels translated, values in base language
{
  "fieldName": "gender",
  "fieldLabel_en": "Gender",
  "fieldLabel_fr": "Sexe",
  "fieldLabel_es": "Género",
  "value": "MALE",              // ✅ Always English (FDA submission)
  "displayValue_en": "Male",
  "displayValue_fr": "Homme",
  "displayValue_es": "Masculino"
}

// ❌ WRONG: Values translated (breaks data integrity)
{
  "fieldName": "gender",
  "value": "Homme"  // ❌ French value = data corruption
}
```

**Why This Matters:**
- FDA requires English data submission
- Data analysis/queries use English values
- CDASH/SDTM standards mandate English coding
- Cross-study consistency requires fixed vocabulary

---

## 2. Architecture

### 2.1 System Components

```typescript
┌─────────────────────────────────────────────────────────────────────┐
│                         Angular Application                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────┐      ┌──────────────────────────┐    │
│  │  LocaleDetectionService │      │  LanguageSwitcherService │    │
│  │  ─────────────────────  │      │  ──────────────────────  │    │
│  │  • navigator.language    │◄────►│  • setLocale(lang)       │    │
│  │  • Accept-Language       │      │  • getLocale()           │    │
│  │  • User preference       │      │  • supportedLocales      │    │
│  └─────────────────────────┘      └──────────────────────────┘    │
│              │                                  │                   │
│              ▼                                  ▼                   │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │           TranslationService (Dynamic Content)           │     │
│  │  ──────────────────────────────────────────────────────  │     │
│  │  • loadStudyTranslations(studyId, locale)                │     │
│  │  • translate(key, locale?)                               │     │
│  │  • autoTranslate(text, targetLocale)                     │     │
│  └──────────────────────────────────────────────────────────┘     │
│              │                                                      │
│              ▼                                                      │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │      Translation Provider Plugin System (DI-based)       │     │
│  │  ──────────────────────────────────────────────────────  │     │
│  │                                                           │     │
│  │  ┌─────────────────────────────────────────────────┐    │     │
│  │  │  ITranslationProvider (Interface)               │    │     │
│  │  │  ───────────────────────────────────────────────│    │     │
│  │  │  + translate(text, from, to): Promise<string>   │    │     │
│  │  │  + detectLanguage(text): Promise<string>        │    │     │
│  │  │  + getSupportedLanguages(): string[]            │    │     │
│  │  └─────────────────────────────────────────────────┘    │     │
│  │                         ▲                                 │     │
│  │           ┌─────────────┼─────────────┐                 │     │
│  │           │             │             │                  │     │
│  │  ┌────────────┐  ┌──────────┐  ┌─────────────┐         │     │
│  │  │  Google    │  │   AWS    │  │   DeepL     │         │     │
│  │  │  Translate │  │ Translate│  │  Translate  │         │     │
│  │  └────────────┘  └──────────┘  └─────────────┘         │     │
│  │                                                           │     │
│  │  ┌─────────────────────────────────────────────────┐    │     │
│  │  │  CustomTranslationProvider (Plugin)              │    │     │
│  │  │  • Loaded via Module Federation                  │    │     │
│  │  │  • Implements ITranslationProvider                │    │     │
│  │  │  • Registered via TranslationProviderRegistry    │    │     │
│  │  └─────────────────────────────────────────────────┘    │     │
│  └──────────────────────────────────────────────────────────┘     │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │              HTTP Interceptor                            │     │
│  │  ──────────────────────────────────────────────────────  │     │
│  │  • Add Accept-Language header to all API calls           │     │
│  │  • Add X-Study-Locale header for study-specific APIs     │     │
│  └──────────────────────────────────────────────────────────┘     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Backend API     │
                    │  ──────────────  │
                    │  • Reads locale  │
                    │  • Returns data  │
                    │    in that lang  │
                    └──────────────────┘
```

### 2.2 Data Model

**Study Configuration:**

```typescript
// Study with multilingual support
interface StudyConfiguration {
  studyId: string;
  studyName: string;
  
  // Multilingual settings
  i18n: StudyI18nConfiguration;
  
  // ... other study config
}

interface StudyI18nConfiguration {
  // Base language for data submission (e.g., "en" for FDA)
  baseLanguage: string; // ISO 639-1 code
  
  // Supported languages for this study
  supportedLanguages: string[]; // ["en", "fr", "es", "de", "ja"]
  
  // Default language (usually same as base)
  defaultLanguage: string;
  
  // Auto-translation settings
  autoTranslation: {
    enabled: boolean;
    provider: string; // "google" | "aws" | "deepl" | "custom"
    autoTranslateOnCreate: boolean; // Auto-translate when creating new forms/fields
    requireReview: boolean; // Human review required before publishing
  };
  
  // RTL (Right-to-Left) support
  rtlLanguages: string[]; // ["ar", "he"] for Arabic, Hebrew
  
  // Locale-specific formatting
  formatting: {
    dateFormat: Record<string, string>; // { "en": "MM/DD/YYYY", "fr": "DD/MM/YYYY" }
    numberFormat: Record<string, string>; // { "en": "1,234.56", "fr": "1 234,56" }
    timeFormat: Record<string, string>; // { "en": "12h", "fr": "24h" }
  };
}
```

**Multilingual Field Definition:**

```typescript
interface FormFieldConfiguration {
  fieldName: string; // Technical name (always English)
  fieldType: 'text' | 'number' | 'date' | 'dropdown';
  
  // Multilingual labels (display text)
  labels: Record<string, string>; // { "en": "Weight (kg)", "fr": "Poids (kg)", "es": "Peso (kg)" }
  
  // Multilingual help text
  helpText: Record<string, string>;
  
  // Multilingual placeholders
  placeholders: Record<string, string>;
  
  // For dropdowns: multilingual options
  options?: DropdownOption[];
}

interface DropdownOption {
  value: string; // ✅ Always in base language (e.g., "MALE", "FEMALE")
  
  // Multilingual display labels
  labels: Record<string, string>; // { "en": "Male", "fr": "Homme", "es": "Masculino" }
  
  // Optional: CDASH/CDISC codes
  cdiscCode?: string; // "M", "F", "U"
}
```

**Example: Multilingual Form**

```json
{
  "formId": "vital_signs_v1",
  "formName_en": "Vital Signs",
  "formName_fr": "Signes Vitaux",
  "formName_es": "Signos Vitales",
  
  "instructions_en": "Measure after 5 minutes of rest",
  "instructions_fr": "Mesurer après 5 minutes de repos",
  "instructions_es": "Medir después de 5 minutos de reposo",
  
  "fields": [
    {
      "fieldName": "weight",
      "fieldType": "number",
      "labels": {
        "en": "Weight (kg)",
        "fr": "Poids (kg)",
        "es": "Peso (kg)"
      },
      "helpText": {
        "en": "Measure without shoes",
        "fr": "Mesurer sans chaussures",
        "es": "Medir sin zapatos"
      }
    },
    {
      "fieldName": "gender",
      "fieldType": "dropdown",
      "labels": {
        "en": "Gender",
        "fr": "Sexe",
        "es": "Género"
      },
      "options": [
        {
          "value": "MALE",
          "labels": {
            "en": "Male",
            "fr": "Homme",
            "es": "Masculino"
          },
          "cdiscCode": "M"
        },
        {
          "value": "FEMALE",
          "labels": {
            "en": "Female",
            "fr": "Femme",
            "es": "Femenino"
          },
          "cdiscCode": "F"
        }
      ]
    }
  ]
}
```

---

## 3. Static Content Translation (Product Features)

### 3.1 Angular i18n Setup

**Purpose:** Translate static UI text (buttons, labels, error messages) at compile-time

**Implementation:**

```typescript
// 1. Mark translatable text in templates
// libs/form-builder/src/lib/components/form-editor.component.html
<h2 i18n="@@formEditor.title">Form Editor</h2>

<button 
  type="button" 
  i18n="@@common.save"
>
  Save
</button>

<button 
  type="button" 
  i18n="@@common.cancel"
>
  Cancel
</button>

<div class="error" i18n="@@validation.required">
  This field is required
</div>

// 2. Extract translations
// Run: ng extract-i18n --output-path src/locales
// Generates: src/locales/messages.xlf (base file)
```

**Translation Files Structure:**

```
libs/
  form-builder/
    src/
      locales/
        messages.xlf               # Base file (English)
        messages.fr.xlf            # French translations
        messages.es.xlf            # Spanish translations
        messages.de.xlf            # German translations
        messages.ja.xlf            # Japanese translations
```

**Example Translation File (messages.fr.xlf):**

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en" trgLang="fr">
  <file id="ngi18n" original="ng.template">
    <unit id="formEditor.title">
      <segment>
        <source>Form Editor</source>
        <target>Éditeur de Formulaire</target>
      </segment>
    </unit>
    <unit id="common.save">
      <segment>
        <source>Save</source>
        <target>Enregistrer</target>
      </segment>
    </unit>
    <unit id="common.cancel">
      <segment>
        <source>Cancel</source>
        <target>Annuler</target>
      </segment>
    </unit>
    <unit id="validation.required">
      <segment>
        <source>This field is required</source>
        <target>Ce champ est obligatoire</target>
      </segment>
    </unit>
  </file>
</xliff>
```

### 3.2 Build Configuration

**angular.json:**

```json
{
  "projects": {
    "form-builder": {
      "i18n": {
        "sourceLocale": "en",
        "locales": {
          "fr": "libs/form-builder/src/locales/messages.fr.xlf",
          "es": "libs/form-builder/src/locales/messages.es.xlf",
          "de": "libs/form-builder/src/locales/messages.de.xlf",
          "ja": "libs/form-builder/src/locales/messages.ja.xlf"
        }
      },
      "architect": {
        "build": {
          "configurations": {
            "production-fr": {
              "localize": ["fr"]
            },
            "production-es": {
              "localize": ["es"]
            },
            "production-all": {
              "localize": true
            }
          }
        }
      }
    }
  }
}
```

**Build Output:**

```bash
# Single locale build
npm run build -- --configuration=production-fr
# Output: dist/form-builder/fr/

# All locales build
npm run build -- --configuration=production-all
# Output:
#   dist/form-builder/en/
#   dist/form-builder/fr/
#   dist/form-builder/es/
#   dist/form-builder/de/
#   dist/form-builder/ja/
```

### 3.3 Runtime Locale Detection

**Option A: Separate Builds (Recommended for Production)**

```typescript
// Each locale served from different URL
// https://edc.example.com/en/
// https://edc.example.com/fr/
// https://edc.example.com/es/

// Server routes based on Accept-Language header or subdomain
```

**Option B: Single Build with Runtime Locale (Development)**

```typescript
// libs/shared/src/lib/services/locale.service.ts
import { Injectable, LOCALE_ID, Inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocaleService {
  constructor(@Inject(LOCALE_ID) private localeId: string) {}
  
  getCurrentLocale(): string {
    return this.localeId;
  }
  
  getSupportedLocales(): string[] {
    return ['en', 'fr', 'es', 'de', 'ja'];
  }
}
```

---

## 4. Dynamic Content Translation (Study Metadata)

### 4.1 Translation Service

**Purpose:** Translate study-specific content (form names, field labels) at runtime

```typescript
// libs/shared/src/lib/services/translation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';

export interface TranslationDictionary {
  [key: string]: string; // Key-value pairs for translations
}

export interface StudyTranslations {
  studyId: string;
  locale: string;
  translations: TranslationDictionary;
  lastUpdated: Date;
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private readonly API_BASE = '/api/translations';
  
  // Cache translations per study per locale
  private translationCache = new Map<string, StudyTranslations>();
  
  // Current active locale
  private currentLocale: string = 'en';
  
  // Current study ID
  private currentStudyId?: string;
  
  constructor(private http: HttpClient) {}
  
  /**
   * Load translations for a study in specific locale
   */
  loadStudyTranslations(
    studyId: string,
    locale: string
  ): Observable<StudyTranslations> {
    const cacheKey = `${studyId}:${locale}`;
    
    // Check cache
    if (this.translationCache.has(cacheKey)) {
      console.log(`[Translation] Using cached translations for ${cacheKey}`);
      return of(this.translationCache.get(cacheKey)!);
    }
    
    // Load from server
    console.log(`[Translation] Loading translations for ${cacheKey}`);
    
    return this.http
      .get<StudyTranslations>(`${this.API_BASE}/study/${studyId}/locale/${locale}`)
      .pipe(
        tap(translations => {
          // Cache for future use
          this.translationCache.set(cacheKey, translations);
          
          // Set as current if matching study
          if (studyId === this.currentStudyId) {
            this.currentLocale = locale;
          }
        }),
        shareReplay(1)
      );
  }
  
  /**
   * Set current study and locale
   */
  setContext(studyId: string, locale: string): void {
    this.currentStudyId = studyId;
    this.currentLocale = locale;
    
    // Pre-load translations
    this.loadStudyTranslations(studyId, locale).subscribe();
  }
  
  /**
   * Translate a key for current study/locale
   * 
   * @param key Translation key (e.g., "form.vital_signs.title")
   * @param locale Override locale (optional)
   * @param fallback Fallback text if translation not found
   */
  translate(key: string, locale?: string, fallback?: string): string {
    const targetLocale = locale || this.currentLocale;
    
    if (!this.currentStudyId) {
      console.warn('[Translation] No study context set');
      return fallback || key;
    }
    
    const cacheKey = `${this.currentStudyId}:${targetLocale}`;
    const translations = this.translationCache.get(cacheKey);
    
    if (!translations) {
      console.warn(`[Translation] Translations not loaded for ${cacheKey}`);
      return fallback || key;
    }
    
    const translated = translations.translations[key];
    
    if (!translated) {
      console.warn(`[Translation] Key not found: ${key}`);
      return fallback || key;
    }
    
    return translated;
  }
  
  /**
   * Translate multilingual object (e.g., { en: "...", fr: "...", es: "..." })
   */
  translateMultilingual(
    multilingualText: Record<string, string>,
    locale?: string
  ): string {
    const targetLocale = locale || this.currentLocale;
    
    // Try exact locale match
    if (multilingualText[targetLocale]) {
      return multilingualText[targetLocale];
    }
    
    // Try language-only match (e.g., "en" for "en-US")
    const languageOnly = targetLocale.split('-')[0];
    if (multilingualText[languageOnly]) {
      return multilingualText[languageOnly];
    }
    
    // Fallback to English
    if (multilingualText['en']) {
      return multilingualText['en'];
    }
    
    // Return first available translation
    const firstKey = Object.keys(multilingualText)[0];
    return multilingualText[firstKey] || '';
  }
  
  /**
   * Auto-translate text using configured provider
   */
  async autoTranslate(
    text: string,
    targetLocale: string,
    sourceLocale: string = 'en'
  ): Promise<string> {
    if (!this.currentStudyId) {
      throw new Error('No study context set for auto-translation');
    }
    
    console.log(`[Translation] Auto-translating from ${sourceLocale} to ${targetLocale}`);
    
    // Call auto-translation API (delegates to configured provider)
    const result = await this.http.post<{ translatedText: string }>(
      `${this.API_BASE}/auto-translate`,
      {
        studyId: this.currentStudyId,
        text,
        sourceLocale,
        targetLocale
      }
    ).toPromise();
    
    return result!.translatedText;
  }
  
  /**
   * Clear cache (useful for hot-reload or language switch)
   */
  clearCache(studyId?: string, locale?: string): void {
    if (studyId && locale) {
      this.translationCache.delete(`${studyId}:${locale}`);
    } else if (studyId) {
      // Clear all locales for study
      for (const key of this.translationCache.keys()) {
        if (key.startsWith(`${studyId}:`)) {
          this.translationCache.delete(key);
        }
      }
    } else {
      // Clear all
      this.translationCache.clear();
    }
  }
  
  /**
   * Get current locale
   */
  getCurrentLocale(): string {
    return this.currentLocale;
  }
  
  /**
   * Set current locale
   */
  setCurrentLocale(locale: string): void {
    this.currentLocale = locale;
    
    // Reload translations if study context set
    if (this.currentStudyId) {
      this.loadStudyTranslations(this.currentStudyId, locale).subscribe();
    }
  }
}
```

### 4.2 Translation Pipe

**Purpose:** Easy translation in templates

```typescript
// libs/shared/src/lib/pipes/translate.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { TranslationService } from '../services/translation.service';

@Pipe({
  name: 'translate',
  pure: false // Re-evaluate when locale changes
})
export class TranslatePipe implements PipeTransform {
  constructor(private translationService: TranslationService) {}
  
  transform(key: string, fallback?: string): string {
    return this.translationService.translate(key, undefined, fallback);
  }
}

@Pipe({
  name: 'translateMultilingual',
  pure: false
})
export class TranslateMultilingualPipe implements PipeTransform {
  constructor(private translationService: TranslationService) {}
  
  transform(multilingualText: Record<string, string> | undefined): string {
    if (!multilingualText) {
      return '';
    }
    
    return this.translationService.translateMultilingual(multilingualText);
  }
}
```

**Usage in Templates:**

```typescript
// Form editor component
<h2>{{ 'form.vital_signs.title' | translate:'Vital Signs' }}</h2>

<label>
  {{ field.labels | translateMultilingual }}
</label>

<p class="help-text">
  {{ field.helpText | translateMultilingual }}
</p>
```

---

## 5. Locale Detection & Language Switching

### 5.1 Locale Detection Service

```typescript
// libs/shared/src/lib/services/locale-detection.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface LocalePreference {
  locale: string;
  source: 'browser' | 'user' | 'study-default';
}

@Injectable({
  providedIn: 'root'
})
export class LocaleDetectionService {
  private readonly STORAGE_KEY = 'user-locale-preference';
  
  private localeSubject = new BehaviorSubject<LocalePreference>({
    locale: 'en',
    source: 'browser'
  });
  
  public locale$ = this.localeSubject.asObservable();
  
  constructor() {
    this.detectLocale();
  }
  
  /**
   * Detect locale from multiple sources (priority order):
   * 1. User preference (from localStorage)
   * 2. Browser language (navigator.language)
   * 3. Accept-Language header (from backend)
   * 4. Study default language
   * 5. Platform default (English)
   */
  private detectLocale(): void {
    // 1. Check user preference
    const userPref = this.getUserPreference();
    if (userPref) {
      this.setLocale(userPref, 'user');
      return;
    }
    
    // 2. Check browser language
    const browserLang = this.getBrowserLanguage();
    if (browserLang) {
      this.setLocale(browserLang, 'browser');
      return;
    }
    
    // 3. Default to English
    this.setLocale('en', 'browser');
  }
  
  /**
   * Get browser language from navigator
   */
  private getBrowserLanguage(): string | null {
    if (!navigator.language) {
      return null;
    }
    
    // Extract language code (e.g., "en" from "en-US")
    const lang = navigator.language.split('-')[0];
    
    console.log(`[LocaleDetection] Browser language: ${lang}`);
    
    return lang;
  }
  
  /**
   * Get user's saved preference
   */
  private getUserPreference(): string | null {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    
    if (saved) {
      console.log(`[LocaleDetection] User preference: ${saved}`);
      return saved;
    }
    
    return null;
  }
  
  /**
   * Set current locale
   */
  setLocale(locale: string, source: LocalePreference['source']): void {
    console.log(`[LocaleDetection] Setting locale: ${locale} (source: ${source})`);
    
    this.localeSubject.next({ locale, source });
    
    // Save user preference
    if (source === 'user') {
      localStorage.setItem(this.STORAGE_KEY, locale);
    }
  }
  
  /**
   * Get current locale
   */
  getCurrentLocale(): string {
    return this.localeSubject.value.locale;
  }
  
  /**
   * Check if locale is supported by study
   */
  isSupportedLocale(locale: string, supportedLocales: string[]): boolean {
    return supportedLocales.includes(locale);
  }
  
  /**
   * Get best matching locale from supported list
   */
  getBestMatchingLocale(
    requestedLocale: string,
    supportedLocales: string[]
  ): string {
    // Exact match
    if (supportedLocales.includes(requestedLocale)) {
      return requestedLocale;
    }
    
    // Language-only match (e.g., "en" for "en-US")
    const languageOnly = requestedLocale.split('-')[0];
    const languageMatch = supportedLocales.find(l => l.startsWith(languageOnly));
    if (languageMatch) {
      return languageMatch;
    }
    
    // Fallback to first supported locale (usually English)
    return supportedLocales[0];
  }
}
```

### 5.2 Language Switcher Component

```typescript
// libs/shared/src/lib/components/language-switcher.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { LocaleDetectionService } from '../services/locale-detection.service';
import { TranslationService } from '../services/translation.service';

@Component({
  selector: 'app-language-switcher',
  template: `
    <div class="language-switcher">
      <label for="language-select" i18n="@@languageSwitcher.label">
        Language:
      </label>
      
      <select 
        id="language-select"
        [value]="currentLocale"
        (change)="onLanguageChange($event)"
        class="language-select"
      >
        <option 
          *ngFor="let lang of supportedLanguages" 
          [value]="lang.code"
        >
          {{ lang.nativeName }}
        </option>
      </select>
      
      <span class="locale-source" *ngIf="showSource">
        ({{ localeSource }})
      </span>
    </div>
  `,
  styles: [`
    .language-switcher {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .language-select {
      padding: 8px 12px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
    }
    
    .locale-source {
      font-size: 12px;
      color: #666;
      font-style: italic;
    }
  `]
})
export class LanguageSwitcherComponent implements OnInit {
  @Input() supportedLanguages: Array<{ code: string; name: string; nativeName: string }> = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
    { code: 'he', name: 'Hebrew', nativeName: 'עברית' }
  ];
  
  @Input() showSource: boolean = false; // Show "(browser)" or "(user)" indicator
  
  currentLocale: string = 'en';
  localeSource: string = 'browser';
  
  constructor(
    private localeDetectionService: LocaleDetectionService,
    private translationService: TranslationService
  ) {}
  
  ngOnInit(): void {
    // Subscribe to locale changes
    this.localeDetectionService.locale$.subscribe(pref => {
      this.currentLocale = pref.locale;
      this.localeSource = pref.source;
    });
  }
  
  onLanguageChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newLocale = select.value;
    
    console.log(`[LanguageSwitcher] User selected: ${newLocale}`);
    
    // Update locale detection service
    this.localeDetectionService.setLocale(newLocale, 'user');
    
    // Update translation service
    this.translationService.setCurrentLocale(newLocale);
    
    // Reload page to apply new locale (for static content)
    // In production, this would navigate to localized URL
    // window.location.href = `/${newLocale}${window.location.pathname}`;
  }
}
```

### 5.3 HTTP Interceptor (Locale Header)

```typescript
// libs/shared/src/lib/interceptors/locale.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { LocaleDetectionService } from '../services/locale-detection.service';

@Injectable()
export class LocaleInterceptor implements HttpInterceptor {
  constructor(private localeDetectionService: LocaleDetectionService) {}
  
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Get current locale
    const locale = this.localeDetectionService.getCurrentLocale();
    
    // Clone request and add locale headers
    const clonedReq = req.clone({
      setHeaders: {
        'Accept-Language': locale,
        'X-Study-Locale': locale // Custom header for study-specific APIs
      }
    });
    
    return next.handle(clonedReq);
  }
}
```

---

## 6. Translation Provider Plugin System

### 6.1 Provider Interface

```typescript
// libs/shared/src/lib/translation-providers/translation-provider.interface.ts
export interface ITranslationProvider {
  /**
   * Provider unique identifier
   */
  readonly providerId: string;
  
  /**
   * Provider display name
   */
  readonly providerName: string;
  
  /**
   * Initialize provider with configuration
   */
  initialize(config: TranslationProviderConfig): Promise<void>;
  
  /**
   * Translate text from source language to target language
   * 
   * @param text Text to translate
   * @param sourceLanguage Source language code (ISO 639-1)
   * @param targetLanguage Target language code (ISO 639-1)
   * @returns Translated text
   */
  translate(
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<string>;
  
  /**
   * Translate multiple texts in batch (more efficient)
   */
  translateBatch(
    texts: string[],
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<string[]>;
  
  /**
   * Detect language of given text
   */
  detectLanguage(text: string): Promise<string>;
  
  /**
   * Get list of supported languages
   */
  getSupportedLanguages(): string[];
  
  /**
   * Check if provider is properly configured
   */
  isConfigured(): boolean;
  
  /**
   * Get provider health status
   */
  getHealthStatus(): Promise<ProviderHealthStatus>;
}

export interface TranslationProviderConfig {
  // API credentials
  apiKey?: string;
  apiSecret?: string;
  
  // Endpoint configuration
  apiEndpoint?: string;
  
  // Rate limiting
  maxRequestsPerMinute?: number;
  
  // Retry configuration
  maxRetries?: number;
  retryDelay?: number;
  
  // Custom settings (provider-specific)
  customSettings?: Record<string, any>;
}

export interface ProviderHealthStatus {
  isHealthy: boolean;
  message: string;
  lastChecked: Date;
  responseTime?: number; // milliseconds
}
```

### 6.2 Translation Provider Registry

```typescript
// libs/shared/src/lib/translation-providers/translation-provider.registry.ts
import { Injectable, Injector } from '@angular/core';
import { ITranslationProvider } from './translation-provider.interface';

@Injectable({
  providedIn: 'root'
})
export class TranslationProviderRegistry {
  // Registered providers
  private providers = new Map<string, ITranslationProvider>();
  
  // Active provider for current study
  private activeProviderId?: string;
  
  constructor(private injector: Injector) {}
  
  /**
   * Register a translation provider
   */
  register(provider: ITranslationProvider): void {
    console.log(`[TranslationProviderRegistry] Registering provider: ${provider.providerId}`);
    
    if (this.providers.has(provider.providerId)) {
      console.warn(`[TranslationProviderRegistry] Provider already registered: ${provider.providerId}`);
      return;
    }
    
    this.providers.set(provider.providerId, provider);
  }
  
  /**
   * Unregister a provider
   */
  unregister(providerId: string): void {
    console.log(`[TranslationProviderRegistry] Unregistering provider: ${providerId}`);
    this.providers.delete(providerId);
  }
  
  /**
   * Get provider by ID
   */
  getProvider(providerId: string): ITranslationProvider | undefined {
    return this.providers.get(providerId);
  }
  
  /**
   * Get active provider
   */
  getActiveProvider(): ITranslationProvider | undefined {
    if (!this.activeProviderId) {
      console.warn('[TranslationProviderRegistry] No active provider set');
      return undefined;
    }
    
    return this.providers.get(this.activeProviderId);
  }
  
  /**
   * Set active provider
   */
  setActiveProvider(providerId: string): void {
    if (!this.providers.has(providerId)) {
      throw new Error(`Provider not found: ${providerId}`);
    }
    
    const provider = this.providers.get(providerId)!;
    
    if (!provider.isConfigured()) {
      throw new Error(`Provider not configured: ${providerId}`);
    }
    
    console.log(`[TranslationProviderRegistry] Setting active provider: ${providerId}`);
    this.activeProviderId = providerId;
  }
  
  /**
   * Get all registered providers
   */
  getAllProviders(): ITranslationProvider[] {
    return Array.from(this.providers.values());
  }
  
  /**
   * Get provider IDs
   */
  getProviderIds(): string[] {
    return Array.from(this.providers.keys());
  }
}
```

### 6.3 Auto-Translation Service (Using Active Provider)

```typescript
// libs/shared/src/lib/services/auto-translation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslationProviderRegistry } from '../translation-providers/translation-provider.registry';
import { ITranslationProvider } from '../translation-providers/translation-provider.interface';

export interface AutoTranslationRequest {
  studyId: string;
  sourceText: Record<string, string>; // { "en": "Weight (kg)" }
  targetLanguages: string[]; // ["fr", "es", "de"]
  sourceLanguage: string; // "en"
  requireReview?: boolean; // Default: true
}

export interface AutoTranslationResult {
  translations: Record<string, string>; // { "fr": "Poids (kg)", "es": "Peso (kg)", ... }
  confidence: Record<string, number>; // { "fr": 0.98, "es": 0.95, ... }
  provider: string;
  timestamp: Date;
  requiresReview: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AutoTranslationService {
  constructor(
    private providerRegistry: TranslationProviderRegistry,
    private http: HttpClient
  ) {}
  
  /**
   * Auto-translate text to multiple target languages
   */
  async autoTranslate(
    request: AutoTranslationRequest
  ): Promise<AutoTranslationResult> {
    console.log('[AutoTranslation] Starting auto-translation');
    console.log(`  Source: ${request.sourceLanguage}`);
    console.log(`  Targets: ${request.targetLanguages.join(', ')}`);
    
    // Get active provider
    const provider = this.providerRegistry.getActiveProvider();
    
    if (!provider) {
      throw new Error('No active translation provider configured');
    }
    
    // Get source text
    const sourceText = request.sourceText[request.sourceLanguage];
    
    if (!sourceText) {
      throw new Error(`Source text not found for language: ${request.sourceLanguage}`);
    }
    
    // Translate to each target language
    const translations: Record<string, string> = {};
    const confidence: Record<string, number> = {};
    
    for (const targetLang of request.targetLanguages) {
      try {
        const translated = await provider.translate(
          sourceText,
          request.sourceLanguage,
          targetLang
        );
        
        translations[targetLang] = translated;
        confidence[targetLang] = 0.95; // Default confidence (provider-specific)
        
        console.log(`  ✓ ${targetLang}: ${translated}`);
      } catch (error) {
        console.error(`  ✗ ${targetLang}: Translation failed`, error);
        translations[targetLang] = sourceText; // Fallback to source text
        confidence[targetLang] = 0.0;
      }
    }
    
    return {
      translations,
      confidence,
      provider: provider.providerId,
      timestamp: new Date(),
      requiresReview: request.requireReview !== false
    };
  }
  
  /**
   * Batch auto-translate multiple texts
   */
  async autoTranslateBatch(
    texts: string[],
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<string[]> {
    const provider = this.providerRegistry.getActiveProvider();
    
    if (!provider) {
      throw new Error('No active translation provider configured');
    }
    
    return provider.translateBatch(texts, sourceLanguage, targetLanguage);
  }
}
```

---

## 7. Built-in Translation Providers

### 7.1 Google Cloud Translation

```typescript
// libs/shared/src/lib/translation-providers/google-translate.provider.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  ITranslationProvider,
  TranslationProviderConfig,
  ProviderHealthStatus
} from './translation-provider.interface';

@Injectable()
export class GoogleTranslateProvider implements ITranslationProvider {
  readonly providerId = 'google';
  readonly providerName = 'Google Cloud Translation';
  
  private apiKey?: string;
  private apiEndpoint = 'https://translation.googleapis.com/language/translate/v2';
  
  private config?: TranslationProviderConfig;
  
  constructor(private http: HttpClient) {}
  
  async initialize(config: TranslationProviderConfig): Promise<void> {
    this.config = config;
    this.apiKey = config.apiKey;
    
    if (config.apiEndpoint) {
      this.apiEndpoint = config.apiEndpoint;
    }
    
    console.log('[GoogleTranslate] Initialized');
  }
  
  async translate(
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Google Translate API key not configured');
    }
    
    const response = await this.http.post<any>(
      this.apiEndpoint,
      {
        q: text,
        source: sourceLanguage,
        target: targetLanguage,
        format: 'text'
      },
      {
        params: { key: this.apiKey }
      }
    ).toPromise();
    
    return response.data.translations[0].translatedText;
  }
  
  async translateBatch(
    texts: string[],
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<string[]> {
    if (!this.apiKey) {
      throw new Error('Google Translate API key not configured');
    }
    
    const response = await this.http.post<any>(
      this.apiEndpoint,
      {
        q: texts,
        source: sourceLanguage,
        target: targetLanguage,
        format: 'text'
      },
      {
        params: { key: this.apiKey }
      }
    ).toPromise();
    
    return response.data.translations.map((t: any) => t.translatedText);
  }
  
  async detectLanguage(text: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Google Translate API key not configured');
    }
    
    const response = await this.http.post<any>(
      'https://translation.googleapis.com/language/translate/v2/detect',
      { q: text },
      {
        params: { key: this.apiKey }
      }
    ).toPromise();
    
    return response.data.detections[0][0].language;
  }
  
  getSupportedLanguages(): string[] {
    // Google Translate supports 100+ languages
    return [
      'en', 'fr', 'es', 'de', 'ja', 'zh', 'pt', 'ru', 'ar', 'he',
      'it', 'nl', 'pl', 'tr', 'ko', 'sv', 'no', 'da', 'fi', 'cs',
      'el', 'hu', 'ro', 'sk', 'bg', 'hr', 'sl', 'et', 'lv', 'lt',
      'th', 'vi', 'id', 'ms', 'hi', 'bn', 'ta', 'te', 'mr', 'ur',
      // ... and many more
    ];
  }
  
  isConfigured(): boolean {
    return !!this.apiKey;
  }
  
  async getHealthStatus(): Promise<ProviderHealthStatus> {
    try {
      const startTime = performance.now();
      
      // Test translation
      await this.translate('Hello', 'en', 'fr');
      
      const responseTime = performance.now() - startTime;
      
      return {
        isHealthy: true,
        message: 'Provider is healthy',
        lastChecked: new Date(),
        responseTime
      };
    } catch (error) {
      return {
        isHealthy: false,
        message: `Health check failed: ${(error as Error).message}`,
        lastChecked: new Date()
      };
    }
  }
}
```

### 7.2 AWS Translate Provider

```typescript
// libs/shared/src/lib/translation-providers/aws-translate.provider.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  ITranslationProvider,
  TranslationProviderConfig,
  ProviderHealthStatus
} from './translation-provider.interface';

@Injectable()
export class AWSTranslateProvider implements ITranslationProvider {
  readonly providerId = 'aws';
  readonly providerName = 'AWS Translate';
  
  private config?: TranslationProviderConfig;
  private apiEndpoint?: string;
  
  constructor(private http: HttpClient) {}
  
  async initialize(config: TranslationProviderConfig): Promise<void> {
    this.config = config;
    this.apiEndpoint = config.apiEndpoint || '/api/translation/aws';
    
    console.log('[AWSTranslate] Initialized');
  }
  
  async translate(
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<string> {
    // AWS Translate requires server-side proxy (for signature)
    const response = await this.http.post<{ translatedText: string }>(
      `${this.apiEndpoint}/translate`,
      {
        text,
        sourceLanguageCode: sourceLanguage,
        targetLanguageCode: targetLanguage
      }
    ).toPromise();
    
    return response!.translatedText;
  }
  
  async translateBatch(
    texts: string[],
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<string[]> {
    // AWS Translate batch translation
    const results: string[] = [];
    
    for (const text of texts) {
      const translated = await this.translate(text, sourceLanguage, targetLanguage);
      results.push(translated);
    }
    
    return results;
  }
  
  async detectLanguage(text: string): Promise<string> {
    const response = await this.http.post<{ detectedLanguageCode: string }>(
      `${this.apiEndpoint}/detect`,
      { text }
    ).toPromise();
    
    return response!.detectedLanguageCode;
  }
  
  getSupportedLanguages(): string[] {
    // AWS Translate supports 70+ languages
    return [
      'en', 'fr', 'es', 'de', 'ja', 'zh', 'pt', 'ru', 'ar', 'he',
      'it', 'nl', 'pl', 'tr', 'ko', 'sv', 'no', 'da', 'fi', 'cs',
      // ... more languages
    ];
  }
  
  isConfigured(): boolean {
    return !!this.apiEndpoint;
  }
  
  async getHealthStatus(): Promise<ProviderHealthStatus> {
    try {
      const startTime = performance.now();
      await this.translate('Hello', 'en', 'fr');
      const responseTime = performance.now() - startTime;
      
      return {
        isHealthy: true,
        message: 'Provider is healthy',
        lastChecked: new Date(),
        responseTime
      };
    } catch (error) {
      return {
        isHealthy: false,
        message: `Health check failed: ${(error as Error).message}`,
        lastChecked: new Date()
      };
    }
  }
}
```

### 7.3 DeepL Provider

```typescript
// libs/shared/src/lib/translation-providers/deepl.provider.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  ITranslationProvider,
  TranslationProviderConfig,
  ProviderHealthStatus
} from './translation-provider.interface';

@Injectable()
export class DeepLTranslateProvider implements ITranslationProvider {
  readonly providerId = 'deepl';
  readonly providerName = 'DeepL Translator';
  
  private apiKey?: string;
  private apiEndpoint = 'https://api-free.deepl.com/v2/translate';
  
  constructor(private http: HttpClient) {}
  
  async initialize(config: TranslationProviderConfig): Promise<void> {
    this.apiKey = config.apiKey;
    
    if (config.apiEndpoint) {
      this.apiEndpoint = config.apiEndpoint;
    }
    
    console.log('[DeepL] Initialized');
  }
  
  async translate(
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error('DeepL API key not configured');
    }
    
    // DeepL requires uppercase language codes
    const response = await this.http.post<any>(
      this.apiEndpoint,
      {
        text: [text],
        source_lang: sourceLanguage.toUpperCase(),
        target_lang: targetLanguage.toUpperCase()
      },
      {
        headers: {
          'Authorization': `DeepL-Auth-Key ${this.apiKey}`
        }
      }
    ).toPromise();
    
    return response.translations[0].text;
  }
  
  async translateBatch(
    texts: string[],
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<string[]> {
    if (!this.apiKey) {
      throw new Error('DeepL API key not configured');
    }
    
    const response = await this.http.post<any>(
      this.apiEndpoint,
      {
        text: texts,
        source_lang: sourceLanguage.toUpperCase(),
        target_lang: targetLanguage.toUpperCase()
      },
      {
        headers: {
          'Authorization': `DeepL-Auth-Key ${this.apiKey}`
        }
      }
    ).toPromise();
    
    return response.translations.map((t: any) => t.text);
  }
  
  async detectLanguage(text: string): Promise<string> {
    // DeepL doesn't have language detection API
    // Use translation with auto-detect source
    const response = await this.http.post<any>(
      this.apiEndpoint,
      {
        text: [text],
        target_lang: 'EN' // Arbitrary target
      },
      {
        headers: {
          'Authorization': `DeepL-Auth-Key ${this.apiKey}`
        }
      }
    ).toPromise();
    
    return response.translations[0].detected_source_language.toLowerCase();
  }
  
  getSupportedLanguages(): string[] {
    // DeepL supports 30+ languages (high quality)
    return [
      'en', 'fr', 'es', 'de', 'ja', 'zh', 'pt', 'ru', 'pl', 'it',
      'nl', 'tr', 'ko', 'sv', 'da', 'fi', 'el', 'cs', 'ro', 'hu',
      'sk', 'bg', 'et', 'lv', 'lt', 'sl', 'id', 'uk', 'no'
    ];
  }
  
  isConfigured(): boolean {
    return !!this.apiKey;
  }
  
  async getHealthStatus(): Promise<ProviderHealthStatus> {
    try {
      const startTime = performance.now();
      await this.translate('Hello', 'en', 'fr');
      const responseTime = performance.now() - startTime;
      
      return {
        isHealthy: true,
        message: 'Provider is healthy',
        lastChecked: new Date(),
        responseTime
      };
    } catch (error) {
      return {
        isHealthy: false,
        message: `Health check failed: ${(error as Error).message}`,
        lastChecked: new Date()
      };
    }
  }
}
```

### 7.4 Custom Provider (Plugin Example)

```typescript
// Custom provider loaded via Module Federation
// remote-translation-provider/src/lib/custom-translation.provider.ts
import { Injectable } from '@angular/core';
import {
  ITranslationProvider,
  TranslationProviderConfig,
  ProviderHealthStatus
} from '@edc-platform/shared';

@Injectable()
export class CustomTranslationProvider implements ITranslationProvider {
  readonly providerId = 'custom-medical';
  readonly providerName = 'Custom Medical Translation Provider';
  
  private apiEndpoint?: string;
  private apiKey?: string;
  
  async initialize(config: TranslationProviderConfig): Promise<void> {
    this.apiEndpoint = config.apiEndpoint;
    this.apiKey = config.apiKey;
    
    console.log('[CustomTranslation] Initialized with medical terminology');
  }
  
  async translate(
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<string> {
    // Custom translation logic with medical terminology
    // Could use specialized medical dictionaries, glossaries, etc.
    
    const response = await fetch(`${this.apiEndpoint}/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey!
      },
      body: JSON.stringify({
        text,
        source: sourceLanguage,
        target: targetLanguage,
        domain: 'medical' // Specialized domain
      })
    });
    
    const data = await response.json();
    return data.translatedText;
  }
  
  async translateBatch(
    texts: string[],
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<string[]> {
    const results: string[] = [];
    
    for (const text of texts) {
      const translated = await this.translate(text, sourceLanguage, targetLanguage);
      results.push(translated);
    }
    
    return results;
  }
  
  async detectLanguage(text: string): Promise<string> {
    const response = await fetch(`${this.apiEndpoint}/detect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey!
      },
      body: JSON.stringify({ text })
    });
    
    const data = await response.json();
    return data.language;
  }
  
  getSupportedLanguages(): string[] {
    return ['en', 'fr', 'es', 'de', 'ja', 'zh', 'pt', 'ru'];
  }
  
  isConfigured(): boolean {
    return !!this.apiEndpoint && !!this.apiKey;
  }
  
  async getHealthStatus(): Promise<ProviderHealthStatus> {
    try {
      const startTime = performance.now();
      
      const response = await fetch(`${this.apiEndpoint}/health`);
      const responseTime = performance.now() - startTime;
      
      return {
        isHealthy: response.ok,
        message: response.ok ? 'Provider is healthy' : 'Provider health check failed',
        lastChecked: new Date(),
        responseTime
      };
    } catch (error) {
      return {
        isHealthy: false,
        message: `Health check failed: ${(error as Error).message}`,
        lastChecked: new Date()
      };
    }
  }
}
```

**Plugin Registration:**

```typescript
// In app initialization
import { loadRemoteModule } from '@angular-architects/module-federation';

async function loadCustomTranslationProvider() {
  const module = await loadRemoteModule({
    type: 'module',
    remoteEntry: 'https://cdn.example.com/custom-translation-provider.js',
    exposedModule: './TranslationProvider'
  });
  
  const provider = new module.CustomTranslationProvider();
  
  // Register with registry
  const registry = injector.get(TranslationProviderRegistry);
  registry.register(provider);
}
```

---

### 7.5 Custom Provider: Complete Implementation Guide (Module Federation)

**Purpose:** Step-by-step guide to create, build, deploy, and dynamically load a custom translation provider plugin in production.

#### 7.5.1 Project Setup

**Create Translation Provider Library:**

```bash
# In your monorepo (Nx workspace)
cd /workspace/translation-providers

# Create new library for custom provider
nx generate @nx/angular:library custom-medical-translator \
  --buildable \
  --publishable \
  --importPath=@translation-providers/custom-medical \
  --directory=libs/translation-providers/custom-medical-translator

# Install Module Federation plugin
npm install @angular-architects/module-federation @angular-architects/module-federation-tools
```

**Project Structure:**

```
workspace/
├── libs/
│   └── translation-providers/
│       └── custom-medical-translator/
│           ├── project.json
│           ├── webpack.config.js          # Module Federation config
│           ├── src/
│           │   ├── index.ts               # Public API
│           │   └── lib/
│           │       ├── custom-medical-translator.module.ts
│           │       ├── custom-medical-translator.provider.ts
│           │       └── medical-glossary.service.ts
│           └── package.json
```

#### 7.5.2 Provider Implementation

**1. Provider Interface Implementation:**

```typescript
// libs/translation-providers/custom-medical-translator/src/lib/custom-medical-translator.provider.ts
import { Injectable } from '@angular/core';
import {
  ITranslationProvider,
  TranslationProviderConfig,
  ProviderHealthStatus
} from '@edc-platform/shared';
import { MedicalGlossaryService } from './medical-glossary.service';

@Injectable()
export class CustomMedicalTranslatorProvider implements ITranslationProvider {
  readonly providerId = 'custom-medical-translator';
  readonly providerName = 'Custom Medical Translator with MedDRA';
  
  private apiEndpoint?: string;
  private apiKey?: string;
  private config?: TranslationProviderConfig;
  
  constructor(private glossaryService: MedicalGlossaryService) {}
  
  async initialize(config: TranslationProviderConfig): Promise<void> {
    this.config = config;
    this.apiEndpoint = config.apiEndpoint;
    this.apiKey = config.apiKey;
    
    // Load medical glossary/terminology
    await this.glossaryService.loadGlossary();
    
    console.log('[CustomMedicalTranslator] Initialized with MedDRA glossary');
  }
  
  async translate(
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<string> {
    // 1. Check if text is a medical term in glossary
    const glossaryTranslation = await this.glossaryService.lookup(
      text,
      sourceLanguage,
      targetLanguage
    );
    
    if (glossaryTranslation) {
      console.log(`[CustomMedicalTranslator] Using glossary: ${text} → ${glossaryTranslation}`);
      return glossaryTranslation;
    }
    
    // 2. Fallback to custom API with medical context
    const response = await fetch(`${this.apiEndpoint}/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey!,
        'X-Domain': 'medical-oncology' // Medical domain hint
      },
      body: JSON.stringify({
        text,
        sourceLanguage,
        targetLanguage,
        context: {
          domain: 'medical',
          terminology: 'meddra-v25.1',
          preserveAcronyms: true
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Translation failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.translatedText;
  }
  
  async translateBatch(
    texts: string[],
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<string[]> {
    // Batch translation with glossary lookup
    const results: string[] = [];
    
    for (const text of texts) {
      const translated = await this.translate(text, sourceLanguage, targetLanguage);
      results.push(translated);
    }
    
    return results;
  }
  
  async detectLanguage(text: string): Promise<string> {
    const response = await fetch(`${this.apiEndpoint}/detect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey!
      },
      body: JSON.stringify({ text })
    });
    
    const data = await response.json();
    return data.detectedLanguage;
  }
  
  getSupportedLanguages(): string[] {
    // Languages supported by custom provider
    return [
      'en', 'fr', 'es', 'de', 'ja', 'zh', 'pt', 'ru', 'it', 'nl',
      'pl', 'tr', 'ko', 'sv', 'no', 'da', 'fi', 'cs'
    ];
  }
  
  isConfigured(): boolean {
    return !!this.apiEndpoint && !!this.apiKey;
  }
  
  async getHealthStatus(): Promise<ProviderHealthStatus> {
    try {
      const startTime = performance.now();
      
      // Health check endpoint
      const response = await fetch(`${this.apiEndpoint}/health`, {
        headers: {
          'X-API-Key': this.apiKey!
        }
      });
      
      const responseTime = performance.now() - startTime;
      
      if (!response.ok) {
        return {
          isHealthy: false,
          message: `Health check failed: ${response.status}`,
          lastChecked: new Date(),
          responseTime
        };
      }
      
      const data = await response.json();
      
      return {
        isHealthy: true,
        message: data.message || 'Provider is healthy',
        lastChecked: new Date(),
        responseTime
      };
    } catch (error) {
      return {
        isHealthy: false,
        message: `Health check error: ${(error as Error).message}`,
        lastChecked: new Date()
      };
    }
  }
}
```

**2. Medical Glossary Service:**

```typescript
// libs/translation-providers/custom-medical-translator/src/lib/medical-glossary.service.ts
import { Injectable } from '@angular/core';

interface GlossaryEntry {
  term: string;
  translations: Record<string, string>; // { en: "...", fr: "...", es: "..." }
  meddraCode?: string;
  category: 'adverse-event' | 'medication' | 'procedure' | 'lab-test' | 'symptom';
}

@Injectable()
export class MedicalGlossaryService {
  private glossary: Map<string, GlossaryEntry> = new Map();
  private isLoaded = false;
  
  /**
   * Load medical glossary from CDN or API
   */
  async loadGlossary(): Promise<void> {
    if (this.isLoaded) {
      return;
    }
    
    try {
      // Load from CDN (versioned glossary)
      const response = await fetch(
        'https://cdn.example.com/glossaries/medical-oncology-v1.0.0.json'
      );
      
      const glossaryData: GlossaryEntry[] = await response.json();
      
      // Index by term (lowercase for case-insensitive lookup)
      glossaryData.forEach(entry => {
        this.glossary.set(entry.term.toLowerCase(), entry);
      });
      
      this.isLoaded = true;
      console.log(`[MedicalGlossary] Loaded ${glossaryData.length} medical terms`);
    } catch (error) {
      console.error('[MedicalGlossary] Failed to load glossary:', error);
      // Continue without glossary (fallback to API translation)
    }
  }
  
  /**
   * Lookup term in glossary
   */
  async lookup(
    term: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<string | null> {
    if (!this.isLoaded) {
      await this.loadGlossary();
    }
    
    const entry = this.glossary.get(term.toLowerCase());
    
    if (!entry) {
      return null;
    }
    
    // Return target language translation
    return entry.translations[targetLanguage] || null;
  }
  
  /**
   * Get all terms for a category
   */
  getTermsByCategory(category: GlossaryEntry['category']): GlossaryEntry[] {
    return Array.from(this.glossary.values()).filter(
      entry => entry.category === category
    );
  }
}
```

**3. Public API (Exports):**

```typescript
// libs/translation-providers/custom-medical-translator/src/index.ts
export * from './lib/custom-medical-translator.provider';
export * from './lib/medical-glossary.service';
export * from './lib/custom-medical-translator.module';
```

**4. Angular Module:**

```typescript
// libs/translation-providers/custom-medical-translator/src/lib/custom-medical-translator.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomMedicalTranslatorProvider } from './custom-medical-translator.provider';
import { MedicalGlossaryService } from './medical-glossary.service';

@NgModule({
  imports: [CommonModule],
  providers: [
    CustomMedicalTranslatorProvider,
    MedicalGlossaryService
  ]
})
export class CustomMedicalTranslatorModule {}
```

#### 7.5.3 Module Federation Configuration

**webpack.config.js for Translation Provider:**

```javascript
// libs/translation-providers/custom-medical-translator/webpack.config.js
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const { share, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

module.exports = withModuleFederationPlugin({
  name: 'customMedicalTranslator',
  
  // Expose the provider module
  exposes: {
    './TranslationProvider': './libs/translation-providers/custom-medical-translator/src/index.ts'
  },
  
  // Shared dependencies
  shared: share({
    '@angular/core': { 
      singleton: true, 
      strictVersion: true, 
      requiredVersion: 'auto' 
    },
    '@angular/common': { 
      singleton: true, 
      strictVersion: true, 
      requiredVersion: 'auto' 
    },
    '@angular/common/http': { 
      singleton: true, 
      strictVersion: true, 
      requiredVersion: 'auto' 
    },
    // Share the translation provider interface
    '@edc-platform/shared': { 
      singleton: true, 
      strictVersion: false 
    }
  })
});
```

**project.json Build Configuration:**

```json
// libs/translation-providers/custom-medical-translator/project.json
{
  "name": "custom-medical-translator",
  "targets": {
    "build": {
      "executor": "@angular-architects/module-federation:build",
      "options": {
        "outputPath": "dist/libs/translation-providers/custom-medical-translator",
        "tsConfig": "libs/translation-providers/custom-medical-translator/tsconfig.lib.json",
        "webpackConfig": "libs/translation-providers/custom-medical-translator/webpack.config.js",
        "optimization": true,
        "outputHashing": "all",
        "sourceMap": false,
        "namedChunks": false,
        "extractLicenses": true,
        "vendorChunk": false
      },
      "configurations": {
        "production": {
          "fileReplacements": [
            {
              "replace": "libs/translation-providers/custom-medical-translator/src/environments/environment.ts",
              "with": "libs/translation-providers/custom-medical-translator/src/environments/environment.prod.ts"
            }
          ],
          "optimization": true,
          "outputHashing": "all",
          "sourceMap": false,
          "namedChunks": false,
          "extractLicenses": true,
          "vendorChunk": false,
          "buildOptimizer": true
        }
      }
    }
  }
}
```

#### 7.5.4 Build Process

**Build Commands:**

```bash
# Development build
nx build custom-medical-translator

# Production build
nx build custom-medical-translator --configuration=production

# Output location
# dist/libs/translation-providers/custom-medical-translator/
```

**Build Output Structure:**

```
dist/libs/translation-providers/custom-medical-translator/
├── remoteEntry.js                    # Main entry point (Module Federation)
├── main.[hash].js                    # Provider code
├── polyfills.[hash].js               # Polyfills
├── runtime.[hash].js                 # Webpack runtime
├── vendor.[hash].js                  # Shared dependencies (if not externalized)
└── assets/                           # Static assets (if any)
    └── medical-glossary.json
```

**Build Output Sizes:**

```
remoteEntry.js          ~8 KB  (gzipped: ~3 KB)
main.[hash].js         ~45 KB  (gzipped: ~12 KB)
polyfills.[hash].js    ~36 KB  (gzipped: ~11 KB)
runtime.[hash].js       ~2 KB  (gzipped: ~1 KB)
vendor.[hash].js       ~15 KB  (gzipped: ~5 KB) - minimal (Angular already shared)
───────────────────────────────────────────────
Total                 ~106 KB  (gzipped: ~32 KB)
```

#### 7.5.5 Deployment to CDN

**1. Version Management:**

```typescript
// package.json for custom provider
{
  "name": "@translation-providers/custom-medical",
  "version": "1.2.3",
  "description": "Custom medical translation provider with MedDRA glossary",
  "peerDependencies": {
    "@angular/core": "^18.0.0",
    "@edc-platform/shared": "^1.0.0"
  }
}
```

**2. Deploy Script:**

```bash
#!/bin/bash
# deploy-translation-provider.sh

VERSION=$(node -p "require('./package.json').version")
PROVIDER_NAME="custom-medical-translator"
CDN_BUCKET="s3://edc-cdn/translation-providers"
CLOUDFRONT_DISTRIBUTION="E1234567890ABC"

echo "Deploying $PROVIDER_NAME v$VERSION..."

# 1. Build production bundle
nx build $PROVIDER_NAME --configuration=production

# 2. Create versioned directory
BUILD_DIR="dist/libs/translation-providers/$PROVIDER_NAME"
DEPLOY_DIR="$CDN_BUCKET/$PROVIDER_NAME/v$VERSION"

# 3. Upload to S3 with cache headers
aws s3 sync $BUILD_DIR $DEPLOY_DIR \
  --exclude "*.map" \
  --cache-control "public, max-age=31536000, immutable" \
  --metadata-directive REPLACE

# 4. Create 'latest' symlink (for auto-updates)
aws s3 sync $BUILD_DIR "$CDN_BUCKET/$PROVIDER_NAME/latest" \
  --exclude "*.map" \
  --cache-control "public, max-age=3600" \
  --metadata-directive REPLACE

# 5. Invalidate CloudFront cache for 'latest' only
aws cloudfront create-invalidation \
  --distribution-id $CLOUDFRONT_DISTRIBUTION \
  --paths "/translation-providers/$PROVIDER_NAME/latest/*"

echo "✓ Deployed to: https://cdn.example.com/translation-providers/$PROVIDER_NAME/v$VERSION/remoteEntry.js"
echo "✓ Latest: https://cdn.example.com/translation-providers/$PROVIDER_NAME/latest/remoteEntry.js"
```

**3. CDN URLs:**

```
# Versioned (immutable, long-term cache)
https://cdn.example.com/translation-providers/custom-medical-translator/v1.2.3/remoteEntry.js

# Latest (auto-update, short-term cache)
https://cdn.example.com/translation-providers/custom-medical-translator/latest/remoteEntry.js
```

#### 7.5.6 Dynamic Loading in Host Application

**1. Provider Registry Configuration:**

```typescript
// libs/shared/src/lib/translation-providers/provider-registry.config.ts
export interface RemoteProviderConfig {
  providerId: string;
  providerName: string;
  version: string;
  remoteEntry: string;
  exposedModule: string;
  enabled: boolean;
  isBuiltIn: boolean;
}

export const TRANSLATION_PROVIDER_REGISTRY: RemoteProviderConfig[] = [
  // Built-in providers (bundled with app)
  {
    providerId: 'google',
    providerName: 'Google Cloud Translation',
    version: 'bundled',
    remoteEntry: '',
    exposedModule: '',
    enabled: true,
    isBuiltIn: true
  },
  {
    providerId: 'aws',
    providerName: 'AWS Translate',
    version: 'bundled',
    remoteEntry: '',
    exposedModule: '',
    enabled: true,
    isBuiltIn: true
  },
  {
    providerId: 'deepl',
    providerName: 'DeepL Translator',
    version: 'bundled',
    remoteEntry: '',
    exposedModule: '',
    enabled: true,
    isBuiltIn: true
  },
  
  // Remote providers (loaded from CDN)
  {
    providerId: 'custom-medical-translator',
    providerName: 'Custom Medical Translator with MedDRA',
    version: '1.2.3', // or 'latest'
    remoteEntry: 'https://cdn.example.com/translation-providers/custom-medical-translator/v1.2.3/remoteEntry.js',
    exposedModule: './TranslationProvider',
    enabled: true,
    isBuiltIn: false
  }
];
```

**2. Dynamic Provider Loader Service:**

```typescript
// libs/shared/src/lib/translation-providers/dynamic-provider-loader.service.ts
import { Injectable, Injector } from '@angular/core';
import { loadRemoteModule } from '@angular-architects/module-federation';
import { TranslationProviderRegistry } from './translation-provider.registry';
import { ITranslationProvider, TranslationProviderConfig } from './translation-provider.interface';
import { TRANSLATION_PROVIDER_REGISTRY, RemoteProviderConfig } from './provider-registry.config';

@Injectable({
  providedIn: 'root'
})
export class DynamicProviderLoaderService {
  private loadedProviders = new Set<string>();
  
  constructor(
    private providerRegistry: TranslationProviderRegistry,
    private injector: Injector
  ) {}
  
  /**
   * Load all configured providers (built-in + remote)
   */
  async loadAllProviders(): Promise<void> {
    console.log('[DynamicProviderLoader] Loading translation providers...');
    
    for (const config of TRANSLATION_PROVIDER_REGISTRY) {
      if (!config.enabled) {
        continue;
      }
      
      try {
        if (config.isBuiltIn) {
          await this.loadBuiltInProvider(config);
        } else {
          await this.loadRemoteProvider(config);
        }
      } catch (error) {
        console.error(`[DynamicProviderLoader] Failed to load provider: ${config.providerId}`, error);
      }
    }
    
    console.log(`[DynamicProviderLoader] Loaded ${this.loadedProviders.size} providers`);
  }
  
  /**
   * Load built-in provider (bundled with app)
   */
  private async loadBuiltInProvider(config: RemoteProviderConfig): Promise<void> {
    if (this.loadedProviders.has(config.providerId)) {
      return;
    }
    
    console.log(`[DynamicProviderLoader] Loading built-in provider: ${config.providerId}`);
    
    let provider: ITranslationProvider;
    
    // Dynamic import of built-in providers
    switch (config.providerId) {
      case 'google':
        const { GoogleTranslateProvider } = await import('./google-translate.provider');
        provider = this.injector.get(GoogleTranslateProvider);
        break;
        
      case 'aws':
        const { AWSTranslateProvider } = await import('./aws-translate.provider');
        provider = this.injector.get(AWSTranslateProvider);
        break;
        
      case 'deepl':
        const { DeepLTranslateProvider } = await import('./deepl.provider');
        provider = this.injector.get(DeepLTranslateProvider);
        break;
        
      default:
        throw new Error(`Unknown built-in provider: ${config.providerId}`);
    }
    
    // Register with registry
    this.providerRegistry.register(provider);
    this.loadedProviders.add(config.providerId);
    
    console.log(`  ✓ ${config.providerId} loaded`);
  }
  
  /**
   * Load remote provider via Module Federation
   */
  private async loadRemoteProvider(config: RemoteProviderConfig): Promise<void> {
    if (this.loadedProviders.has(config.providerId)) {
      return;
    }
    
    console.log(`[DynamicProviderLoader] Loading remote provider: ${config.providerId}`);
    console.log(`  Remote entry: ${config.remoteEntry}`);
    console.log(`  Version: ${config.version}`);
    
    try {
      // Load remote module via Module Federation
      const module = await loadRemoteModule({
        type: 'module',
        remoteEntry: config.remoteEntry,
        exposedModule: config.exposedModule
      });
      
      // Instantiate provider
      // The module should export the provider class and module
      const ProviderClass = module.CustomMedicalTranslatorProvider;
      const GlossaryService = module.MedicalGlossaryService;
      
      if (!ProviderClass) {
        throw new Error(`Provider class not found in module: ${config.exposedModule}`);
      }
      
      // Create instance with dependencies
      const glossaryService = new GlossaryService();
      const provider: ITranslationProvider = new ProviderClass(glossaryService);
      
      // Register with registry
      this.providerRegistry.register(provider);
      this.loadedProviders.add(config.providerId);
      
      console.log(`  ✓ ${config.providerId} loaded successfully`);
    } catch (error) {
      console.error(`  ✗ Failed to load ${config.providerId}:`, error);
      throw error;
    }
  }
  
  /**
   * Load single provider on-demand
   */
  async loadProvider(providerId: string): Promise<void> {
    const config = TRANSLATION_PROVIDER_REGISTRY.find(p => p.providerId === providerId);
    
    if (!config) {
      throw new Error(`Provider not found in registry: ${providerId}`);
    }
    
    if (!config.enabled) {
      throw new Error(`Provider is disabled: ${providerId}`);
    }
    
    if (config.isBuiltIn) {
      await this.loadBuiltInProvider(config);
    } else {
      await this.loadRemoteProvider(config);
    }
  }
  
  /**
   * Check if provider is loaded
   */
  isProviderLoaded(providerId: string): boolean {
    return this.loadedProviders.has(providerId);
  }
  
  /**
   * Get list of loaded provider IDs
   */
  getLoadedProviderIds(): string[] {
    return Array.from(this.loadedProviders);
  }
}
```

**3. Initialize in App:**

```typescript
// app.component.ts or APP_INITIALIZER
import { Component, OnInit } from '@angular/core';
import { DynamicProviderLoaderService } from '@edc-platform/shared';

@Component({
  selector: 'app-root',
  template: `
    <div *ngIf="providersLoading" class="loading-overlay">
      Loading translation providers...
    </div>
    
    <router-outlet></router-outlet>
  `
})
export class AppComponent implements OnInit {
  providersLoading = true;
  
  constructor(private providerLoader: DynamicProviderLoaderService) {}
  
  async ngOnInit() {
    try {
      // Load all configured providers
      await this.providerLoader.loadAllProviders();
      
      // Initialize active provider based on study config
      await this.initializeActiveProvider();
      
      this.providersLoading = false;
    } catch (error) {
      console.error('Failed to load translation providers:', error);
      // Show error to user or fallback to default provider
    }
  }
  
  private async initializeActiveProvider() {
    // Get study-specific provider configuration
    // This could come from API or localStorage
    const studyConfig = await this.getStudyConfig();
    
    if (studyConfig?.translation?.provider) {
      const providerId = studyConfig.translation.provider;
      
      // Ensure provider is loaded
      if (!this.providerLoader.isProviderLoaded(providerId)) {
        await this.providerLoader.loadProvider(providerId);
      }
      
      // Initialize and set as active
      const registry = this.injector.get(TranslationProviderRegistry);
      const provider = registry.getProvider(providerId);
      
      if (provider) {
        await provider.initialize({
          apiKey: studyConfig.translation.apiKey,
          apiEndpoint: studyConfig.translation.apiEndpoint
        });
        
        registry.setActiveProvider(providerId);
        console.log(`Active translation provider: ${providerId}`);
      }
    }
  }
  
  private async getStudyConfig(): Promise<any> {
    // Load from API or localStorage
    return null;
  }
}
```

**4. Alternative: APP_INITIALIZER (Recommended):**

```typescript
// app.module.ts
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { DynamicProviderLoaderService } from '@edc-platform/shared';

export function initializeProviders(loader: DynamicProviderLoaderService) {
  return () => loader.loadAllProviders();
}

@NgModule({
  // ...
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeProviders,
      deps: [DynamicProviderLoaderService],
      multi: true
    }
  ]
})
export class AppModule {}
```

#### 7.5.7 Runtime Flow in Production

**Complete Flow Diagram:**

```
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 1: Application Startup                                        │
└─────────────────────────────────────────────────────────────────────┘
    │
    ▼
[APP_INITIALIZER] → DynamicProviderLoaderService.loadAllProviders()
    │
    ├─→ Load Built-in Providers (bundled)
    │   ├─ GoogleTranslateProvider
    │   ├─ AWSTranslateProvider
    │   └─ DeepLTranslateProvider
    │
    └─→ Load Remote Providers (Module Federation)
        │
        ▼
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 2: Load Remote Provider from CDN                              │
└─────────────────────────────────────────────────────────────────────┘
        │
        ▼
loadRemoteModule({
  remoteEntry: 'https://cdn.example.com/.../remoteEntry.js',
  exposedModule: './TranslationProvider'
})
        │
        ▼
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 3: Webpack Module Federation Resolution                       │
└─────────────────────────────────────────────────────────────────────┘
        │
        ├─ 1. Download remoteEntry.js (~3 KB)
        │      → Establishes remote container
        │
        ├─ 2. Resolve shared dependencies
        │      → @angular/core (already loaded by host)
        │      → @angular/common (already loaded by host)
        │      → @edc-platform/shared (already loaded by host)
        │
        └─ 3. Download main.[hash].js (~12 KB gzipped)
               → Provider implementation code
        │
        ▼
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 4: Module Instantiation                                       │
└─────────────────────────────────────────────────────────────────────┘
        │
        ▼
// Webpack loads and executes remote module
const module = await loadRemoteModule(...);

// Module exports:
{
  CustomMedicalTranslatorProvider: class {...},
  MedicalGlossaryService: class {...},
  CustomMedicalTranslatorModule: NgModule
}
        │
        ▼
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 5: Provider Instantiation & Registration                      │
└─────────────────────────────────────────────────────────────────────┘
        │
        ▼
// Create service instances
const glossaryService = new MedicalGlossaryService();
const provider = new CustomMedicalTranslatorProvider(glossaryService);

// Register with provider registry
providerRegistry.register(provider);

// Provider is now available!
        │
        ▼
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 6: Provider Initialization (Per Study)                        │
└─────────────────────────────────────────────────────────────────────┘
        │
        ▼
// Study admin configures provider for their study
await provider.initialize({
  apiKey: 'study-specific-key',
  apiEndpoint: 'https://custom-api.example.com',
  customSettings: {
    glossaryVersion: 'meddra-v25.1',
    preserveAcronyms: true
  }
});

// Load medical glossary
await glossaryService.loadGlossary();
// → Downloads: https://cdn.example.com/glossaries/medical-oncology-v1.0.0.json

// Set as active provider for this study
providerRegistry.setActiveProvider('custom-medical-translator');
        │
        ▼
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 7: Translation Usage                                          │
└─────────────────────────────────────────────────────────────────────┘
        │
        ▼
// Study designer creates form
const formLabel_en = "Adverse Events";

// Auto-translate to other languages
const autoTranslationService = injector.get(AutoTranslationService);

const translations = await autoTranslationService.autoTranslate({
  studyId: 'study-001',
  sourceText: { en: formLabel_en },
  targetLanguages: ['fr', 'es', 'de'],
  sourceLanguage: 'en'
});

// Results:
// {
//   translations: {
//     fr: "Événements Indésirables",
//     es: "Eventos Adversos", 
//     de: "Unerwünschte Ereignisse"
//   },
//   provider: "custom-medical-translator",
//   confidence: { fr: 0.98, es: 0.97, de: 0.96 }
// }
```

**Performance Metrics:**

```
┌────────────────────────────────────────────────────────────────────┐
│ Cold Start (First Load)                                           │
├────────────────────────────────────────────────────────────────────┤
│ 1. DNS lookup                           ~20ms                      │
│ 2. Download remoteEntry.js             ~50ms  (3 KB over CDN)     │
│ 3. Download main.[hash].js            ~150ms  (12 KB over CDN)    │
│ 4. Module instantiation                ~10ms                      │
│ 5. Provider registration                ~5ms                      │
│ 6. Glossary download                  ~100ms  (50 KB)             │
│ ─────────────────────────────────────────────────────────────────│
│ Total                                 ~335ms                      │
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│ Warm Start (Browser Cache)                                        │
├────────────────────────────────────────────────────────────────────┤
│ 1. Load from cache (remoteEntry)       ~5ms                       │
│ 2. Load from cache (main)              ~8ms                       │
│ 3. Module instantiation                ~10ms                      │
│ 4. Provider registration                ~5ms                      │
│ 5. Glossary from cache                 ~20ms                      │
│ ─────────────────────────────────────────────────────────────────│
│ Total                                  ~48ms                      │
└────────────────────────────────────────────────────────────────────┘
```

#### 7.5.8 Provider Versioning & Updates

**1. Version Strategy:**

```typescript
// Option A: Fixed version (stable, predictable)
remoteEntry: 'https://cdn.example.com/translation-providers/custom-medical/v1.2.3/remoteEntry.js'

// Option B: Latest version (auto-updates)
remoteEntry: 'https://cdn.example.com/translation-providers/custom-medical/latest/remoteEntry.js'

// Option C: Major version (auto-patch updates)
remoteEntry: 'https://cdn.example.com/translation-providers/custom-medical/v1/remoteEntry.js'
```

**2. Update Mechanism:**

```typescript
// libs/shared/src/lib/translation-providers/provider-update.service.ts
@Injectable({
  providedIn: 'root'
})
export class ProviderUpdateService {
  /**
   * Check for provider updates
   */
  async checkForUpdates(providerId: string): Promise<{
    currentVersion: string;
    latestVersion: string;
    updateAvailable: boolean;
  }> {
    const config = TRANSLATION_PROVIDER_REGISTRY.find(p => p.providerId === providerId);
    
    if (!config) {
      throw new Error(`Provider not found: ${providerId}`);
    }
    
    // Check version from CDN metadata
    const response = await fetch(
      `https://cdn.example.com/translation-providers/${providerId}/version.json`
    );
    
    const versionInfo = await response.json();
    
    return {
      currentVersion: config.version,
      latestVersion: versionInfo.latest,
      updateAvailable: config.version !== versionInfo.latest
    };
  }
  
  /**
   * Update provider to latest version
   */
  async updateProvider(providerId: string): Promise<void> {
    const updateInfo = await this.checkForUpdates(providerId);
    
    if (!updateInfo.updateAvailable) {
      console.log(`[ProviderUpdate] ${providerId} is already up to date`);
      return;
    }
    
    console.log(`[ProviderUpdate] Updating ${providerId} from ${updateInfo.currentVersion} to ${updateInfo.latestVersion}`);
    
    // Update config
    const config = TRANSLATION_PROVIDER_REGISTRY.find(p => p.providerId === providerId);
    if (config) {
      config.version = updateInfo.latestVersion;
      config.remoteEntry = config.remoteEntry.replace(
        updateInfo.currentVersion,
        updateInfo.latestVersion
      );
    }
    
    // Reload provider
    const loader = this.injector.get(DynamicProviderLoaderService);
    await loader.loadProvider(providerId);
    
    console.log(`[ProviderUpdate] ${providerId} updated successfully`);
  }
}
```

#### 7.5.9 Error Handling & Fallbacks

```typescript
// libs/shared/src/lib/translation-providers/provider-error-handler.ts
export class TranslationProviderErrorHandler {
  /**
   * Handle provider loading errors with fallback strategy
   */
  static async handleLoadError(
    providerId: string,
    error: Error,
    registry: TranslationProviderRegistry
  ): Promise<void> {
    console.error(`[TranslationProvider] Failed to load ${providerId}:`, error);
    
    // Fallback strategy:
    // 1. Try loading from backup CDN
    // 2. Use built-in provider as fallback
    // 3. Disable auto-translation (manual only)
    
    try {
      // Try backup CDN
      const backupUrl = this.getBackupCDNUrl(providerId);
      if (backupUrl) {
        console.log(`[TranslationProvider] Trying backup CDN for ${providerId}`);
        // Attempt load from backup...
      }
    } catch (backupError) {
      console.error('[TranslationProvider] Backup CDN also failed');
    }
    
    // Set fallback provider (Google Translate)
    const fallbackProvider = registry.getProvider('google');
    if (fallbackProvider && fallbackProvider.isConfigured()) {
      console.log('[TranslationProvider] Using Google Translate as fallback');
      registry.setActiveProvider('google');
    } else {
      console.warn('[TranslationProvider] No fallback provider available');
      // Disable auto-translation
    }
  }
  
  private static getBackupCDNUrl(providerId: string): string | null {
    // Backup CDN configuration
    const backupCDNs: Record<string, string> = {
      'custom-medical-translator': 'https://backup-cdn.example.com/...'
    };
    
    return backupCDNs[providerId] || null;
  }
}
```

#### 7.5.10 Testing Custom Provider

**Unit Tests:**

```typescript
// custom-medical-translator.provider.spec.ts
describe('CustomMedicalTranslatorProvider', () => {
  let provider: CustomMedicalTranslatorProvider;
  let glossaryService: MedicalGlossaryService;
  
  beforeEach(() => {
    glossaryService = new MedicalGlossaryService();
    provider = new CustomMedicalTranslatorProvider(glossaryService);
  });
  
  it('should translate medical term using glossary', async () => {
    await provider.initialize({
      apiEndpoint: 'https://api.example.com',
      apiKey: 'test-key'
    });
    
    // Mock glossary lookup
    jest.spyOn(glossaryService, 'lookup').mockResolvedValue('Événements Indésirables');
    
    const result = await provider.translate('Adverse Events', 'en', 'fr');
    
    expect(result).toBe('Événements Indésirables');
    expect(glossaryService.lookup).toHaveBeenCalledWith('Adverse Events', 'en', 'fr');
  });
  
  it('should fallback to API when term not in glossary', async () => {
    await provider.initialize({
      apiEndpoint: 'https://api.example.com',
      apiKey: 'test-key'
    });
    
    // Mock glossary lookup returns null
    jest.spyOn(glossaryService, 'lookup').mockResolvedValue(null);
    
    // Mock fetch
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ translatedText: 'Texte Personnalisé' })
    });
    
    const result = await provider.translate('Custom Text', 'en', 'fr');
    
    expect(result).toBe('Texte Personnalisé');
  });
});
```

**Integration Tests:**

```typescript
// dynamic-provider-loader.integration.spec.ts
describe('DynamicProviderLoader Integration', () => {
  it('should load custom provider from CDN', async () => {
    const loader = TestBed.inject(DynamicProviderLoaderService);
    const registry = TestBed.inject(TranslationProviderRegistry);
    
    // Load custom provider
    await loader.loadProvider('custom-medical-translator');
    
    // Verify provider is loaded
    expect(loader.isProviderLoaded('custom-medical-translator')).toBe(true);
    
    // Verify provider is registered
    const provider = registry.getProvider('custom-medical-translator');
    expect(provider).toBeDefined();
    expect(provider?.providerId).toBe('custom-medical-translator');
  });
});
```

---

## 8. Study Configuration

### 8.1 Study Translation Settings UI

```typescript
// libs/form-builder/src/lib/components/study-translation-settings.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslationProviderRegistry } from '@edc-platform/shared';

@Component({
  selector: 'app-study-translation-settings',
  template: `
    <div class="translation-settings">
      <h3 i18n="@@studySettings.translation.title">Translation Settings</h3>
      
      <form [formGroup]="settingsForm" (ngSubmit)="onSave()">
        
        <!-- Base Language -->
        <div class="form-field">
          <label for="baseLanguage" i18n="@@studySettings.baseLanguage">
            Base Language (for regulatory submission):
          </label>
          <select 
            id="baseLanguage" 
            formControlName="baseLanguage"
            class="form-control"
          >
            <option *ngFor="let lang of availableLanguages" [value]="lang.code">
              {{ lang.name }} ({{ lang.nativeName }})
            </option>
          </select>
          <p class="help-text" i18n="@@studySettings.baseLanguage.help">
            All data values will be stored in this language for submission
          </p>
        </div>
        
        <!-- Supported Languages -->
        <div class="form-field">
          <label i18n="@@studySettings.supportedLanguages">
            Supported Languages:
          </label>
          <div class="checkbox-list">
            <label *ngFor="let lang of availableLanguages" class="checkbox-item">
              <input 
                type="checkbox" 
                [checked]="isSupportedLanguage(lang.code)"
                (change)="toggleLanguage(lang.code, $event)"
              />
              {{ lang.name }} ({{ lang.nativeName }})
            </label>
          </div>
        </div>
        
        <!-- Auto-Translation Settings -->
        <div class="form-section">
          <h4 i18n="@@studySettings.autoTranslation">Auto-Translation</h4>
          
          <div class="form-field">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                formControlName="autoTranslationEnabled"
              />
              <span i18n="@@studySettings.autoTranslation.enable">
                Enable auto-translation
              </span>
            </label>
            <p class="help-text" i18n="@@studySettings.autoTranslation.help">
              Automatically translate form labels and text when creating new forms
            </p>
          </div>
          
          <div *ngIf="settingsForm.get('autoTranslationEnabled')?.value" class="nested-fields">
            
            <!-- Translation Provider -->
            <div class="form-field">
              <label for="translationProvider" i18n="@@studySettings.provider">
                Translation Provider:
              </label>
              <select 
                id="translationProvider" 
                formControlName="translationProvider"
                class="form-control"
              >
                <option value="">-- Select Provider --</option>
                <option *ngFor="let provider of availableProviders" [value]="provider.providerId">
                  {{ provider.providerName }}
                </option>
              </select>
            </div>
            
            <!-- Auto-translate on Create -->
            <div class="form-field">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  formControlName="autoTranslateOnCreate"
                />
                <span i18n="@@studySettings.autoTranslateOnCreate">
                  Auto-translate when creating forms/fields
                </span>
              </label>
            </div>
            
            <!-- Require Review -->
            <div class="form-field">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  formControlName="requireReview"
                />
                <span i18n="@@studySettings.requireReview">
                  Require human review before publishing
                </span>
              </label>
              <p class="help-text" i18n="@@studySettings.requireReview.help">
                Recommended for regulatory compliance
              </p>
            </div>
          </div>
        </div>
        
        <!-- Date/Number Formatting -->
        <div class="form-section">
          <h4 i18n="@@studySettings.formatting">Locale-Specific Formatting</h4>
          
          <div *ngFor="let lang of supportedLanguages" class="format-config">
            <h5>{{ getLanguageName(lang) }}</h5>
            
            <div class="form-field">
              <label [for]="'dateFormat-' + lang" i18n="@@studySettings.dateFormat">
                Date Format:
              </label>
              <select 
                [id]="'dateFormat-' + lang"
                class="form-control"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
            
            <div class="form-field">
              <label [for]="'numberFormat-' + lang" i18n="@@studySettings.numberFormat">
                Number Format:
              </label>
              <select 
                [id]="'numberFormat-' + lang"
                class="form-control"
              >
                <option value="1,234.56">1,234.56 (US)</option>
                <option value="1.234,56">1.234,56 (EU)</option>
                <option value="1 234,56">1 234,56 (FR)</option>
              </select>
            </div>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" i18n="@@common.save">
            Save Settings
          </button>
          <button type="button" class="btn btn-secondary" (click)="onCancel()" i18n="@@common.cancel">
            Cancel
          </button>
        </div>
      </form>
      
      <!-- Provider Health Status -->
      <div *ngIf="showHealthStatus" class="provider-health">
        <h4 i18n="@@studySettings.providerHealth">Provider Health Status</h4>
        <div *ngFor="let status of providerHealthStatuses" class="health-status-item">
          <span class="provider-name">{{ status.providerName }}</span>
          <span 
            class="health-indicator"
            [class.healthy]="status.isHealthy"
            [class.unhealthy]="!status.isHealthy"
          >
            {{ status.isHealthy ? '✓' : '✗' }}
          </span>
          <span class="health-message">{{ status.message }}</span>
          <span *ngIf="status.responseTime" class="response-time">
            ({{ status.responseTime.toFixed(0) }}ms)
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .translation-settings {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .form-section {
      margin: 30px 0;
      padding: 20px;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
    }
    
    .checkbox-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 10px;
    }
    
    .nested-fields {
      margin-left: 30px;
      padding-left: 20px;
      border-left: 3px solid #007bff;
    }
    
    .provider-health {
      margin-top: 30px;
      padding: 20px;
      background: #f5f5f5;
      border-radius: 4px;
    }
    
    .health-status-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px;
      border-bottom: 1px solid #ddd;
    }
    
    .health-indicator {
      font-size: 20px;
      font-weight: bold;
    }
    
    .health-indicator.healthy {
      color: #28a745;
    }
    
    .health-indicator.unhealthy {
      color: #dc3545;
    }
  `]
})
export class StudyTranslationSettingsComponent implements OnInit {
  @Input() studyId!: string;
  
  settingsForm!: FormGroup;
  
  availableLanguages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
    { code: 'he', name: 'Hebrew', nativeName: 'עברית' }
  ];
  
  supportedLanguages: string[] = ['en'];
  availableProviders: any[] = [];
  providerHealthStatuses: any[] = [];
  showHealthStatus = false;
  
  constructor(
    private fb: FormBuilder,
    private providerRegistry: TranslationProviderRegistry
  ) {}
  
  ngOnInit(): void {
    // Load available providers
    this.availableProviders = this.providerRegistry.getAllProviders();
    
    // Initialize form
    this.settingsForm = this.fb.group({
      baseLanguage: ['en', Validators.required],
      autoTranslationEnabled: [false],
      translationProvider: [''],
      autoTranslateOnCreate: [false],
      requireReview: [true]
    });
    
    // Load existing settings
    this.loadSettings();
  }
  
  loadSettings(): void {
    // TODO: Load from API
    // GET /api/studies/${studyId}/translation-settings
  }
  
  isSupportedLanguage(code: string): boolean {
    return this.supportedLanguages.includes(code);
  }
  
  toggleLanguage(code: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    
    if (checked) {
      if (!this.supportedLanguages.includes(code)) {
        this.supportedLanguages.push(code);
      }
    } else {
      const index = this.supportedLanguages.indexOf(code);
      if (index > -1) {
        this.supportedLanguages.splice(index, 1);
      }
    }
  }
  
  getLanguageName(code: string): string {
    const lang = this.availableLanguages.find(l => l.code === code);
    return lang ? `${lang.name} (${lang.nativeName})` : code;
  }
  
  onSave(): void {
    if (this.settingsForm.invalid) {
      return;
    }
    
    const settings = {
      studyId: this.studyId,
      baseLanguage: this.settingsForm.value.baseLanguage,
      supportedLanguages: this.supportedLanguages,
      autoTranslation: {
        enabled: this.settingsForm.value.autoTranslationEnabled,
        provider: this.settingsForm.value.translationProvider,
        autoTranslateOnCreate: this.settingsForm.value.autoTranslateOnCreate,
        requireReview: this.settingsForm.value.requireReview
      }
    };
    
    console.log('Saving translation settings:', settings);
    
    // TODO: Save to API
    // POST /api/studies/${studyId}/translation-settings
  }
  
  onCancel(): void {
    // Navigate back or reset form
  }
  
  async checkProviderHealth(): Promise<void> {
    this.showHealthStatus = true;
    this.providerHealthStatuses = [];
    
    for (const provider of this.availableProviders) {
      const status = await provider.getHealthStatus();
      this.providerHealthStatuses.push({
        providerName: provider.providerName,
        ...status
      });
    }
  }
}
```

---

## 9. Real-World Usage Scenarios

### 9.1 Scenario: Multinational Oncology Study

**Study Setup:**
- **Study Name:** "Phase III Cancer Treatment Trial"
- **Sites:** 30 sites across 10 countries
- **Base Language:** English (FDA submission)
- **Supported Languages:** English, French, Spanish, German, Japanese
- **Translation Provider:** DeepL (high quality for medical terminology)

**User Workflows:**

**A. Study Designer (English speaker):**

1. **Create Form:**
   - Designer creates "Adverse Events" form in English
   - Enters field labels: "Event Description", "Severity", "Start Date"
   - Saves form

2. **Auto-Translation:**
   - System detects supported languages: [fr, es, de, ja]
   - Calls DeepL API to translate all labels
   - Generates translations in ~2 seconds:
     - FR: "Description de l'événement", "Gravité", "Date de début"
     - ES: "Descripción del evento", "Gravedad", "Fecha de inicio"
     - DE: "Ereignisbeschreibung", "Schweregrad", "Startdatum"
     - JA: "イベントの説明", "重症度", "開始日"

3. **Review & Publish:**
   - Medical translator reviews auto-translations
   - Adjusts "Severity" → "Sévérité" (medical context)
   - Publishes multilingual form

**B. French Site Staff (Data Entry):**

1. **Login:**
   - Browser language: French (fr-FR)
   - System detects locale, sets UI to French
   - Loads study translations for French

2. **Enter Data:**
   - Opens "Adverse Events" form
   - Sees labels in French: "Description de l'événement", "Gravité"
   - Enters data: 
     - Event Description: "Nausée sévère"
     - Severity dropdown: "Sévère" (displays French label)
     - **Value stored:** "SEVERE" (base language)

3. **Validation:**
   - Real-time validation messages in French
   - "Ce champ est obligatoire" (This field is required)

**C. Spanish Investigator (Review & Sign-Off):**

1. **Open Form (Read-Only):**
   - Browser language: Spanish (es-ES)
   - Form loads in read-only mode (no validation loading)
   - All labels display in Spanish

2. **Review Data:**
   - Sees form in Spanish: "Eventos Adversos"
   - Field labels: "Descripción del evento", "Gravedad"
   - Display value: "Grave" (Spanish)
   - **Actual value:** "SEVERE" (English for FDA)

3. **Sign-Off:**
   - Clicks "Firmar" (Sign-Off)
   - Confirmation dialog in Spanish
   - Sign-off recorded with timestamp

**D. German Monitor (Audit):**

1. **View Multiple Forms:**
   - Browser language: German (de-DE)
   - Reviews 50+ forms from German sites
   - All UI text and labels in German
   - Fast loading (no validation overhead)

2. **Export for Review:**
   - Exports forms as PDF in German
   - Data values remain in English (CDASH compliance)

### 9.2 Scenario: Real-Time Language Switching

**Use Case:** Bilingual site staff

**Workflow:**

1. **Initial Load:**
   - Browser language: English
   - Site staff prefers French
   - Clicks language switcher

2. **Switch to French:**
   - Language switcher component updates locale
   - LocaleDetectionService.setLocale('fr', 'user')
   - TranslationService.setCurrentLocale('fr')
   - UI updates (if separate build) or labels re-render
   - HTTP interceptor adds 'Accept-Language: fr' to API calls
   - Backend returns French translations

3. **Persistence:**
   - Locale preference saved to localStorage
   - Next login automatically loads French UI

### 9.3 Scenario: Custom Medical Translation Provider

**Use Case:** Pharmaceutical company with proprietary medical dictionary

**Implementation:**

1. **Develop Custom Provider:**
   ```typescript
   // custom-pharma-translator.provider.ts
   export class PharmaCo TranslationProvider implements ITranslationProvider {
     readonly providerId = 'pharmaco-medical';
     readonly providerName = 'PharmaCo Medical Translator';
     
     async translate(text, source, target) {
       // 1. Check proprietary medical dictionary
       const dictTranslation = await this.lookupMedicalDictionary(text, target);
       if (dictTranslation) {
         return dictTranslation;
       }
       
       // 2. Fallback to Google Translate with medical context
       return await this.googleTranslate(text, source, target, 'medical');
     }
     
     private async lookupMedicalDictionary(term, targetLang) {
       // Query internal medical terminology database
       // Returns approved translations for medical terms
     }
   }
   ```

2. **Register Provider:**
   ```typescript
   // In app initialization
   const customProvider = new PharmaCoTranslationProvider();
   await customProvider.initialize({
     apiEndpoint: 'https://internal-api.pharmaco.com/translate',
     apiKey: process.env.PHARMACO_API_KEY
   });
   
   providerRegistry.register(customProvider);
   providerRegistry.setActiveProvider('pharmaco-medical');
   ```

3. **Study Configuration:**
   - Study admin enables auto-translation
   - Selects "PharmaCo Medical Translator" from dropdown
   - All new forms use proprietary medical translations
   - Ensures consistency with company terminology

---

## 10. Performance Optimization

### 10.1 Translation Caching Strategy

**Multi-Level Cache:**

```typescript
// 1. Browser Memory Cache (fastest)
private translationCache = new Map<string, StudyTranslations>(); // ~50KB per locale

// 2. LocalStorage Cache (persistent)
localStorage.setItem(`translations:${studyId}:${locale}`, JSON.stringify(translations));

// 3. IndexedDB Cache (large datasets)
await db.translations.put({
  studyId,
  locale,
  translations,
  timestamp: Date.now()
});

// 4. Service Worker Cache (offline support)
await caches.open('translations-v1').then(cache => {
  cache.put(`/translations/${studyId}/${locale}`, new Response(JSON.stringify(translations)));
});
```

**Cache Invalidation:**

```typescript
// Invalidate on version change
if (cachedVersion !== currentVersion) {
  translationService.clearCache(studyId);
  await loadFreshTranslations();
}

// Invalidate on manual update
studyTranslationUpdated$.subscribe(update => {
  if (update.studyId === currentStudyId) {
    translationService.clearCache(update.studyId, update.locale);
    translationService.loadStudyTranslations(update.studyId, update.locale);
  }
});
```

### 10.2 Bundle Size Optimization

**Lazy-Load Translation Providers:**

```typescript
// Don't bundle all providers in main bundle
// Load only active provider on-demand

async function loadTranslationProvider(providerId: string) {
  let provider;
  
  switch (providerId) {
    case 'google':
      const { GoogleTranslateProvider } = await import(
        /* webpackChunkName: "translation-google" */
        './providers/google-translate.provider'
      );
      provider = new GoogleTranslateProvider(http);
      break;
      
    case 'aws':
      const { AWSTranslateProvider } = await import(
        /* webpackChunkName: "translation-aws" */
        './providers/aws-translate.provider'
      );
      provider = new AWSTranslateProvider(http);
      break;
      
    case 'deepl':
      const { DeepLTranslateProvider } = await import(
        /* webpackChunkName: "translation-deepl" */
        './providers/deepl.provider'
      );
      provider = new DeepLTranslateProvider(http);
      break;
      
    default:
      // Load custom provider via Module Federation
      provider = await loadRemoteProvider(providerId);
  }
  
  return provider;
}
```

**Bundle Size Impact:**

```
Main Bundle (without translation providers):
─────────────────────────────────────────────
TranslationService                 ~8 KB
LocaleDetectionService             ~4 KB
LocaleInterceptor                  ~2 KB
TranslationPipes                   ~3 KB
TranslationProviderRegistry        ~5 KB
─────────────────────────────────────────────
Total (core i18n)                  ~22 KB (gzipped)

Lazy-Loaded Providers:
─────────────────────────────────────────────
Google Translate Provider          ~12 KB
AWS Translate Provider             ~10 KB
DeepL Provider                     ~9 KB
Custom Provider (varies)           ~5-20 KB
─────────────────────────────────────────────
Total (loaded on-demand)           ~10 KB per provider
```

### 10.3 Translation API Rate Limiting

```typescript
// Rate limit auto-translation requests
class RateLimitedTranslationProvider implements ITranslationProvider {
  private requestQueue: Array<() => Promise<string>> = [];
  private requestsPerMinute = 0;
  private maxRequestsPerMinute = 100;
  
  async translate(text: string, source: string, target: string): Promise<string> {
    // Check rate limit
    if (this.requestsPerMinute >= this.maxRequestsPerMinute) {
      // Queue request
      return new Promise((resolve) => {
        this.requestQueue.push(async () => {
          const result = await this.baseProvider.translate(text, source, target);
          resolve(result);
          return result;
        });
      });
    }
    
    // Execute immediately
    this.requestsPerMinute++;
    
    setTimeout(() => {
      this.requestsPerMinute--;
      this.processQueue();
    }, 60000); // Reset after 1 minute
    
    return this.baseProvider.translate(text, source, target);
  }
  
  private async processQueue(): void {
    if (this.requestQueue.length > 0 && this.requestsPerMinute < this.maxRequestsPerMinute) {
      const request = this.requestQueue.shift();
      await request!();
    }
  }
}
```

---

## 11. Regulatory Compliance

### 11.1 Data Integrity (21 CFR Part 11)

**⚠️ CRITICAL REQUIREMENT: Values must remain in base language**

```typescript
// ✅ CORRECT: Labels translated, values immutable
interface FormDataSubmission {
  formId: string;
  studyId: string;
  subjectId: string;
  
  // Metadata (can be localized)
  formLabel_displayed: string; // "Signes Vitaux" (French site)
  formLabel_base: string;      // "Vital Signs" (base language)
  
  // Data (MUST be in base language)
  data: {
    gender: {
      value: "MALE",                    // ✅ Always English
      displayValue_locale: "Homme",     // French display
      cdiscCode: "M"                    // CDISC standard code
    },
    severity: {
      value: "SEVERE",                  // ✅ Always English
      displayValue_locale: "Sévère",    // French display
      meddraCode: "10040047"            // MedDRA standard code
    }
  }
}

// ❌ WRONG: Values in non-base language
{
  "gender": "Homme",  // ❌ French value = data corruption
  "severity": "Sévère" // ❌ Cannot map to CDISC
}
```

**Audit Trail Requirements:**

```typescript
interface TranslationAuditEntry {
  timestamp: Date;
  userId: string;
  studyId: string;
  action: 'create' | 'update' | 'review' | 'approve' | 'auto-translate';
  
  // What was translated
  entity: 'form' | 'field' | 'visit' | 'instruction';
  entityId: string;
  
  // Translation details
  sourceLanguage: string;
  targetLanguage: string;
  sourceText: string;
  translatedText: string;
  
  // Auto-translation metadata
  translationProvider?: string;
  autoTranslated: boolean;
  humanReviewed: boolean;
  reviewedBy?: string;
  reviewedAt?: Date;
  
  // Version control
  version: number;
  previousTranslation?: string;
  
  // Approval workflow
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
}
```

### 11.2 Validation: Base Language Check

```typescript
// Server-side validation: Ensure values are in base language
class DataSubmissionValidator {
  validateFieldValue(
    fieldValue: any,
    fieldConfig: FormFieldConfiguration,
    studyBaseLanguage: string
  ): ValidationResult {
    
    // For coded values (dropdowns, radio buttons)
    if (fieldConfig.fieldType === 'dropdown') {
      const validValues = fieldConfig.options!.map(opt => opt.value);
      
      // Check if submitted value is in base language
      if (!validValues.includes(fieldValue)) {
        return {
          valid: false,
          error: `Invalid value: ${fieldValue}. Must be one of: ${validValues.join(', ')}`
        };
      }
      
      // Check if value is NOT a translated display label
      const displayLabels = fieldConfig.options!.flatMap(opt => 
        Object.values(opt.labels)
      );
      
      if (displayLabels.includes(fieldValue)) {
        return {
          valid: false,
          error: `Display label submitted as value: ${fieldValue}. This violates data integrity.`
        };
      }
    }
    
    return { valid: true };
  }
}
```

### 11.3 CDASH/SDTM Compliance

```typescript
// Ensure translations don't break CDASH/SDTM mapping
interface CDASHCompliantField {
  fieldName: string;
  
  // CDASH standard domain and variable
  cdashDomain: string; // "DM" (Demographics), "VS" (Vital Signs)
  cdashVariable: string; // "SEX", "WEIGHT", "HEIGHT"
  
  // Values MUST match CDASH controlled terminology
  controlledTerminology?: {
    codelist: string; // "C66731" (CDISC terminology OID)
    values: Array<{
      code: string;      // "M", "F", "U"
      value: string;     // "MALE", "FEMALE", "UNKNOWN"
      labels: Record<string, string>; // Multilingual display labels
    }>;
  };
}

// Example: Gender field with CDASH compliance
const genderField: CDASHCompliantField = {
  fieldName: "gender",
  cdashDomain: "DM",
  cdashVariable: "SEX",
  controlledTerminology: {
    codelist: "C66731",
    values: [
      {
        code: "M",
        value: "MALE",
        labels: {
          en: "Male",
          fr: "Homme",
          es: "Masculino",
          de: "Männlich",
          ja: "男性"
        }
      },
      {
        code: "F",
        value: "FEMALE",
        labels: {
          en: "Female",
          fr: "Femme",
          es: "Femenino",
          de: "Weiblich",
          ja: "女性"
        }
      },
      {
        code: "U",
        value: "UNKNOWN",
        labels: {
          en: "Unknown",
          fr: "Inconnu",
          es: "Desconocido",
          de: "Unbekannt",
          ja: "不明"
        }
      }
    ]
  }
};

// When submitting to FDA/EMA:
// Stored value: "MALE"
// CDASH code: "M"
// Display label (French site): "Homme"
```

---

## 12. Implementation Guide

### 12.1 Step-by-Step Setup

**Step 1: Install Dependencies**

```bash
# Angular i18n (built-in)
npm install @angular/localize

# Translation providers (choose one or more)
npm install @google-cloud/translate  # Google Translate
npm install aws-sdk                   # AWS Translate
npm install deepl-node                # DeepL

# Module Federation (for plugin providers)
npm install @angular-architects/module-federation
```

**Step 2: Configure Angular i18n**

```typescript
// angular.json
{
  "projects": {
    "app": {
      "i18n": {
        "sourceLocale": "en",
        "locales": {
          "fr": "src/locales/messages.fr.xlf",
          "es": "src/locales/messages.es.xlf",
          "de": "src/locales/messages.de.xlf"
        }
      }
    }
  }
}
```

**Step 3: Create Translation Services**

```typescript
// libs/shared/src/lib/translation.module.ts
@NgModule({
  providers: [
    TranslationService,
    LocaleDetectionService,
    AutoTranslationService,
    TranslationProviderRegistry,
    
    // HTTP Interceptor
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LocaleInterceptor,
      multi: true
    },
    
    // Register built-in providers
    GoogleTranslateProvider,
    AWSTranslateProvider,
    DeepLTranslateProvider
  ]
})
export class TranslationModule {
  constructor(registry: TranslationProviderRegistry) {
    // Auto-register providers
    // Actual registration happens when provider is initialized with config
  }
}
```

**Step 4: Initialize in App**

```typescript
// app.component.ts
@Component({
  selector: 'app-root',
  template: `
    <app-language-switcher 
      [supportedLanguages]="supportedLanguages"
    ></app-language-switcher>
    
    <router-outlet></router-outlet>
  `
})
export class AppComponent implements OnInit {
  supportedLanguages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' }
  ];
  
  constructor(
    private localeDetectionService: LocaleDetectionService,
    private translationService: TranslationService,
    private providerRegistry: TranslationProviderRegistry
  ) {}
  
  async ngOnInit() {
    // 1. Detect locale
    const locale = this.localeDetectionService.getCurrentLocale();
    console.log(`[App] Detected locale: ${locale}`);
    
    // 2. Initialize translation providers
    await this.initializeTranslationProviders();
    
    // 3. Load study translations (if study context available)
    const studyId = this.getStudyId(); // From route or storage
    if (studyId) {
      this.translationService.setContext(studyId, locale);
    }
  }
  
  private async initializeTranslationProviders() {
    // Initialize Google Translate
    const googleProvider = new GoogleTranslateProvider(this.http);
    await googleProvider.initialize({
      apiKey: environment.googleTranslateApiKey
    });
    this.providerRegistry.register(googleProvider);
    
    // Initialize AWS Translate
    const awsProvider = new AWSTranslateProvider(this.http);
    await awsProvider.initialize({
      apiEndpoint: '/api/translation/aws'
    });
    this.providerRegistry.register(awsProvider);
    
    // Set active provider (from study config or default)
    this.providerRegistry.setActiveProvider('google');
  }
  
  private getStudyId(): string | null {
    // Get from route params or localStorage
    return null;
  }
}
```

**Step 5: Use in Components**

```typescript
// form-renderer.component.ts
@Component({
  selector: 'app-form-renderer',
  template: `
    <h2>{{ formConfig.name | translateMultilingual }}</h2>
    
    <div *ngFor="let field of formConfig.fields">
      <label>
        {{ field.labels | translateMultilingual }}
      </label>
      
      <input 
        [type]="field.fieldType"
        [placeholder]="field.placeholders | translateMultilingual"
      />
      
      <p class="help-text">
        {{ field.helpText | translateMultilingual }}
      </p>
    </div>
  `
})
export class FormRendererComponent {
  @Input() formConfig!: FormConfiguration;
  
  constructor(private translationService: TranslationService) {}
}
```

### 12.2 Testing Strategy

**Unit Tests:**

```typescript
// translation.service.spec.ts
describe('TranslationService', () => {
  let service: TranslationService;
  let httpMock: HttpTestingController;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TranslationService]
    });
    
    service = TestBed.inject(TranslationService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  
  it('should load study translations', async () => {
    const studyId = 'study-001';
    const locale = 'fr';
    
    service.loadStudyTranslations(studyId, locale).subscribe(translations => {
      expect(translations).toBeDefined();
      expect(translations.locale).toBe('fr');
    });
    
    const req = httpMock.expectOne(`/api/translations/study/${studyId}/locale/${locale}`);
    expect(req.request.method).toBe('GET');
    
    req.flush({
      studyId,
      locale,
      translations: {
        'form.vital_signs.title': 'Signes Vitaux',
        'field.weight.label': 'Poids (kg)'
      },
      lastUpdated: new Date()
    });
  });
  
  it('should translate multilingual object', () => {
    service.setCurrentLocale('fr');
    
    const multilingualText = {
      en: 'Weight (kg)',
      fr: 'Poids (kg)',
      es: 'Peso (kg)'
    };
    
    const translated = service.translateMultilingual(multilingualText);
    expect(translated).toBe('Poids (kg)');
  });
  
  it('should fallback to English if locale not found', () => {
    service.setCurrentLocale('de'); // German not in object
    
    const multilingualText = {
      en: 'Weight (kg)',
      fr: 'Poids (kg)',
      es: 'Peso (kg)'
    };
    
    const translated = service.translateMultilingual(multilingualText);
    expect(translated).toBe('Weight (kg)'); // Fallback to English
  });
});
```

**E2E Tests:**

```typescript
// language-switching.e2e.spec.ts
describe('Language Switching', () => {
  it('should switch UI language when user selects from dropdown', async () => {
    await page.goto('/forms/vital-signs');
    
    // Check initial language (English)
    const titleEn = await page.locator('h2').textContent();
    expect(titleEn).toBe('Vital Signs');
    
    // Switch to French
    await page.selectOption('#language-select', 'fr');
    
    // Wait for translations to load
    await page.waitForTimeout(500);
    
    // Check French translation
    const titleFr = await page.locator('h2').textContent();
    expect(titleFr).toBe('Signes Vitaux');
    
    // Check field labels
    const weightLabel = await page.locator('label[for="weight"]').textContent();
    expect(weightLabel).toBe('Poids (kg)');
  });
  
  it('should persist language preference across sessions', async () => {
    await page.goto('/forms/vital-signs');
    
    // Switch to Spanish
    await page.selectOption('#language-select', 'es');
    await page.waitForTimeout(500);
    
    // Reload page
    await page.reload();
    
    // Check Spanish is still active
    const title = await page.locator('h2').textContent();
    expect(title).toBe('Signos Vitales');
  });
});
```

---

## Summary

This document provides a comprehensive multilingual (i18n) implementation for the clinical trial EDC platform frontend:

✅ **Two-Tier Translation:** Static UI content (Angular i18n) + Dynamic study metadata (runtime service)  
✅ **Locale Detection:** Browser language detection with user override capability  
✅ **Translation Service:** Central service for loading and caching study-specific translations  
✅ **Plugin Architecture:** Extensible translation provider system (Google, AWS, DeepL, custom)  
✅ **Auto-Translation:** Optional AI-powered translation with human review workflow  
✅ **Study Configuration:** Per-study language settings and formatting preferences  
✅ **Real-World Scenarios:** Multinational trials, language switching, custom providers  
✅ **Performance:** Multi-level caching, lazy-loading providers, bundle optimization  
✅ **Regulatory Compliance:** Values in base language, audit trail, CDASH/SDTM compliance  

**Key Architectural Decisions:**

1. **Labels translated, values immutable** (base language only)
2. **Pluggable translation providers** (via DI and Module Federation)
3. **Browser locale detection** with user preference override
4. **Multi-level caching** (memory, localStorage, Service Worker)
5. **Separate builds per locale** (production) vs runtime switching (development)

**Performance Metrics:**

- **Core i18n bundle:** ~22KB (gzipped)
- **Translation providers:** ~10KB each (lazy-loaded)
- **Translation cache:** ~50KB per locale per study
- **Locale switch:** <100ms (cached translations)
- **Auto-translation:** ~2s for 10 fields (batch API call)

---

**Related Documentation:**

- [Form Builder Blockly Visual Programming](form-builder-blockly-visual-programming.md)
- [Form Renderer: Validation Loading & Execution](form-renderer-validation-loading.md)
- [Form Builder Custom Programming Implementation](form-builder-custom-programming-implementation.md)

---

**Document Version:** 1.0  
**Last Updated:** May 31, 2026  
**Author:** Clinical EDC Platform Team  
**Status:** 🚧 Draft for Review