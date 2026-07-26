# DynamoDB Best Practices

## Single-Table Design

- Default to single-table design;
- Reach for multiple tables only when justified by team ownership boundaries, per-entity capacity control, or compliance-driven data isolation.
- Build a complete access-pattern inventory (every "get X by Y" the application needs) before designing any key schema.
- Design partition/sort keys around confirmed access patterns, using consistent prefix conventions (entity type + id) so related items can be queried together.

## GSIs (Global Secondary Indexes)

- Create GSIs only for confirmed access patterns, never speculatively.
- Every GSI adds a write cost equal to a base table write. Stay well under the hard limit of 20; in practice, 5–7 is where write costs start to hurt.
- Project only the attributes each GSI's access pattern needs.

## DynamoDB Streams

- Keep direct stream consumers to 2 or fewer — a 3rd concurrent reader causes throttling and lag.
- For more than 2 consumers, fan out via SNS/EventBridge behind a single stream reader, or export the stream to Kinesis Data Streams.
- Consider EventBridge Pipes for stream processing — it counts as a single consumer against the stream while routing to many downstream targets, and can filter events before they reach a target.

## Scan vs Query

- Never `Scan` in production without explicit justification.
- Prefer, in order: query by PK/SK → query a GSI → add a new sparse GSI → `Scan` only for low-cardinality filters on genuinely small tables, flagged clearly when used.
- If none of the above fit, revisit the access pattern itself rather than defaulting to `Scan`.
- When querying/scanning a large result set, always paginate using `LastEvaluatedKey` — if the response includes one, more results remain; pass it back as `ExclusiveStartKey` on the next request to continue from where you left off.

## TTL

- Use TTL for inherently ephemeral data: sessions, OTP codes, rate-limit counters, idempotency keys, cache entries, temporary presigned-URL records, webhook delivery receipts.
- Don't rely on TTL for hard expiry guarantees , deletions are eventually consistent and items can remain readable up to 48 hours past expiry. Filter on the expiry attribute in application logic when exact timing matters.

## Capacity Mode

- Default to on-demand for new tables with unknown traffic patterns. 

## DAX (Caching Layer)

- Avoid DAX unless user specifically asks
- Add DAX when reads heavily outweigh writes (roughly 10:1 or higher), sub-millisecond read latency matters, and eventual consistency from write-through caching is acceptable.
- Avoid DAX when the application needs strongly consistent reads, when writes are the bottleneck, or when the table has high write churn.
