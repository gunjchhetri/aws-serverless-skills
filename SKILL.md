---
name: aws-serverless-skills
description: >
  Use when designing, reviewing, or implementing AWS serverless and event-driven systems,
  especially Lambda, S3, DynamoDB, Step Functions, SQS, SNS, EventBridge, API Gateway,
  IAM, CloudWatch, CDK, SAM, Terraform, and cost-aware AWS service selection.
  Applies to architecture choices, infrastructure-as-code, handlers, data models, queues,
  workflows, observability, security, and production readiness reviews.
---

# AWS Serverless Best Practices

Use this skill as a compact design checklist before writing or reviewing AWS serverless code.
Prefer simple managed services, minimal services, explicit trade-offs, least privilege, observability, and cost-aware defaults.

## Commands

Once this skill is loaded, treat a user message that is exactly `/aws-serverless-skills init` or `/aws-serverless-skills audit` as an explicit trigger for the workflow below — this works on any surface where the skill is loaded (Claude Code, Claude Desktop, Codex), no separate installation needed beyond the skill itself.

### `/aws-serverless-skills init`

Read-only project discovery — makes no code or IaC changes. Tell the user upfront: "Running init: I'll read your project and write PROJECT_STRUCTURE.md. No files will be modified except that one."

Steps:

1. **Discover IaC** — look for `cdk.json`, `samconfig.toml`, `template.yaml`, `serverless.yml`, `terraform/`, `*.tf`. If none found, ask the user which IaC tool the project uses before proceeding.
2. **Identify language and runtime** — check `package.json`, `requirements.txt`, `go.mod`, `pom.xml`, etc. to determine the primary language and Lambda runtimes in use.
3. **Map services** — enumerate every AWS service referenced across IaC and handler code: Lambda functions (name, trigger, timeout, memory), API Gateway routes, DynamoDB tables (key schema if visible), queues/topics/buses, Step Functions state machines, S3 buckets, scheduled jobs, and any other AWS resources declared.
4. **Understand data and event flows** — trace the main request/event paths through the services (e.g. "API GW → Lambda → DynamoDB", "EventBridge → SFN → Lambda → SQS").
5. **Ask when uncertain** — if a service's purpose, a flow, or a key design decision is not clear from the code, ask before writing the summary. Limit questions to what is genuinely missing and not inferable.
6. **Write `PROJECT_STRUCTURE.md`** at the repo root with these sections:

```
# Project Structure

## Overview
[One paragraph: what the project does, its scale/audience if known]

## IaC
[Tool and entry point, e.g. "CDK (TypeScript), lib/stack.ts"]

## Language & Runtimes
[e.g. "TypeScript, Node.js 20.x"]

## AWS Services
| Service | Resource name / identifier | Purpose |
|---------|---------------------------|---------|

## Event & Request Flows
- [e.g. "POST /orders → API GW → OrderHandler Lambda → DynamoDB orders table → EventBridge order-bus"]

## Open Questions
[Anything not determinable from the code and not answered during init — left for the user to fill in]
```

### `/aws-serverless-skills audit`

Read-only review against this skill's full checklist — makes no code or IaC changes.

- If `PROJECT_STRUCTURE.md` exists, read it first to understand services and flows before scanning the code.
- Load only the `references/*.md` files relevant to the services actually present in the repo.
- Check the code/IaC against Service Selection, Hard Rules, and Default Practices.
- Report findings using the Output Expectations format below (`MUST FIX` / `SHOULD FIX` / `OK`), ordered by severity.

## Service Selection

| Need                         | Prefer                     | Avoid / use only with reason                    |
| ---------------------------- | -------------------------- | ----------------------------------------------- |
| Multi-step orchestration     | Step Functions             | Lambda chaining                                 |
| High-volume short workflows  | Step Functions Express     | Standard by default                             |
| Single async handoff         | Lambda async invoke or SQS | SNS with one subscriber                         |
| Work queue / backpressure    | SQS Standard               | Direct fan-out to slow consumers                |
| Ordering / dedupe            | SQS FIFO                   | Kinesis for ordering                            |
| Multi-consumer domain event  | EventBridge or SNS->SQS    | Lambda if/else routing                          |
| Large object upload/download | S3 presigned URLs          | API Gateway proxying large files                |
| Public HTTP API              | HTTP API                   | REST API unless a REST-only feature is required |
| S3 analytics                 | Athena + Glue + Parquet    | Lambda scanning S3 files                        |
| Scheduled / cron jobs        | EventBridge Scheduler      | legacy eventbridge scheduler                    |

## Hard Rules

- Do not build synchronous compute-to-compute chains. Use async invoke, a queue, an event bus, or Step Functions.
- Do not run compute for work that can exceed its execution time limit (Lambda: 15 min). Split or orchestrate instead.
- Do not store secrets in plaintext - env vars, code, logs, or templates. Use Secrets Manager or SSM SecureString.
- Do not grant wildcard permissions (`Resource: "*"`). Scope IAM to exact resources.
- Do not leave CloudWatch log groups at infinite retention.
- Do not add a service hop with no reliability, scale, fan-out, or operational value.
- Always delete the previous lambda layer version when deploying a new version.
- Always add max retries, default it to 3 for all async invocations like, sqs, dynamodb streams, kinesis streams.
-

## Default Practices

- Make every async/event-driven handler idempotent - SQS, SNS, EventBridge, Kinesis, and Step Functions Express are all at-least-once.
- Enable partial batch failure reporting on SQS, Kinesis, and DynamoDB Stream Lambda consumers where supported.
- Implement correlation/request ID tracking across services.
- Use structured JSON logs, metrics, and traces; alarm on errors, throttles, latency, DLQ depth, iterator age, and cost anomalies.
- Validate required environment variables at cold start.

## Cost Checks

Before finalizing a design, check:

- Can HTTP API replace REST API?
- Can Express Step Functions replace Standard?
- Can DynamoDB stay on-demand until traffic stabilizes?
- Are logs, traces, and retained payloads bounded?
- Is any service hop adding cost without adding value?
- Do CloudFront invalidations use `/*` instead of per-file paths? (1k free paths/month; per-file enumeration across rapid redeploys can spike cost really soon
- Are all SQS queues using long polling (`ReceiveMessageWaitTimeSeconds = 20`)? Short polling on 10+ idle queues exhausts the 1M/month free tier in ~7 days.

## Reference Map

Load only the files relevant to the current task:

- `references/lambda-patterns.md`: invocation, cold starts, concurrency, timeouts.
- `references/step-functions.md`: Express vs Standard, Map concurrency, callbacks, idempotency.
- `references/messaging.md`: SQS, SNS, EventBridge, Pipes, Kinesis, Firehose.
- `references/dynamodb.md`: access patterns, keys, GSIs, Streams, TTL, capacity, DAX.
- `references/storage.md`: S3 lifecycle, presigned URLs, storage classes.
- `references/cloudfront.md`: distributions, price classes, invalidation cost patterns.
- `references/api-gateway.md`: HTTP vs REST, auth, throttling, payload limits.
- `references/observability.md`: Powertools, X-Ray, logs, alarms, metrics.
- `references/data-analytics.md`: Athena, Glue, Firehose, OpenSearch.

## Output Expectations

When reviewing, lead with findings ordered by severity:

- `MUST FIX`: violates a hard rule or creates material security, reliability, scale, or cost risk.
- `SHOULD FIX`: a simpler, cheaper, or more operable AWS-native pattern exists.
- `OK`: current design is appropriate for the stated workload.

End architecture or implementation responses with:

```markdown
## Serverless Design Decisions

- [Choice] -> [Why]
```
