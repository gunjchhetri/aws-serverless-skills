# Step Functions Reference


## Best Practices

- Always set the state machine type explicitly - CDK and SAM both default to Standard.
- Use Express for high-volume workflows under 5 minutes; use Standard for long workflows, human-approval waits, exactly-once semantics, or audit history.
- Always set `MaxConcurrency` on `Map` states - omitting it fans every item out simultaneously and can throttle the account.
- Prefer `waitForTaskToken` over polling loops for external waits - a polling loop bills a transition on every iteration; a task token costs nothing while waiting. The external system calls `SendTaskSuccess`/`SendTaskFailure` when ready.
- When needed integration with other services like eventbridge, api gateways, use them directly instead of a pass-through Lambda.
- Start executions with a deterministic name (e.g. derived from the source event) for idempotent/deduplicated starts - Step Functions rejects a duplicate name while that execution is still active.
- Express is at-least-once; design handlers to be idempotent.
- Never pass dynamic payload with unknown size in step function input, use s3 and pass the keys.
- if retry is there, make sure to use exponential backoff and max attempts. dont loop for infinity.
