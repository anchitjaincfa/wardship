# Wardship

Wardship is a v0 safety control plane for AI companion conversations. It demonstrates a focused safety-review workflow: screen a bounded conversation with multiple specialist reviewers running in parallel, combine the results under an explicit policy, recommend a proportionate response, and save the rationale as an audit event.

The prototype is deployed as a browser-ready demo and intentionally uses seeded, deterministic reviewers. It does not send conversation text to a model provider, claim to provide clinical advice, or handle real emergency decisions.

## What is working now

- Three representative companion conversations: acute distress, minor-plus-relationship boundary, and a clear control case.
- A server endpoint that runs Crisis Sentinel, Boundary Guardian, and Attachment Lens in parallel, then asks Policy Recorder to produce the audit recommendation.
- A deterministic risk reducer that chooses allow, hold for review, or block and escalate.
- A safety-review console that reveals reviewer findings, confidence, evidence, intervention recommendation, and audit event metadata.
- A GitHub Actions build check and Vercel-ready Next.js app.

## The v0 decision

The June 30, 2026 IdeaBrowser email described Wardship as a safety layer for companion apps, emphasizing that keyword moderation misses the relationship arc, emotional escalation, and age-sensitive boundaries particular to companion products.

The first product is not an SDK, an LLM evaluator, or a global crisis network. It is a sharp proof of value for a safety operator:

    Given a suspicious conversation, can the team see why it is risky, what should happen next, and what evidence supports that decision?

That is the 90/10 product. The real user can test whether the intervention is useful before the company commits to a much larger real-time moderation platform.

## Safety boundaries

This project is a product prototype, not a safety service.

- Demo conversations are fictional and the review logic is intentionally simple.
- Do not use the displayed score as a diagnosis, a prediction of intent, or the sole basis for enforcement.
- Any production crisis path requires locally appropriate resources, qualified human ownership, legal review, privacy controls, accessibility work, and continuous evaluation.
- High-stakes actions must remain reviewable, reversible where possible, and policy-versioned.

## Architecture

    Companion client or API gateway
        -> minimal conversation window
        -> parallel specialist reviewers
        -> policy reducer
        -> intervention and human-review queue
        -> tamper-evident audit event and evaluation telemetry

The code implements the middle section with deterministic functions so the demo stays functional without secrets. The production replacement for a reviewer is a bounded service contract, not an unconstrained chat agent. See docs/PRODUCTION_PLAN.md for the end-to-end design.

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
