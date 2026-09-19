# Production Acceptance Checklist

## Product
- [ ] Home page understandable in <10 seconds
- [ ] Business flow works
- [ ] Education flow works
- [ ] Calculator works
- [ ] Partner locator works
- [ ] Help/FAQ works
- [ ] official source links work

## Recommendation integrity
- [ ] deterministic rules
- [ ] source/version returned
- [ ] reason codes returned
- [ ] no guaranteed-approval language
- [ ] boundary tests pass

## Partner integrity
- [ ] only authorized/verified records displayed as authorized
- [ ] UNKNOWN capacity never becomes AVAILABLE
- [ ] freshness shown
- [ ] manual call-first fallback exists

## Accessibility
- [ ] WCAG 2.2 AA audit
- [ ] keyboard
- [ ] screen reader
- [ ] 200% zoom
- [ ] 320px width

## Security
- [ ] admin MFA
- [ ] RBAC
- [ ] rate limits
- [ ] security headers
- [ ] secrets protected
- [ ] dependency scan

## Operations
- [ ] backups
- [ ] monitoring
- [ ] rollback
- [ ] source freshness process
- [ ] change decision process

## Legal/trust
- [ ] independent-project disclaimer
- [ ] official-source attribution
- [ ] privacy notice
- [ ] terms
- [ ] no false government affiliation
