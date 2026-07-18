# Wardship v0.2 demo policy

This document describes the deterministic rules used by the public Wardship demo. It is not a clinical protocol, a calibrated model, or a production safety policy.

## Method

Each fictional conversation is checked by three independent keyword-based reviewers in parallel:

- Crisis Sentinel searches for a small set of illustrative acute-distress phrases.
- Boundary Guardian searches for relationship phrases only when the supplied demo age band is `16-17`.
- Attachment Lens searches for a small set of exclusivity phrases.

These rules are deliberately narrow. They will miss paraphrases, context, multilingual content, and non-keyword risk. The UI must call them demo keyword matches, never AI detection or confidence.

## Weights and postures

| Rule | Weight | Reason for the demo |
| --- | ---: | --- |
| Crisis keyword match | 82 | Demonstrates the strongest preview posture by itself. |
| Minor plus relationship keyword match | 72 | Demonstrates an intermediate human-review preview. |
| Isolation keyword match | 28 | Demonstrates contributing evidence without independently escalating. |

The reducer previews:

- `block_and_escalate` at 80 or more
- `hold_for_review` at 40 or more
- `allow` below 40

These numbers make the three public sample scenarios deterministic; they have no empirical calibration.

## Data and action limits

- The API accepts at most 30 messages and 2,000 characters per message, with a 64 KB request cap and a best-effort per-instance demo rate limit.
- The demo does not persist content, decisions, or audit records.
- The age band is a fictional fixture. A production system must source age data from an authenticated identity/consent system, never client text or an untrusted browser payload.
- The demo takes no action. Every button only previews what a production workflow might do.

A production policy must be approved, evaluated, versioned, monitored, and owned by qualified safety, legal, privacy, security, and regional experts.
