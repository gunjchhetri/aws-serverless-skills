# Messaging Reference

## Decision Guide

- Need replay of past events → EventBridge with archive, or Kinesis Streams.
- Throughput above 10k events/s → Kinesis Data Streams.
- Need ordering + dedupe: under 3k/s → SQS FIFO; higher throughput → Kinesis (per-shard ordering).
- Fan-out to 2+ independent consumers → SNS (with SQS per consumer for reliability); add content-based routing → EventBridge.
- Single target needing filter/enrich/transform → EventBridge Pipes.
- Single async Lambda consumer, no other needs → direct async Lambda invoke.
- Standard work queue, one consumer pool → SQS Standard.
- Streaming delivery to S3/Redshift/OpenSearch → Kinesis Data Firehose.
- Cross-account or SaaS event integration → EventBridge.

## SQS

- Every SQS-triggered compute needs a DLQ with a bounded `maxReceiveCount` and an alarm on DLQ depth.
- Set visibility timeout to at least 6x the consumer's timeout.
- Enable partial batch failure reporting (`reportBatchItemFailures`) so one bad record doesn't force a full-batch retry.
- Set `ReceiveMessageWaitTimeSeconds = 20` (long polling) on every queue. Short polling (0s) issues a new receive call every few seconds per queue — 10+ idle queues exhaust the 1M/month free tier in ~7 days and generate real charges. Lambda SQS triggers work correctly with long polling; it only delays the return of _empty_ responses, not message delivery.
- Use a single SQS queue per logical processing domain rather than one queue per job type. Include a discriminator field (e.g. `type`, `jobType`) in the message body and route it inside the lambda.
  - **Switch/case in a shared Lambda handler** — one function, one ESM, routes internally. Simpler when jobs share infra (same DLQ, visibility timeout, concurrency limits).

## SNS

- Fan out through an SQS queue per subscriber rather than subscribing Lambda directly
- Filter at the SNS subscription (`filterPolicy`), not inside the handler.

## EventBridge

- Route by event content using rule patterns, not Lambda if/else branching.
- Enable archive + replay on buses that may need historical reprocessing.
- Use EventBridge Scheduler instead of cron-based Lambda triggers.

## EventBridge Pipes

- Use Pipes for source → filter → enrich → transform → target instead of a pass-through Lambda.
- Supported sources: SQS, Kinesis, DynamoDB Streams, MSK, MQ. Supported targets: Lambda, Step Functions, EventBridge bus, SQS, SNS, HTTP endpoint, and more.
- A Pipe counts as a single consumer against the source stream/queue while still routing to many targets.
