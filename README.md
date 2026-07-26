# AWS Serverless Best Practices Skill

A compact best-practices skill for designing, reviewing, and implementing AWS serverless
and event-driven systems: Lambda, API Gateway, DynamoDB, Step Functions, SQS/SNS/EventBridge/Kinesis,
S3, IAM/security, observability, and cost.

`SKILL.md` holds the generic, cross-service rules, the service-selection table, and the
`/aws-serverless-skills` commands. Each file under `references/` holds small, service-specific best
practices that get loaded only when relevant.

## Install

### Option A: npx (no clone required)

```bash
npx aws-serverless-skills
```

With no arguments this installs to Codex, Claude Code (personal), and builds the Claude
Desktop zip in the current directory. Target a single surface by naming it:

```bash
npx aws-serverless-skills codex
npx aws-serverless-skills claude-code
npx aws-serverless-skills claude-code-project   # run from inside the target project's directory
npx aws-serverless-skills claude-desktop
```
 

### What each target does

- **Codex** — copies to `${CODEX_HOME:-$HOME/.codex}/skills/aws-serverless-skills`.
- **Claude Code (personal)** — copies to `$HOME/.claude/skills/aws-serverless-skills`, available in every project.
- **Claude Code (project)** — copies to `./.claude/skills/aws-serverless-skills` in whatever directory you run it from.
- **Claude Desktop** — builds `./dist/aws-serverless-skills.zip`. Claude Desktop loads skills as an uploaded zip, not from the filesystem, so upload it manually: **Settings → Capabilities → Skills → Upload**. Re-run and re-upload after any update.

 

## Using it

Once the skill is loaded (any surface above), it's used automatically when you're doing
AWS serverless design, review, or implementation work. It also recognizes two explicit chat
commands, documented in `SKILL.md`:

- **`/aws-serverless-skills init`** — read-only project discovery. Reads your IaC, handler code, and service wiring; asks clarifying questions where needed; then writes a `PROJECT_STRUCTURE.md` at the repo root capturing the IaC tool, language/runtimes, AWS services inventory, and event/request flows. Makes no code changes. Run this once per project — `audit` reads `PROJECT_STRUCTURE.md` as context.
- **`/aws-serverless-skills audit`** — read-only review of the current project against the full checklist, reported as `MUST FIX` / `SHOULD FIX` / `OK`.

