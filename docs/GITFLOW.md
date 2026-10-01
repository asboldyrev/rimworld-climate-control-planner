# GitFlow strategy

RimWorld Climate Control Planner uses a lightweight GitFlow-style branch model.

## Branch roles

- `main` — stable/release-ready code only.
- `dev` — integration branch and normal base/target for ongoing development.
- `feature/*`, `agent/*`, and other short-lived branches — isolated development work. They target `dev`, not `main`.

## Delivery flow

1. Create/update `dev` from the accepted stable baseline.
2. Create a short-lived branch from current `dev`.
3. Implement and verify the change.
4. Open a pull request into `dev`.
5. The repository owner reviews and merges.
6. When a stable release is ready, promote `dev` to `main` through a deliberate pull request/release step.

For AI-assisted work, `AGENTS.md` adds stricter rules: agents do not modify `main` and do not merge their own branches.

## CI policy

CI is not yet established for the rewrite baseline.

When introduced:

- run it for pull requests targeting `dev` or `main`;
- avoid duplicate expensive workflows on every short-lived branch push unless there is a clear benefit;
- require only checks that are stable enough to be meaningful gates;
- include calculation/unit tests and production build at minimum once those tests exist.

## Deployment

The application is a static/client-side frontend unless future requirements add a backend.

Deployment automation is not yet defined. Do not invent production/CD assumptions before the repository has an accepted deployment process.

## Documentation

Update this file when branch roles, PR targets, CI triggers/checks or deployment/release gates change.
