# Wardship

Wardship is a v0 safety control plane for AI companion conversations. It demonstrates a focused safety-review workflow: screen a bounded conversation with multiple specialist reviewers running in parallel, combine the results under an explicit policy, recommend a proportionate response, and save the rationale as an audit event.

The prototype is deployed as a browser-ready demo and intentionally uses seeded, deterministic reviewers. It does not send conversation text to a model provider, claim to provide clinical advice, or handle real emergency decisions.

## What is working now

- Three representative companion conversations: acute distress, minor-plus-relationship boundary, and a clear control case.
- A server endpoint that runs deterministic demo keyword reviewers in parallel, then applies a documented policy reducer. It does not call an AI model.
- A documented deterministic demo policy that chooses allow, hold for review, or block and escalate. The scores are scenario fixtures, not confidence or calibration.
- A safety-review console that reveals reviewer findings, confidence, evidence, intervention recommendation, and audit event metadata.
- A GitHub Actions build check and Vercel-ready Next.js app.

## The v0 decision

The June 30, 2026 IdeaBrowser email described Wardship as a safety layer for companion apps, emphasizing that keyword moderation misses the relationship arc, emotional escalation, and age-sensitive boundaries particular to companion products.

The first product is not an SDK, an LLM evaluator, or a global crisis network. It is a sharp proof of value for a safety operator:

    Given a suspicious conversation, can the team see why it is risky, what should happen next, and what evidence supports that decision?

That is the 90/10 product. The real user can test whether the intervention is useful before the company commits to a much larger real-time moderation platform.

## Safety boundaries

This project is a product prototype, not a safety service.

- Demo conversations are fictional and the review logic is intentionally simple keyword matching; it will miss real-world phrasing and context.
- Do not use the displayed score as a diagnosis, a prediction of intent, or the sole basis for enforcement.
- Any production crisis path requires locally appropriate resources, qualified human ownership, legal review, privacy controls, accessibility work, and continuous evaluation.
- High-stakes actions must remain reviewable, reversible where possible, and policy-versioned.
- Demo API inputs are validated and bounded, and the endpoint has a best-effort per-instance rate limit. This is hardening for a public demo, not production-grade abuse protection.
- The displayed audit reference is not persisted. It exists only for the browser session.

## Architecture

    Companion client or API gateway
        -> minimal conversation window
        -> parallel specialist reviewers
        -> policy reducer
        -> intervention and human-review queue
        -> tamper-evident audit event and evaluation telemetry

The code implements the middle section with deterministic keyword functions so the demo stays functional without secrets. The UI deliberately calls out that the result is not an AI detection, calibrated confidence, action, or persistent audit record. See docs/DEMO_POLICY.md for the exact fixture rules and docs/PRODUCTION_PLAN.md for the end-to-end design.

## YC and Steve Yegge operating model

YC guidance favors launching a useful v0, doing manual work to earn direct learning, and repeatedly talking to a small set of users before scaling. The corresponding plan is in docs/RESEARCH.md: recruit a narrow set of companion-app safety teams, run their historical cases through the console with them, and learn which interventions they would actually adopt.

Steve Yegge's agent guidance says parallel work has a difficult merge and review phase, and that code health must be intentionally funded. Wardship therefore treats parallelism as specialized, bounded work with one reducer and one accountable decision. The implementation playbook is in docs/AGENT_PLAYBOOK.md.

Sources:

- YC Essential Startup Advice: https://www.ycombinator.com/blog/ycs-essential-startup-advice/
- YC The Art of Shipping Early and Often: https://www.ycombinator.com/blog/tips-ship-early-and-often
- Steve Yegge, Six New Tips for Better Coding With Agents: https://steve-yegge.medium.com/six-new-tips-for-better-coding-with-agents-d4e9c86e42a9

## Run

    npm install
    npm run dev

For the project roadmap, safety requirements, and validation gates, read docs/PRODUCTION_PLAN.md.
