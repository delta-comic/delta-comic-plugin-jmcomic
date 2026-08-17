# Toolchain
- TypeScript + Vue 3 SFCs in the app package; Composition API / `<script setup lang="ts">` for Vue work.
- pnpm workspace with dependency versions managed by `pnpm-workspace.yaml` catalogs; do not alter versions casually.
- Vite+ unified CLI is mandatory: use `vp` for install, build, check, lint, format, typecheck, and tests.
- Tests use Vitest; app tests are under `packages/app/src/**/*.test.ts`, SDK tests under `packages/sdk/test`.
- App styling follows project rule: Tailwind CSS rather than handwritten CSS for new styling.