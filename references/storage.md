# Storage (S3) Reference

- Never make S3 buckets public for application data. Block public access at the bucket and account level.
- Serve public/static assets through CloudFront with Origin Access Control (OAC); keep the origin bucket private.
- Use S3 presigned URLs for large uploads/downloads instead of proxying through API Gateway or Lambda.
- Add lifecycle rules to every non-transient bucket: transition or expire objects, and clean up incomplete multipart uploads.
- Choose storage class by access pattern — Standard for active data, Standard-IA for infrequent access, Glacier tiers only for archival data with an acceptable retrieval delay.
- Invalidate the relevant CloudFront paths after deploying new static assets rather than relying on TTL expiry.
- Enable S3 event notifications (to EventBridge, SQS, SNS, or Lambda) instead of polling a bucket for new objects.
