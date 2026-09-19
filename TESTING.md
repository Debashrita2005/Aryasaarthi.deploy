# Testing Strategy

## Unit tests
- every scheme rule
- boundary values
- income ceiling
- project-cost boundaries
- loan maximums
- calculator formula
- moratorium modes
- reason-code generation
- localization formatting

## Boundary examples
Test:
- exactly ₹1.40 lakh
- just below/above ₹1.40 lakh
- exactly ₹5 lakh income
- just above ₹5 lakh
- exact maximum loan
- zero/negative inputs
- missing mandatory fields

Do not hard-code these numbers into tests if the current configuration is expected to change. Seed test configuration explicitly.

## Integration tests
- recommender API
- calculator API
- partner search
- admin publish/rollback
- source metadata

## E2E
1. business user reaches recommendation
2. student reaches ELS path
3. calculator produces estimate
4. partner list works
5. unavailable capacity is not shown as available
6. language switch works
7. mobile layout works
8. offline shell loads

## Accessibility
- axe
- keyboard
- screen reader
- zoom to 200%
- 320px viewport

## Security
- OWASP-oriented tests
- authentication/authorization
- rate limits
- injection
- XSS
- CSRF
- insecure direct object references

## Release gate
No production release if:
- critical security issue exists
- calculator tests fail
- recommendation rules lack source metadata
- stale source data is presented as current
- accessibility blockers exist
