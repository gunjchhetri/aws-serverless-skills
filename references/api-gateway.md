## API Gateway Best Practices

- Validate request payload/params at the gateway with JSON Schema request validators.
- Use direct service integrations (DynamoDB, SQS, SNS, Step Functions) instead of a Lambda pass-through where applicable.
- Set throttling (rate/burst) at the gateway so spikes don't hit Lambda concurrency or the database directly.
- Never proxy large payloads through API Gateway (10 MB hard limit) — use S3 presigned URLs instead.
- Use explicit CORS origins for authenticated APIs.
- Don't expose internal identifiers, ARNs, tokens, stack traces, or raw database errors in API responses.
- Default to HTTP API; use REST API only for usage plans/API keys, private APIs, or other REST-only features like streaming.
