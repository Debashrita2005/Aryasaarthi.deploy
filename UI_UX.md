# UI/UX Specification

## Design direction
Government-service trust + rural simplicity + modern accessibility.

Do not copy the visual design of NSFDC. Use the official site only as a content/source reference.

## Visual hierarchy
1. Large plain-language heading
2. One primary action
3. Short explanation
4. Cards with strong labels
5. Details behind expandable sections
6. Official-source and last-updated information

## Home page
Hero:
"Your Digital Guide To The Right Government Scheme"

Subtext:
"An intelligent AI-driven platform bridging the gap between SC beneficiaries and government support by simplifying scheme discovery, financial guidance, and verified partner access."

Primary CTA: "Find my scheme"
Secondary CTA: "Explore schemes"

Quick actions:
- I want to start a business
- I want to expand my work
- I need an education loan
- Find a nearby partner
- Calculate repayment

Trust strip:
- Official-source information
- No loan approval on this website
- Free to use
- Available in Indian languages

## Recommendation flow
One question per screen on mobile where practical.

Example:
"How much will your project cost?"
₹50,000 / ₹1 lakh / ₹2 lakh / ₹5 lakh / ₹10 lakh / More than ₹10 lakh / I don't know

Use numeric keypad where appropriate.

Never use a long form with 15+ visible fields.

## Result card
Show:
- "Likely match"
- Scheme name
- "Why this appeared"
- project-cost range
- indicative maximum
- interest/repayment information from current configuration
- "What you need to check"
- "Calculate repayment"
- "Find a partner"

Use a reason list:
✓ Purpose matches
✓ Cost is within the configured project range
✓ Income condition appears compatible
⚠ Final eligibility depends on document/agency verification

## Rural UX rules
- minimum 16px body text
- large touch targets
- strong contrast
- avoid icon-only actions
- use familiar Hindi/English wording
- use ₹ and Indian number formatting
- avoid acronyms unless expanded
- support screen readers
- do not require precision typing when a range selector works

## Navigation
Bottom mobile navigation:
Home | Find Scheme | Calculator | Partners | Help

Desktop:
Home | Schemes | Find My Scheme | Calculator | Partners | Help

## Error UX
Never say:
"Invalid request."

Prefer:
"We couldn't calculate this right now. Please check the amount and try again."

## Accessibility
- keyboard navigation
- visible focus
- semantic headings
- labels associated with inputs
- error summaries
- no color-only status
- language attribute changes with language
- reduced-motion support

## Responsive breakpoints
Use CSS/container behavior rather than device-specific hacks.

## Empty state
If partner availability is unavailable:
"Partner locations are available, but live processing capacity is not currently available. Please contact the agency before travelling."

## Content tone
Respectful, non-patronizing, direct, warm and practical.
