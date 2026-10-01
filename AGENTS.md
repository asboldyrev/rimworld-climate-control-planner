# Agent instructions

This file is the entry point for AI-assisted work in the RimWorld Climate Control Planner repository.

## Required reading before work

Before proposing or implementing a change, read the current `dev` branch and, in this order:

1. `AGENTS.md`
2. `docs/PROJECT_CONTEXT.md`
3. `docs/PROJECT_STATUS.md`
4. `docs/ROADMAP.md`
5. `docs/ARCHITECTURE.md`
6. `docs/DEVELOPMENT.md`
7. `docs/TESTING.md`
8. `docs/DOCUMENTATION.md`
9. relevant files in `docs/decisions/`
10. `BACKLOG.md` when the task concerns deferred work

Repository-specific skills may live under `.agents/skills/*/SKILL.md`. Read the relevant skill before implementation when the task matches its scope.

Do not rely on an old conversation as the source of truth when the repository documentation or current `dev` differs from it.

## Repository workflow

- Never modify `main` as part of agent work.
- Start every task from the latest `dev`.
- Use a separate short-lived branch for each task: `agent/<short-task-name>`.
- Do not merge an agent branch into `dev` or `main`.
- The repository owner performs local/manual verification when needed, opens/reviews the PR, and merges it manually.
- Agent branches target `dev`.
- Keep one branch focused on one coherent change. Do not silently add unrelated cleanup.

If the requested task conflicts with these rules, stop and point out the conflict instead of changing `main` or bypassing `dev`.

## Before implementation

- Inspect the current implementation on `dev`; documentation describes intent/state but does not replace code inspection.
- Check `docs/PROJECT_STATUS.md` for the current work checkpoint and immediate next step.
- Check relevant ADRs before proposing a different architecture. If a previous decision is no longer appropriate, propose superseding it rather than silently ignoring it.
- Check `BACKLOG.md` so an existing deferred task is not duplicated.
- For frontend work, inspect the current tests and `docs/TESTING.md` so existing calculation and critical-flow regression coverage is not accidentally broken or bypassed.
- Treat the existing application as legacy reference material during the rewrite. Do not preserve old architecture, styling, dependencies or mod-specific assumptions unless current documentation explicitly requires them.
- Do not introduce Centralized Climate Control mod behavior into the vanilla calculation core. Mod support is a later extension and must remain isolated from vanilla rules.

## Verification

Run or update the checks relevant to the change. At minimum, consider:

- unit tests for temperature/calculation rules;
- regression tests for previously verified RimWorld mechanics;
- component/interaction tests for critical calculator flows;
- `npm run build` for production build integrity;
- lint/type checks when they exist in the current repository;
- regression coverage for a bug fix.

A visual-only change does not require a test for every CSS adjustment, but changes to shared controls, calculator inputs, state persistence, result interpretation or calculation logic require review of relevant tests.

Do not claim a check passed unless it was actually run successfully.

## Documentation is part of the change

Documentation must be updated in the same branch when the code or accepted decision changes documented project state.

Use `docs/DOCUMENTATION.md` as the authoritative maintenance policy. In particular:

- update `docs/PROJECT_STATUS.md` when the current checkpoint, completed work, immediate next task, blocker, or active phase changes;
- update `docs/ARCHITECTURE.md` when the current system structure, calculation-engine boundaries, state ownership, persistence model, routing model, or major integration pattern changes;
- update `docs/ROADMAP.md` only when milestone scope/order/status changes, not for every small implementation detail;
- update `BACKLOG.md` when a deferred task is added, removed because it is completed, or materially re-scoped;
- create an ADR in `docs/decisions/` for a durable architectural/product-engineering decision with meaningful alternatives or long-term consequences;
- update `docs/PROJECT_CONTEXT.md` only when stable product/technical context changes;
- update `docs/DEVELOPMENT.md`, `docs/TESTING.md` or `docs/GITFLOW.md` when developer workflow, test strategy, local setup, CI/CD policy, or branch process changes;
- update the relevant `.agents/skills/*/SKILL.md` only when the procedure itself changes, not when an individual task merely uses it.

Do not maintain a changelog in these files. Git history and PRs are the history; project documentation should describe the current truth.

## Conversation lifecycle

Long-running project work should be split across conversations at stable project checkpoints so work does not need to continue until a conversation reaches its context limit.

### When to suggest a new conversation

Suggest starting a new conversation when at least one of these conditions is true:

- a major roadmap stage has been completed;
- a substantial self-contained work package has been completed and the next work starts a new logical area;
- the current work has accumulated substantial context and a stable checkpoint has been reached where continuation can be reconstructed from repository documentation.

Do not suggest a new conversation after every PR, small bug fix, or minor subtask. Prefer natural handoff boundaries over arbitrary message counts.

Before suggesting a handoff, make sure `docs/PROJECT_STATUS.md` accurately records the current checkpoint, completed work, immediate next task and any relevant blockers/decisions. The repository documentation must be sufficient for the next conversation to resume without copying the previous chat history.

When suggesting a new conversation, include a short suggested opening prompt. Prefer something concise such as:

> Work on RimWorld Climate Control Planner. Inspect the latest `dev`, start with `AGENTS.md`, read the linked project documentation, determine the current checkpoint from `docs/PROJECT_STATUS.md`, and continue from there.

Do not create a large conversation transcript or handoff summary when repository documentation already contains the necessary context.

### Deferring the handoff

The repository owner may decline or postpone a suggested new conversation. A handoff suggestion must never block ongoing work.

If the owner specifies a future checkpoint, treat that checkpoint as the next conversation-handoff trigger. Do not suggest a new conversation again before that checkpoint unless the owner explicitly asks to reconsider earlier.

When the specified checkpoint is reached, suggest the new conversation again.

If the owner only says `later` without naming a checkpoint, do not repeat the suggestion immediately or after an arbitrary number of messages. Wait until the next meaningful project checkpoint and then suggest it again once.

A deferred handoff is temporary conversation state and should not be written into repository project documentation unless it independently changes the project's real current checkpoint or roadmap.

## End-of-task handoff

When implementation is ready for owner verification:

- state the branch name;
- summarize what changed;
- list automated checks that were run and their result;
- list any manual checks the owner should perform;
- mention documentation files updated as part of the change;
- do not merge the branch.
