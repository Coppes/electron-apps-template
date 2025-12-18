# Spec: Native Spellchecker

## ADDED Requirements

### Requirement: Text inputs MUST provide native spellchecking.
Standard text input fields MUST utilize the operating system's native spellchecker to identify misspelled words.
#### Scenario: Misspelled word handling
  - **Given** a text input or textarea is focused.
  - **When** the user types a misspelled word.
  - **Then** the word is underlined (OS native behavior).
  - **When** the user right-clicks the misspelled word.
  - **Then** the context menu shows suggested corrections from the OS dictionary.

### Requirement: The user MUST be able to accept suggestions.
Users MUST be able to right-click on misspelled words to see and apply suggestions from the native dictionary.
#### Scenario: Accepting correction
  - **Given** the context menu with suggestions is open.
  - **When** the user clicks a suggestion.
  - **Then** the misspelled word in the input is replaced with the selected suggestion.
