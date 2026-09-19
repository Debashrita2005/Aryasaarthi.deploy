# AI / Scheme Recommendation Engine

## Principle
Use a deterministic eligibility/ranking engine as the authority. AI is an assistant around the rules, not the authority.

## Decision pipeline
1. Validate inputs.
2. Normalize currency and location.
3. Check mandatory eligibility conditions.
4. Filter impossible schemes.
5. Score/rank remaining schemes.
6. Generate reason codes.
7. Return source/version metadata.
8. Optionally use an LLM to turn reason codes into plain-language explanation.

## Example deterministic rules
```text
IF purpose = BUSINESS
AND scCertificate = YES
AND annualFamilyIncome <= configuredIncomeCeiling
THEN evaluate business schemes

IF projectCost <= 140000
THEN evaluate MFS/AMY rules

IF projectCost > 140000 AND projectCost <= 5000000
THEN evaluate Term Loan rules

IF purpose = EDUCATION
AND fullTimeProfessionalOrTechnicalCourse = YES
THEN evaluate ELS rules
```

These are examples of engine structure. Do not hard-code figures from this document when a newer official source has changed them.

## Reason codes
- PURPOSE_BUSINESS
- PURPOSE_EDUCATION
- SC_REQUIREMENT_MET
- INCOME_WITHIN_LIMIT
- PROJECT_COST_IN_RANGE
- COURSE_TYPE_MATCH
- MISSING_SC_CERTIFICATE
- INCOME_ABOVE_LIMIT
- PROJECT_COST_OUTSIDE_RANGE
- FINAL_VERIFICATION_REQUIRED

## Ranking
Prefer:
1. exact purpose match
2. project-cost fit
3. course/activity fit
4. lower unexplained assumptions
5. current verified scheme configuration

Do not rank based on protected characteristics.

## Explanation contract
Every recommendation must answer:
"Why am I seeing this?"

Example:
"Your stated project cost is within the configured range for this scheme, and your stated income appears to meet the current income condition. Final eligibility will be checked by the authorized channel partner."

## LLM guardrails
System prompt must instruct:
- only use structured rule result
- never add unsupported financial figures
- never create a scheme
- never claim approval
- never say "you are guaranteed"
- preserve uncertainty
- cite source metadata supplied by backend
