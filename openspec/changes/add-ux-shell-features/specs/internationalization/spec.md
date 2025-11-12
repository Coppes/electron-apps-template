# Spec: Internationalization

## ADDED Requirements

### Requirement: Multi-Language Support

The application SHALL support multiple languages with the ability to switch languages at runtime without restarting the application.

#### Scenario: Initialize with default language

**Given** the application starts for the first time  
**When** no language preference is saved  
**Then** the application SHALL use English (en) as the default language  
**And** all UI text SHALL be displayed in English

#### Scenario: Initialize with saved language preference

**Given** the user previously selected Portuguese (pt-BR)  
**When** the application starts  
**Then** the application SHALL load and display content in Portuguese  
**And** the language preference SHALL be retrieved from electron-store

### Requirement: Runtime Language Switching

Users SHALL be able to change the application language from settings and see the change immediately without restarting.

#### Scenario: Switch language in settings

**Given** the application is running in English  
**And** the user opens the Settings page  
**When** the user selects Portuguese (pt-BR) from the language dropdown  
**Then** the language preference SHALL be saved to electron-store  
**And** the application SHALL reload all translations  
**And** all UI text SHALL update to Portuguese immediately  
**And** no application restart SHALL be required

#### Scenario: Language persists across restarts

**Given** the user has switched to Portuguese  
**When** the application is closed and reopened  
**Then** the application SHALL start in Portuguese  
**And** the language preference SHALL be loaded from electron-store

### Requirement: Translation Key System

All user-facing text SHALL be defined as translation keys in JSON files, with no hardcoded strings in components.

#### Scenario: Component uses translation key

**Given** a component needs to display text  
**When** the component renders  
**Then** the component SHALL use the useTranslation hook  
**And** SHALL call t('keyName') to retrieve translated text  
**Example**: `t('common.cancel')` returns "Cancel" in English or "Cancelar" in Portuguese

#### Scenario: Missing translation key fallback

**Given** a translation key is requested  
**And** the key does not exist in the current language  
**When** the translation is retrieved  
**Then** the system SHALL fall back to the English translation  
**And** if English is also missing, SHALL return the key itself  
**And** SHALL log a warning in development mode

#### Scenario: Nested translation keys

**Given** translation files use nested structure  
**Example**: `{ "common": { "buttons": { "save": "Save" } } }`  
**When** a component requests `t('common.buttons.save')`  
**Then** the system SHALL traverse the nested structure  
**And** SHALL return the correct translation value

### Requirement: Translation Namespaces

Translations SHALL be organized into namespaces (common, settings, errors, onboarding) to enable code splitting and organized translation files.

#### Scenario: Load translation namespace

**Given** a component uses translations from the 'settings' namespace  
**When** the component calls `useTranslation('settings')`  
**Then** the 'settings' namespace translations SHALL be loaded  
**And** the component SHALL access keys via t('keyName') within that namespace

#### Scenario: Multiple namespaces in one component

**Given** a component needs translations from multiple namespaces  
**When** the component calls `useTranslation(['common', 'errors'])`  
**Then** both namespaces SHALL be loaded  
**And** keys SHALL be prefixed with namespace: t('common:save'), t('errors:notFound')

#### Scenario: Lazy load namespace

**Given** a namespace has not been loaded yet  
**When** a component requests it via useTranslation  
**Then** the namespace SHALL be loaded asynchronously  
**And** SHALL cache the loaded translations for future use

### Requirement: Supported Languages

The application SHALL initially support English (en) and Portuguese Brazil (pt-BR) with infrastructure to easily add more languages.

#### Scenario: List available languages

**Given** the user opens the language selector  
**When** the dropdown is displayed  
**Then** the following languages SHALL be available:
  - English (en)
  - Português (Brasil) (pt-BR)
**And** each language SHALL show its native name

#### Scenario: Add new language

**Given** a contributor wants to add Spanish (es)  
**When** Spanish translation files are added to `locales/es/`  
**And** Spanish is registered in i18n configuration  
**Then** Spanish SHALL appear in the language selector  
**And** users SHALL be able to switch to Spanish

### Requirement: Translation File Structure

Translation files SHALL be organized by language and namespace in a clear directory structure with JSON format.

#### Scenario: Translation file location

**Given** the application uses i18n  
**When** translations are loaded  
**Then** files SHALL be located at: `src/renderer/i18n/locales/{language}/{namespace}.json`  
**Example**: `src/renderer/i18n/locales/en/common.json`

#### Scenario: Translation file format

**Given** a translation file is created  
**When** the file is parsed  
**Then** the file SHALL be valid JSON  
**And** SHALL contain key-value pairs or nested objects  
**Example**: `{ "welcome": "Welcome", "buttons": { "save": "Save" } }`

### Requirement: Pluralization Support

The i18n system SHALL support pluralization rules for different languages, allowing text to change based on counts.

#### Scenario: English pluralization

**Given** a translation key supports pluralization  
**Example**: `{ "items": "{{count}} item", "items_plural": "{{count}} items" }`  
**When** the component calls `t('items', { count: 1 })`  
**Then** the result SHALL be "1 item"  
**When** the component calls `t('items', { count: 5 })`  
**Then** the result SHALL be "5 items"

#### Scenario: Language-specific pluralization rules

