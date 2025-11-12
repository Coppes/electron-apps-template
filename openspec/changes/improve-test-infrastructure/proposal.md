# Proposal: Improve Test Infrastructure

## Summary

Tornar o sistema de testes mais robusto, adicionando infraestrutura completa de testes unitários, integração e E2E para garantir qualidade e confiabilidade do código.

## Motivation

Atualmente o projeto possui apenas 6 arquivos de teste com cobertura limitada:
- Mocks incompletos causando falhas (electronAPI.events.onUpdateAvailable não existe)
- Sem testes para módulos críticos do main process (window-manager, logger, lifecycle)
- Testes de segurança são placeholders (expect(true).toBe(true))
- Sem testes E2E para fluxos completos Electron
- Sem testes de integração main-renderer via IPC
- Sem CI/CD configurado para executar testes automaticamente
- Cobertura de código < 30% nos módulos core

Isso dificulta manutenção, aumenta bugs em produção e reduz confiança nas mudanças.

## Goals

1. Criar infraestrutura robusta de mocks e fixtures para Electron API
2. Atingir >80% de cobertura de código nos módulos core
3. Implementar testes E2E com Playwright para Electron
4. Adicionar testes de integração main-renderer via IPC
5. Configurar CI/CD para executar testes automaticamente
6. Criar helpers e utilitários de teste reutilizáveis

## New Capabilities

### test-infrastructure
Complete Vitest configuration with proper setup, teardown, and environment configuration for both renderer and main process testing.

### test-mocks-fixtures
Comprehensive mocks for Electron APIs (BrowserWindow, dialog, app, ipcMain, ipcRenderer) and reusable test fixtures.

### test-unit-coverage
Unit tests for all core modules achieving >80% coverage: window-manager, logger, lifecycle, updater, IPC handlers, security modules.

### test-integration
Integration tests for main-renderer communication via IPC, window lifecycle, and cross-process scenarios.

### test-e2e
End-to-end tests using Playwright for Electron to test complete user flows including window management, auto-update, and security features.

### test-ci
GitHub Actions workflow for automated testing on push/PR with coverage reporting and multi-platform testing (macOS, Windows, Linux).

## Dependencies

**Blocks**: None
**Blocked by**: None
**Extends**: add-electron-core-features (tests for existing features)
**Related**: All existing changes (tests validate implementations)

## Success Criteria

- [ ] Vitest setup completo com mocks robustos do Electron API
- [ ] >80% cobertura de código para módulos core
- [ ] Testes E2E executando fluxos principais com Playwright
- [ ] Testes de integração validando IPC main-renderer
- [ ] CI/CD executando testes em 3 plataformas (macOS, Windows, Linux)
- [ ] Todos os testes passando sem placeholders ou mocks quebrados
- [ ] Documentação de como escrever e executar testes

## Out of Scope

- Performance/load testing (deferir para futuro)
- Visual regression testing (deferir para futuro)
- Mutation testing (deferir para futuro)
- Testes de acessibilidade automatizados (deferir para futuro)

## Open Questions

1. Usar Playwright ou Spectron para testes E2E? (Playwright é mais moderno e mantido)
2. Executar testes E2E em CI ou apenas localmente? (CI para PR principal)
3. Mockar ou usar Electron real nos testes unitários? (Mockar para velocidade)

## Effort Estimate

- Infrastructure setup: 8 horas
- Mocks and fixtures: 12 horas
- Unit tests (core modules): 20 horas
- Integration tests: 8 horas
- E2E tests: 12 horas
- CI/CD setup: 6 horas
- Documentation: 4 horas

**Total: ~70 horas** (paralelizável para ~40 horas com equipe)
