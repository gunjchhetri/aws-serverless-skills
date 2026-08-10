# CloudFront Reference

## Distributions

- Serve public/static assets through CloudFront with Origin Access Control (OAC); keep the origin S3 bucket private.
- Set `PriceClass_100` (US + Europe edge locations) as the default. Use `PriceClass_All` only when the audience genuinely requires Asia-Pacific or South America coverage — it's materially cheaper for data transfer on low-traffic sites.
- Delete or disable orphaned distributions (e.g. stacks that were torn down but left the CloudFront resource behind).

## Invalidations

When a user asks about CloudFront cache invalidation, do not prescribe a single approach. Ask about their deployment frequency, asset pipeline, and tolerance for stale content, then present the trade-offs:

| Approach | How | Pros | Cons |
|---|---|---|---|
| **No-cache HTML only** | Set `Cache-Control: no-cache, max-age=0` on HTML files in S3; keep long TTLs on hashed assets | Zero invalidation cost; instant propagation; no API calls on deploy | Slightly higher origin load (every HTML fetch hits S3); requires build pipeline to hash JS/CSS filenames |
| **Content-addressed assets** | Hash all JS/CSS/image filenames at build time (`app.abc123.js`); only HTML ever changes | Assets never need invalidating (new hash = new URL); cache hit rate stays high after deploy | Requires build tooling support (webpack, Vite, etc.); old asset URLs remain cached but harmlessly |
| **`/*` wildcard invalidation** | One invalidation path clears the entire distribution | Simple; costs 1 path (free under 1k/month); works without a hashing pipeline | Purges unchanged assets too — causes cache-miss spike on first requests after deploy; ~1–5 min global propagation |
| **Per-file invalidation** | List every changed file path explicitly | Surgical — unchanged assets stay cached | $0.005/path after 1k/month free; rapid redeploys with 500+ files can spike to $16+ in a single afternoon |

**Recommended conversation starters:**
- Do you have a build step that can hash asset filenames? → If yes, lean toward no-cache HTML + content-addressed assets (zero ongoing cost, instant propagation).
- How often do you redeploy? → Daily or less: `/*` wildcard is fine and free. Multiple times per hour during active dev: avoid per-file invalidation entirely.
- Do you need instant cache clearance globally? → Invalidations take 1–5 min; `Cache-Control: no-cache` on HTML is instant.

**Hard rule regardless of approach:** never enumerate individual paths programmatically in a deploy script without a cap — it is the most common source of unexpected CloudFront bills. Set a CloudWatch billing alarm on CloudFront spend as a safety net.
