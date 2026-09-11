---
type: project-readiness
schema_version: 1
project_id: creative-computing-lab
project_lifecycle: active
auto_dev_scope: pilot_primary
pilot_priority: primary
scope_note: "Primary pilot candidate for the auto-dev protocol."
report_language: en-US
snapshot_date: 2026-09-11
base_branch: main
base_branch_commit: 46dd4a452ad477689a49e63807ec770e85854b0a
current_branch: codex/meta-work-pilot-readiness
current_branch_base: main
main_tracking_status: behind_origin_main_by_13
origin_main_ref: 12e5fb047b1fc639d0ee16817c20bacd105936d0
worktree: dirty
worktree_changes: "package.json; docs/agent-readiness.md"
generated_untracked: ".pnpm-store/index.db"
remote: configured
remote_name: origin
remote_url: "git@github.com:raissaccorreia/creative-computing-lab.git"
staging_local: present
staging_local_ref: refs/heads/staging
staging_local_commit: 46dd4a452ad477689a49e63807ec770e85854b0a
staging_remote_tracking: absent
staging_remote_path: unconfirmed
local_gate: "pnpm validate:pilot"
local_gate_definition: "pnpm typecheck && pnpm lint && pnpm build"
local_gate_status: blocked_environment
local_gate_failure_category: pnpm_dependency_preflight_requires_reinstall
local_gate_failure_codes: "ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY; ERR_PNPM_ABORTED_REMOVE_MODULES_DIR"
local_gate_checks_reached: none
workflow_files: absent_current_checkout
github_actions: absent_current_checkout
github_actions_gate: "not_found_in_current_checkout"
github_actions_mirror: not_applicable
branch_protection: not_verified
github_api: not_used
staging_environment: not_verified
human_promotion_path: required_not_verified
automation_eligibility: blocked
manual_development: allowed
promotion_path: "task-branch -> staging -> human PR -> main"
automation_boundary: "No unattended execution or promotion; remote staging and human promotion remain unconfirmed."
blocker_codes:
  - LOCAL_GATE_BLOCKED_BY_PNPM_ENVIRONMENT
  - LOCAL_MAIN_BEHIND_ORIGIN_MAIN
  - REMOTE_STAGING_PATH_UNCONFIRMED
  - HUMAN_PROMOTION_PATH_UNVERIFIED
  - WORKFLOW_FILES_ABSENT
observed_checks: "pnpm validate:pilot"
audit_mode: preparation_branch
---

# Project readiness state

Deterministic snapshot produced by the MW-GH-001 preparation run on 2026-09-11. The frontmatter is the queryable source; this prose records the evidence boundary. This file is intended to be included in the preparation PR.

## Policy

This state blocks unattended execution and promotion, not manual development. The intended path is `task branch -> staging -> human PR -> main`. This run created local refs and local changes only; it did not push, open a PR, merge, deploy, or change GitHub rulesets.

## Observed local state

- The current branch is `codex/meta-work-pilot-readiness`, based on local `main` at `46dd4a4`.
- Local `main` is behind the local `origin/main` tracking reference by 13 commits; no fetch or pull was performed.
- The local `staging` ref now exists at the same commit and was not checked out or pushed.
- The configured remote is `origin`; its URL is recorded from local Git configuration.
- No local `refs/remotes/origin/staging` reference was observed. The actual remote staging path was not queried in this run.
- The checkout contains the intended `package.json` change and this readiness file, plus the generated untracked `.pnpm-store/index.db`. The generated store is not intended for the preparation PR.
- `.github/workflows` is absent in this checkout; no GitHub Actions gate was observed locally.

## Local pilot gate result

Command: `pnpm validate:pilot`

Status: blocked before the project checks ran.

Failure category: `pnpm_dependency_preflight_requires_reinstall` (with the initial non-TTY error `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY`)

Relevant output:

```text
[ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY] Aborted removal of modules directory due to no TTY
[ERROR] Command failed with exit code 1: pnpm install
```

The gate did not reach `typecheck`, `lint`, or `build`. A second TTY attempt displayed a prompt to remove and reinstall `node_modules`; `n` was supplied to avoid an unapproved dependency installation, producing:

```text
[ERR_PNPM_ABORTED_REMOVE_MODULES_DIR] Aborted removal of modules directory
[ERROR] Command failed with exit code 1: pnpm install
```

It was not rerun with `CI=true` or another flag that could trigger dependency installation; no network installation was authorized.

## Automation boundary

Automation eligibility remains **blocked** until a remote staging path is explicitly confirmed and the human promotion path is available. Local branch creation and a local gate definition do not establish either condition. The next promotion step must be human-approved and must review the generated `.pnpm-store/index.db` before committing.

## Later human-approved promotion

After review and a local commit containing only the intended preparation files, the later remote command is:

```sh
git push -u origin codex/meta-work-pilot-readiness
```

That command is recorded for a later human-approved action and was not executed here.
