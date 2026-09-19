# AI Change Decision & Source-Drift Protocol

## Purpose
This file governs how an AI coding agent may use or change NSFDC-related information and production code.

## Source hierarchy
1. Current official NSFDC pages/documents
2. Current Government of India / MoSJE official sources
3. Official channel-partner documentation
4. Project-approved internal configuration
5. Secondary sources only for discovery, never as the sole authority for financial eligibility/rates

## Absolute rule
The AI agent must NOT silently change code because it found a different number online.

## When a source change is detected
The agent must:
1. identify the changed fact,
2. capture old value,
3. capture proposed new value,
4. cite the official source URL,
5. identify effective date,
6. explain impact,
7. identify affected tests/UI/API,
8. create a change decision record,
9. request human approval for high-impact financial/eligibility changes,
10. only then modify production configuration/code.

## High-impact changes requiring explicit approval
- eligibility criteria
- income ceiling
- maximum loan
- interest rate
- tenure
- moratorium
- scheme existence/removal
- partner authorization rules
- routing/capacity logic
- any claim that changes a user's likely eligibility

## Low-impact changes
- typo
- spacing
- non-substantive copy
- layout
- accessibility fixes
- performance improvements that do not alter business logic

Low-impact changes still require tests.

## Change record template
```md
# Change Decision: YYYY-MM-DD — <short title>

## Detected change
Old:
New:

## Official source
URL:
Title:
Checked at:
Effective date:

## Why this matters
<citizen/product impact>

## Proposed implementation
<configuration/code/data change>

## Affected areas
- [ ] recommendation engine
- [ ] calculator
- [ ] UI content
- [ ] API
- [ ] database
- [ ] translations
- [ ] tests
- [ ] documentation

## Risk
LOW / MEDIUM / HIGH

## Approval
Required: YES / NO
Approved by:
Date:

## Verification
- [ ] tests updated
- [ ] source metadata updated
- [ ] UI checked
- [ ] regression tests passed
```

## Important implementation rule
Keep financial rules in data/configuration wherever possible. Do not bury rates and limits across dozens of components.

## Source drift
If official content is unavailable, ambiguous or contradictory:
- do not guess,
- preserve the last verified value,
- mark it as "needs review",
- show an appropriate user-facing uncertainty message,
- create a review task.

## Website relationship
The application may link to the official NSFDC website. It must not impersonate NSFDC or modify NSFDC's website/code. Changes are limited to this independent project.
