---
trigger: always_on
glob: "**/*"
description: Rules for tool usage
---

# Tool Usage Rules

## File System
- **Paths**: ALWAYS use absolute paths for file operations.
- **Directory Listing**: Use `list_dir` to explore before assuming structure.
- **Search**: Use `find_by_name` (fd) or `grep_search` (ripgrep) for efficient searching.

## Terminal
- **Dev Server**: Use `npm run dev` (calls specific electron-vite scripts).
- **Build**: Use `npm run build` to verify production builds.
- **Package Management**: Use `npm` exclusively (as per package-lock.json).
- **Auto-Confirm**: Use `npx -y` for one-off commands.

## Codebase knowledge
- **Context**: Use `view_file` on `openspec/project.md` to understand architecture.
