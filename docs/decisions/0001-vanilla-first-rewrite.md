# ADR 0001: Vanilla-first rewrite and mod isolation

Status: accepted

Date: 2026-10-02

## Context

The repository contains an older climate-control calculator built around the RimWorld mod Centralized Climate Control.

The project is now being rewritten. The immediate product goal is to calculate requirements for vanilla RimWorld climate-control devices and mechanics. Mod support may return later.

Reusing the old application's mod-centered data model as the foundation would risk mixing mod assumptions with vanilla mechanics and make verified vanilla calculations harder to reason about and test.

## Considered approaches

### 1. Incrementally adapt the existing mod calculator

Keep the current architecture/data model and add vanilla devices into it.

Advantages:
- less immediate code replacement.

Disadvantages:
- preserves assumptions created for a different thermal system;
- increases coupling between vanilla and mod rules;
- makes correctness harder to audit.

### 2. Rewrite around vanilla mechanics, then add mod support as a separate ruleset

Build a clean calculation core around verified vanilla behavior and add mod-specific behavior later behind a separate boundary.

Advantages:
- vanilla correctness remains independently testable;
- mod support cannot silently change vanilla rules;
- old code can be reused selectively rather than becoming a constraint.

Disadvantages:
- requires more initial rewrite work;
- some legacy features may need to be reimplemented.

## Decision

Rewrite the calculator around vanilla RimWorld mechanics first.

The existing application is legacy reference material, not an architecture to preserve.

Centralized Climate Control support is deferred until the vanilla implementation is stable and must be added as a separate ruleset/module/adapter where practical.

The vanilla calculation core must not depend on mod-specific concepts.

## Consequences

- Feature parity with the legacy calculator is not a rewrite requirement.
- Legacy Bulma/Remix Icon/mod-specific code may be removed.
- Calculation tests and source-backed constants become first-class project infrastructure.
- Shared abstractions should be introduced only when they reflect genuine common concepts.
- Future mod work requires its own tests and documentation and must not change established vanilla results.
