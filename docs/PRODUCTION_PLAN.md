# End-to-end production plan

## Product scope by phase

### Phase 0: concierge validation

Use the current console on a small set of de-identified historical conversations. A founder and qualified safety reviewer inspect every case. The aim is to learn the required evidence, response categories, and false-positive cost.

No live user data, automatic enforcement, or claims of clinical efficacy.

### Phase 1: shadow mode

Integrate one design partner through an API gateway or SDK. Sample or route only consented, minimised conversation windows. Evaluate Wardship alongside the partner's existing process but do not change the live companion response.

Required outputs:

- conversation window identifier and hashed tenant/user references
- policy version and specialist findings
- reviewer disposition and rationale
- latency, disagreement, and error telemetry

### Phase 2: human-in-the-loop interventions

Enable bounded actions such as creating a review case, temporarily pausing a response, or applying a pre-approved safe-response template. Every action needs an owner, a rollback rule, an appeal/review path where relevant, and a policy version.

### Phase 3: production control plane

Only after satisfactory evaluation, introduce a real-time decision service with regional processing, service-level objectives, retention controls, access reviews, incident management, and an audit export.

## Recommended system design

    Companion product
       -> signed event gateway
       -> consent, tenant routing, PII minimisation
       -> encrypted event store and queue
       -> bounded context assembler
       -> parallel specialist services
       -> policy reducer
       -> response adapter and reviewer queue
       -> append-only audit log, evaluation store, metrics

### Data contracts

Use a versioned event schema. Include only what each reviewer needs:

- tenant and policy identifiers
- pseudonymous user/conversation references
- message role, timestamp, and bounded text window
- declared age band where lawful and available
- source/model configuration version
- consent and retention class

Never give every agent unrestricted access to a user's entire history. The context assembler should use a short window plus carefully scoped summaries, with an explicit provenance list for every retrieved item.

### Parallel reviewers

Run independent specialists concurrently, each with:

- a single safety objective
- a bounded input schema
- output JSON constrained by a schema
- minimum evidence snippets and calibrated confidence
- a timeout and safe failure mode
- an evaluation set and owner

Initial specialists:

1. Crisis Sentinel: acute distress and self-harm escalation.
2. Boundary Guardian: age-sensitive and relationship/sexual boundary policy.
3. Attachment Lens: exclusivity, coercion, and dependency dynamics.
4. Policy Recorder: provenance, policy mapping, and event completeness.

The policy reducer is deterministic. It has precedence rules, requires evidence for a high-severity action, and produces the least-invasive approved response. Do not let a general LLM vote directly to take an irreversible action.

### Intervention ladder

| Risk posture | Action | Human responsibility |
| --- | --- | --- |
| Allow | Continue, retain narrow event metadata. | Review sampled quality and policy drift. |
| Watch | Add monitoring or request an asynchronous review. | Safety operator checks pattern. |
| Hold | Pause the next generated response and open a case. | Qualified reviewer releases or changes the response. |
| Block and escalate | Show a pre-approved support flow, suppress risky continuation, open urgent review. | Partner owns local escalation protocol and emergency policy. |

The exact language, localization, and emergency protocol must be designed and approved with qualified safety, legal, clinical, and regional experts. Never claim that a model has determined intent or replaced emergency services.

## Security, privacy, and compliance work

This is a high-sensitivity data product. Before live use, require:

- data processing agreement and clear role allocation
- purpose limitation, consent/notice, retention schedule, and deletion workflow
- encryption in transit and at rest, tenant isolation, least-privilege access, and access logs
- no training on customer content by default; explicit opt-in and de-identification controls for evaluation
- prompt-injection and data-exfiltration testing of every model boundary
- abuse monitoring, rate limits, authentication, request signing, and replay protection
- incident response, audit export, regional data-residency analysis, and vendor risk review
- policy governance with approver, effective date, rollback, and reviewer training records

Legal obligations vary by jurisdiction and product. Treat this as a design checklist, not legal advice.

## Evaluation before automation

Use de-identified, consented, carefully controlled datasets and have qualified annotators define labels, disagreement protocol, and adverse-case taxonomy.

Measure:

- recall for known severe cases, with false-negative investigation
- precision and reviewer agreement by risk type
- calibration, abstention quality, and performance by language/age/context slices
- time to intervention and reviewer time saved
- intervention reversal/appeal rate
- drift after every policy or model change

Run adversarial tests for long-context escalation, manipulation, ambiguity, quoted speech, sarcasm, multilingual content, and attempts to bypass the safety system. A release should be blocked if the evidence chain is missing or a high-risk failure mode regresses.

## Proposed technical stack

- Next.js on Vercel for the operator console and authenticated internal APIs.
- Postgres for tenant, policy, case, and review metadata.
- Object storage only for redacted evidence where necessary, with lifecycle deletion.
- Queue plus idempotent workers for review jobs; use a durable workflow engine for long-running human review.
- OpenTelemetry-compatible traces, structured audit events, and evaluation dashboards.
- Model gateway with provider abstraction, strict JSON schemas, per-policy prompt/version registry, and cost/latency limits.

Vercel is appropriate for the v0 console. The real-time, sensitive-data path should be deployed only after a threat model and data-boundary review; it may need partner-region infrastructure beyond a single frontend deployment.

## First 30 days

Week 1: Run ten problem interviews and three concierge case reviews. Freeze a one-page data contract and an intervention vocabulary.

Week 2: Build the reviewer queue, evidence provenance, policy versioning, and case disposition. Keep all decisions human-in-the-loop.

Week 3: Add shadow-mode gateway ingestion for one partner. Compare every output with their existing review result.

Week 4: Review metrics and incidents with the partner. Either deepen the repeated workflow or change direction based on what they actually used.

## Release gates

1. A safety owner signs off on the policy and intervention text.
2. A privacy/security review signs off on the data flow.
3. Offline evaluation exceeds pre-agreed thresholds for each risk class.
4. Shadow-mode discrepancies are investigated and accepted.
5. The live system has on-call ownership, audit export, rollback, and incident procedures.
6. High-stakes actions remain human-owned unless a separate, evidence-backed approval explicitly allows automation.
