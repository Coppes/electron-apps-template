# Spec: Test Infrastructure

## ADDED Requirements

### Requirement: Separate Vitest Configuration for Main and Renderer

The system SHALL provide separate Vitest configurations for main and renderer processes with appropriate environments.

#### Scenario: Configure main process tests

**Given** the project needs to test main process modules  
**When** the main process test configuration is loaded  
**Then** the environment SHALL be set to 'node'  
**And** SHALL include tests matching `test/unit/main/**/*.test.js`  
**And** SHALL configure coverage for `src/main/**/*.js`  
**And** SHALL exclude `src/main.js` and `src/preload.js` from coverage

#### Scenario: Configure renderer process tests

**Given** the project needs to test renderer process modules  
**When** the renderer test configuration is loaded  
**Then** the environment SHALL be set to 'jsdom'  
**And** SHALL include tests matching `test/unit/renderer/**/*.test.{js,jsx}`  
**And** SHALL configure coverage for `src/renderer/**/*.{js,jsx}`  
**And** SHALL setup alias '@' pointing to 'src/renderer'

#### Scenario: Run tests independently

**Given** separate configurations exist  
**When** a user runs `npm run test:main`  
**Then** only main process tests SHALL execute  
**And** SHALL not load renderer-specific dependencies

**Given** separate configurations exist  
**When** a user runs `npm run test:renderer`  
**Then** only renderer process tests SHALL execute  
**And** SHALL load jsdom environment

### Requirement: Global Test Setup Files

The system SHALL provide global setup files that configure the test environment before tests run.

#### Scenario: Setup main process test environment

**Given** main process tests are about to run  
**When** the setup file executes  
**Then** Electron API mocks SHALL be available globally  
**And** process.env.NODE_ENV SHALL be set to 'test'  
**And** global cleanup hooks SHALL be registered

#### Scenario: Setup renderer process test environment

**Given** renderer process tests are about to run  
**When** the setup file executes  
**Then** @testing-library/jest-dom matchers SHALL be available  
**And** window.electronAPI SHALL be mocked globally  
**And** jsdom environment SHALL be configured  
**And** cleanup SHALL run after each test

#### Scenario: Prevent test pollution

**Given** multiple tests are running in sequence  
**When** each test completes  
**Then** all mocks SHALL be cleared  
**And** all timers SHALL be cleared  
**And** all event listeners SHALL be removed

### Requirement: Test Directory Structure

The system SHALL organize tests in a clear, scalable directory structure.

#### Scenario: Organize test files by type

**Given** the test suite contains multiple test types  
**When** a developer looks for tests  
**Then** unit tests SHALL be in `test/unit/`  
**And** integration tests SHALL be in `test/integration/`  
**And** E2E tests SHALL be in `test/e2e/`  
**And** shared setup SHALL be in `test/setup/`  
**And** fixtures SHALL be in `test/fixtures/`

#### Scenario: Mirror source structure in unit tests

**Given** source code is organized by process  
**When** unit tests are created  
**Then** main process tests SHALL be in `test/unit/main/`  
**And** renderer process tests SHALL be in `test/unit/renderer/`  
**And** SHALL mirror the src/ directory structure

### Requirement: Coverage Configuration

The system SHALL enforce minimum code coverage thresholds.

#### Scenario: Enforce coverage thresholds

**Given** tests are run with coverage enabled  
**When** coverage is calculated  
**Then** line coverage SHALL be >= 80%  
**And** function coverage SHALL be >= 80%  
**And** branch coverage SHALL be >= 75%  
**And** statement coverage SHALL be >= 80%

#### Scenario: Exclude non-testable files from coverage

**Given** some files are not suitable for coverage  
**When** coverage is calculated  
**Then** `node_modules/` SHALL be excluded  
**And** `test/` directory SHALL be excluded  
**And** `src/main.js` (entry point) SHALL be excluded  
**And** `src/preload.js` (entry point) SHALL be excluded  
**And** all `*.test.{js,jsx}` files SHALL be excluded

#### Scenario: Generate multiple coverage formats

**Given** tests are run with coverage  
**When** coverage reports are generated  
**Then** text format SHALL be output to console  
**And** JSON format SHALL be saved to `coverage/coverage.json`  
**And** HTML format SHALL be saved to `coverage/index.html`  
**And** LCOV format SHALL be saved to `coverage/lcov.info`

### Requirement: Test Execution Scripts

The system SHALL provide npm scripts for different test scenarios.

#### Scenario: Run all tests

**Given** the project has multiple test types  
**When** a user runs `npm test`  
**Then** all unit tests SHALL execute  
**And** all integration tests SHALL execute  
**And** coverage SHALL be reported

#### Scenario: Run tests in watch mode

**Given** a developer is actively coding  
**When** a user runs `npm run test:watch`  
**Then** Vitest SHALL start in watch mode  
**And** SHALL re-run tests when files change  
**And** SHALL show only changed test results

#### Scenario: Run tests with UI

**Given** a developer wants visual test feedback  
**When** a user runs `npm run test:ui`  
**Then** Vitest UI SHALL open in browser  
**And** SHALL show test tree structure  
**And** SHALL allow filtering and re-running tests

#### Scenario: Run tests with coverage

**Given** a user wants to measure coverage  
**When** a user runs `npm run test:coverage`  
**Then** all tests SHALL execute  
**And** coverage reports SHALL be generated  
**And** coverage summary SHALL be displayed in terminal

### Requirement: Fast Test Execution

The system SHALL optimize test execution for developer productivity.

#### Scenario: Run unit tests quickly

**Given** unit tests are well-isolated  
**When** all unit tests run  
**Then** execution SHALL complete in < 10 seconds  
**And** SHALL not perform actual file I/O  
**And** SHALL not spawn real Electron processes

#### Scenario: Parallelize test execution

**Given** tests are independent  
**When** tests run  
**Then** Vitest SHALL run tests in parallel by default  
**And** SHALL use all available CPU cores  
**And** SHALL isolate tests in separate contexts

#### Scenario: Cache test results

**Given** tests have run previously  
**When** tests run again without code changes  
**Then** Vitest SHALL use cached results  
**And** SHALL only re-run changed tests  
**And** SHALL maintain cache validity

### Requirement: Test Environment Variables

The system SHALL configure environment variables appropriately for tests.

#### Scenario: Set NODE_ENV to test

**Given** tests are running  
**When** code checks `process.env.NODE_ENV`  
**Then** the value SHALL be 'test'  
**And** SHALL not be 'development' or 'production'

#### Scenario: Mock Electron environment variables

**Given** Electron provides environment information  
**When** tests access Electron-specific variables  
**Then** reasonable mock values SHALL be provided  
**And** SHALL not require actual Electron context

### Requirement: Cleanup and Teardown

The system SHALL clean up resources after each test to prevent leaks.

#### Scenario: Clear all mocks after each test

**Given** a test uses mocked functions  
**When** the test completes  
**Then** all mock call history SHALL be cleared  
**And** all mock implementations SHALL be reset  
**And** SHALL not affect subsequent tests

#### Scenario: Clear timers and intervals

**Given** a test uses setTimeout or setInterval  
**When** the test completes  
**Then** all timers SHALL be cleared  
**And** all intervals SHALL be cleared  
**And** SHALL not cause memory leaks

#### Scenario: Cleanup DOM between tests

**Given** renderer tests modify the DOM  
**When** each test completes  
**Then** the DOM SHALL be reset to initial state  
**And** all event listeners SHALL be removed  
**And** SHALL provide clean slate for next test
