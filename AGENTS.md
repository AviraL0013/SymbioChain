# Repository instructions

- Apply `C:/Users/lenovo/.agents/skills/caveman/SKILL.md` in full mode for chat. Use normal English in persisted artifacts.
- Keep work local. Never push, publish, deploy, or trigger remote CI without explicit user authorization. Nothing may be published before November 1, 2026.
- Create or amend commits only when requested. Commit dates are explicitly assigned by the user; do not change the system clock or global Git identity.
- Follow `docs/design/reference.md`. The user's Ctrl reference takes precedence over generic visual presets.
- Current scope is structure and tooling. Implement page design and animations only when requested.
- Keep route files thin, behavior under `features`, reusable primitives under `components/ui`, and API contracts under `packages/shared`.
- Never expose wallet keys or inference credentials through `NEXT_PUBLIC_*` variables.
- Run `npm run check` before committing. Do not fabricate live telemetry, successful trades, or verified attestations.
