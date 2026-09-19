# Financial Calculator

## Goal
Give citizens a simple estimate, not a loan offer.

## Reducing-balance EMI
For monthly payment:

`EMI = P × r × (1+r)^n / ((1+r)^n - 1)`

Where:
- P = principal
- r = monthly interest rate
- n = number of repayment months

If rate is zero:
`EMI = P / n`

## Moratorium
The calculator must not silently assume how interest is treated during moratorium.

Support explicit modes:
- NO_INTEREST_DURING_MORATORIUM
- INTEREST_ACCRUES
- DEFERRED_PAYMENT
- CUSTOM_SCHEDULE

If the official scheme/channel-partner rule is not known, use an "indicative estimate" and state the assumption.

## Output
Show:
- estimated installment
- total principal
- estimated interest
- total estimated repayment
- own contribution
- loan-to-project percentage

## Guardrails
- amount > 0
- rate >= 0
- tenure > 0
- max values configured server-side
- Indian rupee formatting
- avoid false precision; display rounded amounts
- include disclaimer

## Example
Project cost: ₹2,50,000
Indicative loan: ₹2,25,000
Own contribution: ₹25,000

The displayed result must make clear that financing percentage and final sanctioned amount depend on the applicable scheme and channel partner.
