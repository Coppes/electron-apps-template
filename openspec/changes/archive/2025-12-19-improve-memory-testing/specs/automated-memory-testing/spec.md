# automated-memory-testing

## MODIFIED Requirements

### Requirement: Integration of MemLab

The system SHALL use **Playwright** to drive memory test scenarios and **MemLab** APIs to analyze the resulting heap snapshots.
- **Reason**: Standalone MemLab browser execution is incompatible with the application's build environment.

#### Scenario: Run memory tests

**Given** the developer environment is set up
**When** the user runs `npm run test:memory`
**Then** Playwright SHALL launch the Electron application
**And** capture heap snapshots via standard Chrome DevTools Protocol
**And** MemLab SHALL analyze these snapshots for leaks
