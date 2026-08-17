# Commands
- Install after remote changes: `vp install`.
- Full checks: `vp check`; formatting: `vp fmt`; lint: `vp lint`.
- Full typecheck: `vp run -r typecheck`; app target can be run through the package task/filter.
- Tests: `vp test run`; coverage: `vp test run --coverage`; SDK-only tests: `vp test run --project sdk` when configured.
- Build: root `vp run -t @delta-comic/plugin-jmcomic#build` or package/root `vp run ...` task form.
- Inspect state with `git status --short` and `git diff`; do not reset or checkout unrelated work.