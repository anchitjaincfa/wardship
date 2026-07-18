# Multi-agent build and operations playbook

## Why this is not an agent free-for-all

Steve Yegge's guidance distinguishes work that can be parallelized from work that must be serialized. In particular, a swarm creates a hard merge/reduce problem, and agent-built systems need deliberate code-health investment.

Wardship applies that principle twice:

1. Product operation: independent safety specialists can screen the same bounded context in parallel, but one deterministic policy reducer makes the decision.
2. Product development: agents work on isolated, well-specified tasks and a human-controlled merge queue verifies every integration.

The goal is many focused workers, not many unbounded agents talking to one another.

## Production agent topology

    Dispatcher
       |-- Crisis Sentinel
       |-- Boundary Guardian
       |-- Attachment Lens
       |-- Context/Provenance Verifier
       -> Policy Reducer
       -> Human Review or Intervention Adapter
       -> Audit Writer

Rules:

- The dispatcher attaches a trace ID, tenant ID, policy version, context budget, deadline, and idempotency key.
- Specialists cannot call an intervention tool. They return structured findings only.
- The reducer is deterministic and rejects outputs without evidence or a known policy mapping.
- The audit writer records input hashes, versions, output, latency, and disposition without indiscriminately retaining raw text.
- A timeout, malformed output, or provider failure defaults to safe abstention and an operational alert, not a silent allow.

## Implementation swarm

Keep no more than 5-10 active work items with non-overlapping ownership. Each item must state:

- intended user outcome and acceptance test
- affected files and interfaces
- policy/data implications
- independent validation command
- rollback or feature-flag plan

Suggested roles:

| Role | Bounded deliverable | Must not own |
| --- | --- | --- |
| Product agent | interview synthesis and exact testable user story | implementation decisions |
| Policy agent | policy schema, taxonomy, intervention matrix | runtime enforcement |
| Runtime agent | event contract, queue, reducer interface | policy text |
| UI agent | reviewer case flow and evidence display | backend data model |
| Evaluation agent | benchmark fixture and regression checks | production configuration |
| Security agent | threat model and boundary tests | feature priority |
| Integrator | serial rebase, build, review, deploy | broad new features |

## Merge queue

Every agent starts from a named baseline. Workers do not edit shared files opportunistically. The integrator merges in dependency order:

1. shared contracts and policy schema
2. backend/reducer implementation
3. user interface and fixtures
4. tests, documentation, and security checks
5. deployment

When a shared contract changes, stop and rebase downstream work before accepting it. Do not try to resolve a large conflict by mechanically combining both agent outputs; revisit the current user outcome and redesign the affected work item.

## Code-health allocation

Reserve at least 30-40% of agent budget for verification and maintenance, mirroring Yegge's recommendation for agent-written systems.

That work includes:

- schema validation and contract tests
- adversarial fixtures and red-team regression tests
- dependency and secret scanning
- dead-code and duplicate-path review
- observability checks
- documentation refresh
- policy/version drift review

A build that passes is not a safety validation. The final human review checks behavior against the policy, then runs scenario-level tests.

## Daily operating rhythm

1. Review failures, reviewer disagreements, and any intervention reversals.
2. Turn each concrete problem into a small, owned work item with evidence.
3. Parallelize only independent work.
4. Serialize contract changes and release decisions.
5. Run build, tests, evaluation, and a code-health pass.
6. Demo the working change to a safety operator before adding adjacent features.

## Sources

- Steve Yegge, Six New Tips for Better Coding With Agents: https://steve-yegge.medium.com/six-new-tips-for-better-coding-with-agents-d4e9c86e42a9
- YC Essential Startup Advice: https://www.ycombinator.com/blog/ycs-essential-startup-advice/
- YC The Art of Shipping Early and Often: https://www.ycombinator.com/blog/tips-ship-early-and-often
