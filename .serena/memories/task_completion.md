# Completion checks
- For code changes, run `vp fmt`, `vp lint`, `vp check`, relevant typecheck, and relevant Vitest tests; use coverage when the plan requests a threshold.
- For plugin refactors, verify `packages/app/src/main.ts` config shape and update `packages/app/src/main.test.ts` in the same change.
- Before final response inspect `git diff` and `git status --short`; report any check that could not run.