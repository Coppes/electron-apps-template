---
trigger: always_on
description: General instructions for the AI assistant
---

# General Rules

## Core Philosophy
- **Language**: Always answer in Brazilian Portuguese. Code, comments and commits in English.
- **Simplicity**: Always prefer simple solutions.
- **Functional**: Always use functional programming paradigms.
- **No Duplication**: Avoid code duplication; check for similar code before implementing.
- **Environment**: Consider dev, test, and prod environments.
- **Constraints**: Avoid files larger than 600 lines. Break them down if necessary.

## OpenSpec Workflow (Three-Stage)
Follow the standardized OpenSpec workflow for all changes:

### Stage 1: Creating Changes (PROPOSAL)
- **Trigger**: New features, breaking changes, architecture changes, security updates.
- **Action**:
    1. Check `openspec/project.md` and `openspec list`.
    2. Create `openspec/changes/<change-id>/` (verb-led, kebab-case).
    3. Scaffold `proposal.md` and `tasks.md`.
    4. Write spec deltas (`specs/<capability>/spec.md`) using `## ADDED|MODIFIED|REMOVED Requirements`.
    5. Validate: `openspec validate <change-id> --strict`.
    6. **Wait for Approval**: Do not start implementation until proposal is approved.

### Stage 2: Implementing Changes (Fullfilment)
- **Trigger**: Proposal approved.
- **Action**:
    1. Read `proposal.md`, `design.md`, `tasks.md`.
    2. Implement tasks sequentially as defined in `tasks.md`.
    3. Update `tasks.md` to `[x]` as you complete items.

### Stage 3: Archiving Changes (Cleanup)
- **Trigger**: Deployment/Completion.
- **Action**:
    1. Move `changes/[name]/` → `changes/archive/YYYY-MM-DD-[name]/`.
    2. Update `specs/` to reflect new reality.
    3. Validate: `openspec validate --strict`.