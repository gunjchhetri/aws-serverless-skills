# Observability Reference

## Logging, Tracing, Metrics

- Use a structured logging/tracing/metrics library (e.g. AWS Lambda Powertools for Python/TypeScript/Java/.NET) instead of raw `print`/`console.log`.
- Emit structured JSON logs with request/correlation IDs, not free-text lines.
- Enable X-Ray tracing on Lambda, API Gateway, and Step Functions — it is off by default at every layer.
- Instrument outbound AWS SDK clients for tracing so downstream calls appear as subsegments.

## CloudWatch Log Retention

Always set explicit retention on every log group — never leave it unset (infinite).

By default set it to 7 days.

## Alarms and Anomaly Detection

Minimum alarm set per Lambda function or workload:

- Error rate above zero sustained over a few evaluation periods.
- Throttles above a low threshold.
- Duration approaching timeout (e.g. p99 at 80% of the configured timeout).
- DLQ depth above zero.
- Iterator age, for stream-triggered consumers (Kinesis, DynamoDB Streams).

Enable Cost Anomaly Detection with an SNS subscription so unexpected spend triggers an alert rather than surfacing at month-end.
