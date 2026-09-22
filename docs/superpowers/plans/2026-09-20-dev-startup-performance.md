# Dev Startup Performance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reduce the delay before the first localhost page response during `npm run dev`.

**Architecture:** Narrow TypeScript discovery to application source and exclude generated directories. Keep MDX dependencies out of the shared component barrel so normal routes do not import the MDX compiler transitively.

**Tech Stack:** Next.js 15, TypeScript, React, `next-mdx-remote`.

---

### Task 1: Narrow TypeScript File Discovery

**Files:**
- Modify: `tsconfig.json`

- [ ] Update `include` to `next-env.d.ts`, `src/**/*.ts`, and `src/**/*.tsx`.
- [ ] Add `.next`, `.git`, `node_modules`, and generated build directories to `exclude`.
- [ ] Run `node_modules/.bin/tsc --noEmit` and confirm it exits instead of hanging.

### Task 2: Remove Global MDX Barrel Import

**Files:**
- Modify: `src/components/index.ts`
- Modify: `src/app/blog/[slug]/page.tsx`
- Modify: `src/app/work/[slug]/page.tsx`

- [ ] Remove the `CustomMDX` export from `src/components/index.ts`.
- [ ] Import `CustomMDX` directly from `@/components/mdx` in both dynamic pages.
- [ ] Keep all other barrel exports unchanged.
- [ ] Run TypeScript validation again.

### Task 3: Verify Dev Response Timing

**Files:**
- No additional files.

- [ ] Run `npm run dev` on an unused port.
- [ ] Request `/` with `curl` and record first-response time.
- [ ] Confirm Next reports route compilation completion and the request returns successfully.
- [ ] Run `node_modules/.bin/next build` and confirm the build completes or reports only pre-existing issues.
