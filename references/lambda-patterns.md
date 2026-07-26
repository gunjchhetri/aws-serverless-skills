# Lambda Patterns Reference



## Lambda-to-Lambda

- Never invoke another Lambda synchronously (`RequestResponse`). Use async invoke (`Event`) when the result isn't needed, or Step Functions Express when it is.
- Avoid single-subscriber SNS as a relay between two Lambdas — use a direct async invoke instead. Keep SNS only for 2+ subscribers, SQS fan-out, cross-account delivery, or attribute-based filtering.

## Connections and Secrets

- Initialize DB connections, SDK clients, and secrets outside the handler (module/init scope) so they're reused across warm invocations.
- Cache secrets at module/init scope, or use the Secrets/Parameters Lambda extension, instead of fetching per invocation.



## Cold Start Mitigation

- Java: enable SnapStart, deployed via a published version + alias.
- Provisioned concurrency: use only for latency-sensitive customer-facing paths, not background/batch workers.

## Concurrency Limits

- Set reserved concurrency on risky or high-cost functions to cap their blast radius on the account-level concurrency pool.
- Set `batchSize` and `maxConcurrency` on event source mappings for background/batch triggers.

## Timeout Guidance

| Timeout | Signal |
|---------|--------|
| < 30s | Good for API-facing functions |
| 30s–5 min | Acceptable for background tasks; validate the need |
| 5–15 min | Consider Step Functions orchestration with Lambda steps |
| 15 min (max) | Redesign as a Step Functions workflow |