**Given** Portuguese has different pluralization rules than English  
**When** a translation with count is requested in Portuguese  
**Then** the system SHALL apply Portuguese pluralization rules  
**And** SHALL select the correct plural form

### Requirement: Variable Interpolation

Translation strings SHALL support variable interpolation to insert dynamic content into translated text.

#### Scenario: Simple variable interpolation

**Given** a translation key contains a variable placeholder  
**Example**: `{ "greeting": "Hello, {{name}}!" }`  
**When** the component calls `t('greeting', { name: 'Alice' })`  
**Then** the result SHALL be "Hello, Alice!"

#### Scenario: Multiple variables

**Given** a translation key contains multiple variables  
**Example**: `{ "message": "{{user}} sent {{count}} messages" }`  
**When** the component calls `t('message', { user: 'Bob', count: 3 })`  
**Then** the result SHALL be "Bob sent 3 messages"

#### Scenario: Default variable values

**Given** a translation key contains a variable  
**And** no value is provided for the variable  
**When** the translation is retrieved  
**Then** the placeholder SHALL be preserved in the output  
**Example**: "Hello, {{name}}!" (if name not provided)

### Requirement: Date and Number Formatting

The i18n system SHALL provide locale-aware formatting for dates, times, numbers, and currency.

#### Scenario: Format date for current locale

**Given** the application language is Portuguese (pt-BR)  
**When** a date object is formatted using i18n  
**Then** the date SHALL use Brazilian format (DD/MM/YYYY)  
**Example**: December 5, 2025 → "05/12/2025"

#### Scenario: Format date for English locale

**Given** the application language is English (en)  
**When** a date object is formatted using i18n  
**Then** the date SHALL use US format (MM/DD/YYYY)  
**Example**: December 5, 2025 → "12/05/2025"

#### Scenario: Format number with locale separators

**Given** the application language is Portuguese (pt-BR)  
**When** the number 1000.5 is formatted  
**Then** the result SHALL be "1.000,5" (using Brazilian separators)  
**Given** the application language is English (en)  
**Then** the result SHALL be "1,000.5" (using US separators)

### Requirement: Accessibility and ARIA Translations

ARIA labels, screen reader text, and accessibility features SHALL be fully translated using the i18n system.

#### Scenario: Translate ARIA label

**Given** a button has an aria-label attribute  
**When** the component renders  
**Then** the aria-label SHALL use a translation key  
**Example**: `aria-label={t('common.close')}`  
**And** the label SHALL be in the current language

#### Scenario: Screen reader announcements translated

**Given** a status change triggers a screen reader announcement  
**When** the announcement is made  
**Then** the announcement text SHALL be retrieved from i18n  
**And** SHALL be in the current language

### Requirement: Translation Contribution Workflow

The project SHALL provide clear documentation for contributors to add or update translations without modifying code.

#### Scenario: Translation template file

**Given** a contributor wants to add a new language  
**When** they review the contribution guide  
**Then** a template JSON file SHALL be provided  
**And** the template SHALL include all required keys with English values as reference

#### Scenario: Validate translation completeness

**Given** a new translation file is added  
**When** the application runs in development mode  
**Then** missing keys SHALL be logged to the console  
**And** a report SHALL indicate which keys need translation

### Requirement: Performance and Loading Optimization

The i18n system SHALL optimize translation loading to minimize impact on application startup time and runtime performance.

#### Scenario: Cache loaded translations

**Given** a translation namespace has been loaded  
**When** the namespace is requested again  
**Then** the cached version SHALL be used  
**And** no additional file loading SHALL occur

#### Scenario: Lazy load translation namespaces

**Given** the application starts  
**When** the i18n system initializes  
**Then** only the 'common' namespace SHALL be loaded initially  
**And** other namespaces SHALL be loaded on-demand when components request them

#### Scenario: Translation loading timeout

**Given** a translation file is being loaded  
**And** the loading takes longer than 5 seconds  
**When** the timeout is reached  
**Then** the system SHALL fall back to English  
**And** an error SHALL be logged

### Requirement: Development Tools and Debugging

The system SHALL provide tools to help developers identify missing translations and debug i18n issues during development.

#### Scenario: Missing key warning in development

**Given** the application is running in development mode  
**And** a component requests a translation key that doesn't exist  
**When** the translation is retrieved  
**Then** a warning SHALL be logged to the console  
**And** the warning SHALL include the missing key and namespace

#### Scenario: Translation key preview in UI

**Given** a developer wants to see which translation keys are used  
**And** a debug mode is enabled  
**When** the UI renders  
**Then** translation keys SHALL be displayed alongside or instead of values  
**Example**: "common.save" instead of "Save"  
**And** this mode SHALL only be available in development

### Requirement: Right-to-Left (RTL) Language Support

The system SHALL provide infrastructure to support RTL languages (Arabic, Hebrew) in the future, even if not initially implemented.

#### Scenario: Detect RTL language

**Given** the i18n system is configured  
**When** a RTL language is selected  
**Then** the system SHALL set the `dir="rtl"` attribute on the root element  
**And** CSS styles SHALL respect the RTL direction

#### Scenario: Mirror layout for RTL

**Given** the application is in RTL mode  
**When** UI components render  
**Then** layout SHALL mirror horizontally (left becomes right)  
**And** text alignment SHALL adjust appropriately
