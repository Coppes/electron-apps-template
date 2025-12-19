---
trigger: always_on
description: Rules for linting, testing, and error handling
---

# Linting, Tests, and Errors

## Debugging Workflow (Debug Mode)
When asked to enter "Debug Mode", follow this sequence:
1. **Reflect**: List 5-7 possible causes.
2. **Narrow**: Identify 1-2 most probable causes.
3. **Log**: Add logs to track data transformation.
4. **Gather**: Use `getConsoleLogs`, `getNetworkLogs` (or ask user).
5. **Analyze**: Reflect deeply on findings.
6. **Fix**: Implement correction.
7. **Clean**: Remove added logs (ask permission).

## Testing Strategy
- **Unit/Integration**: Use **Vitest** (`npm run test:unit`).
- **E2E**: Use **Playwright** (`npm run test:e2e`).
- **Memory**: Use **Hybrid Playwright + MemLab** (`npm run test:memory`).
- **Coverage**: Aim for >80% coverage on core modules.

## Testing Rules
- **No Test Outcomes in Errors**: Do not include test results in error messages unless relevant.
- **Functional Code**: Use functional patterns in tests.
- **Mocking**: Use `test/setup/electron-mocks.js` for Electron APIs.

## Linting
- **Enforcement**: Run `npm run lint` to verify.
- **Standards**: ESLint with Airbnb + React recommended configs.
- **Fixes**: Prefer fixing lint errors over disabling rules.
