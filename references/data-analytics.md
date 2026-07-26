# Data & Analytics Best Practices

## Service Selection

- Ad-hoc SQL on S3 → Athena.
- Streaming ingestion to S3 → Kinesis Data Firehose.
- Search + aggregation / log analytics → OpenSearch Service.

## Athena

- Don't use Lambda to scan/filter S3 objects for analytics — it hits a 10GB memory limit and a 15-minute timeout, and has no parallelism. Athena parallelizes across partitions via the Glue Catalog.
- Partition data using Hive-compatible S3 path conventions (`year=/month=/day=`) and always filter queries on partition columns — an unfiltered query triggers a full table scan.
- Convert raw JSON/CSV to Parquet (or ORC) as the first pipeline step. Avoid JSON entirely for analytics.
- Enable Athena query result reuse for repeated queries.

## Glue

- Use Glue instead of Lambda for multi-GB/TB ETL — Lambda's memory and time limits don't scale to that volume.
