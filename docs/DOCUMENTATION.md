# Documentation maintenance policy

This document defines what each project document means, when it must change, and what must not be written there. Its purpose is to make repository documentation sufficient for continuing work in a new conversation without reconstructing prior chat history.

## General rules

1. Repository documentation describes the current project truth, not a transcript of past work.
2. Git commits and pull requests are the historical record. Do not duplicate them as a chronological diary in project docs.
3. Documentation changes belong in the same branch/PR as the code or decision that makes them necessary.
4. Do not update a document merely because a file was touched. Update it only when the kind of information owned by that document changed.
5. Prefer small, precise updates. Avoid copying the same information into several files.
6. When documents conflict, inspect the current `dev` code and correct stale documentation in the same work branch.
7. Future ideas must be clearly separated from current architecture/state.

## Source-of-truth map

### `AGENTS.md`

**Owns:** rules for AI-assisted work in this repository, including conversation lifecycle/handoff behavior.

Update when:
- branch/PR responsibilities change;
- required reading or end-of-task handoff rules change;
- conversation lifecycle/new-conversation rules change;
- verification expectations change;
- documentation-maintenance responsibilities change;
- a recurring repository-specific procedure becomes mandatory for agents.

Do not put here:
- product roadmap details;
- current feature progress;
- detailed calculation architecture that belongs in `ARCHITECTURE.md`.

### `docs/PROJECT_CONTEXT.md`

**Owns:** stable product and technical context needed to understand the calculator.

Update when:
- core product purpose changes;
- major domain concepts change;
- a durable technology choice changes;
- repository/application boundaries change;
- durable vanilla/mod scope changes.

Do not update for:
- a normal feature implementation;
- a bug fix;
- the current task;
- temporary blockers.

### `docs/PROJECT_STATUS.md`

**Owns:** the current checkpoint: active phase, recently completed work, immediate next task and current blockers.

Update when:
- a meaningful work package is completed/merged;
- active roadmap phase changes;
- immediate next task changes;
- a blocker appears/resolves;
- planned execution order intentionally changes.

Keep it short and current. Replace stale state instead of appending history.

### `docs/ROADMAP.md`

**Owns:** high-level sequence/status of major project stages.

Update when:
- a stage starts/completes;
- stage ordering changes;
- a stage is added, removed, split, merged or materially re-scoped;
- release-stage scope changes.

Do not update for every PR/subtask.

### `docs/ARCHITECTURE.md`

**Owns:** how the system is structured now and clearly marked accepted target structure while the rewrite is in progress.

Update when:
- frontend/domain boundaries change;
- calculator-engine responsibilities change;
- state ownership/persistence/routing boundaries change;
- integrations or deployment topology materially change.

Never present planned architecture as already implemented.

### `docs/DEVELOPMENT.md`

**Owns:** practical developer workflow and local verification conventions.

Update when:
- setup commands change;
- toolchain/workflow changes;
- build/test commands change;
- recurring implementation conventions change.

### `docs/TESTING.md`

**Owns:** automated testing strategy, locations/frameworks, calculation-validation expectations and test maintenance rules.

Update when:
- test framework/configuration changes materially;
- test directories/canonical commands change;
- CI test gates change;
- regression policy changes;
- source-backed/numerical validation policy changes.

### `docs/GITFLOW.md`

**Owns:** branch roles, integration flow, CI/CD branch policy and deployment gates.

Update when:
- branch roles/names change;
- PR target rules change;
- CI triggers/required checks change;
- deployment policy changes.

### `BACKLOG.md`

**Owns:** known deferred work that should not be lost but is not the current execution checkpoint.

Update when:
- a deferred task is accepted;
- a deferred task is completed;
- a task is materially re-scoped/dropped.

### `docs/decisions/*.md` (ADRs)

**Owns:** durable decisions where the reason matters later.

Create an ADR when a decision:
- has multiple reasonable alternatives;
- affects major architecture/domain modeling;
- constrains future implementation significantly;
- defines a calculation approximation/compatibility rule likely to be revisited;
- would otherwise likely be re-debated.

An ADR should contain:
- status;
- date;
- context/problem;
- considered alternatives when useful;
- decision;
- reasons;
- consequences/trade-offs.

Accepted ADRs are historical records. Supersede old ADRs instead of rewriting history.

### `.agents/skills/*/SKILL.md`

**Owns:** repository-specific procedures for recurring specialized work.

Update a skill when the procedure itself changes, not when a task merely uses it.

## Documentation update matrix

| Change | Required documentation |
| --- | --- |
| Small bug fix, no lasting design change | Usually none; `BACKLOG.md` if completing an existing item |
| Completes current work package | `PROJECT_STATUS.md`; roadmap only if stage status changes |
| New deferred task | `BACKLOG.md` |
| Stable major product/domain concept | `PROJECT_CONTEXT.md`, possibly `ARCHITECTURE.md` |
| Calculation/system boundary change | `ARCHITECTURE.md` + usually an ADR |
| Durable calculation modeling decision | ADR + affected architecture/context docs |
| Roadmap reordering/re-scope | `ROADMAP.md`, and `PROJECT_STATUS.md` if current/next work changes |
| Local dev/test process changes | `DEVELOPMENT.md`; `TESTING.md` if testing policy changes |
| Branch/CI/CD process changes | `GITFLOW.md`; `AGENTS.md` if agent behavior changes |
| Repository skill procedure changes | relevant `.agents/skills/*/SKILL.md` |
| Vanilla/mod product-scope boundary changes | `PROJECT_CONTEXT.md` + `ROADMAP.md` |

## End-of-PR documentation check

Before handing a branch to the owner, ask:

1. Did this change alter the current project checkpoint?
2. Did it alter how the system/calculation engine is structured?
3. Did it make a durable decision future work needs to understand?
4. Did it add or complete deferred work?
5. Did it alter development, testing, branching, CI or deployment process?
6. Did it alter a recurring repository skill/procedure?
7. Did it change durable vanilla/mod scope?
8. Did it change persistent AI conversation lifecycle/handoff behavior?

Update only the documents whose answer is yes.
