# Deployment & Operations

## Environments
- local
- development
- staging
- production

## CI/CD
Pipeline:
1. install
2. lint
3. typecheck
4. unit tests
5. integration tests
6. build
7. security/dependency scan
8. deploy staging
9. smoke test
10. manual production approval

## Database
- migrations versioned
- backups
- point-in-time recovery where supported
- seed data separated from production data

## Monitoring
Monitor:
- uptime
- API latency
- 4xx/5xx
- DB health
- partner data freshness
- scheme-source freshness
- recommendation error rates

## Source freshness
Create alerts when important scheme data passes its configured review interval.

Do not automatically rewrite production rules from scraped web content.

## Rollback
Every scheme-rule deployment must be reversible.
Use versioned records and feature flags.

## Secrets
Never commit API keys.
Use deployment secret manager/environment variables.

## Production launch checklist
- custom domain
- HTTPS
- analytics configured with privacy controls
- error monitoring
- backups
- accessibility audit
- security headers
- source review completed
- disclaimer visible
- admin MFA enabled
