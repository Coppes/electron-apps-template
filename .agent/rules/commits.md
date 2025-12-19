---
trigger: always_on
glob: "**/*"
description: Rules for git commits
---

# Commit Rules

## Format
Use **Conventional Commits**:
- `feat`: New feature
- `fix`: Bug fix
- `chore`: Maintenance
- `docs`: Documentation
- `test`: Tests
- `refactor`: Code restructuring
- `perf`: Performance
- `style`: Formatting/Styles
- `ci`: CI configuration

## Frequency
- **Significant Changes**: Commit when you have made significant progress or completed a logical unit of work.
- **Ask First**: "Commit if are significant changes" (ask user if unsure).

## Workflow
- **Branches**: Create feature branches from `main`.
- **Protection**: Do not commit directly to protected branches (main) without verification.
