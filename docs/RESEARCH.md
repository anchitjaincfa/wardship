# Wardship: problem analysis and founder research

## Source analysis

The latest IdeaBrowser email from roughly one month before this build was sent June 30, 2026. Its lead idea was "Lifeguard for AI companions" and named the product Wardship.

The email's thesis is specific: companion-app risk is not ordinary content moderation. A problem can develop across a relationship arc, not only inside a single message. The three failure modes it highlighted are:

1. A vulnerable user receives escalating or dependency-inducing responses.
2. A minor enters age-inappropriate or romantic content.
3. The operator cannot demonstrate what it detected, did, and learned when an incident is reviewed.

That combination points to a control-plane product rather than another general-purpose moderation API. The product must turn conversation evidence into an operational decision, an intervention, and a defensible record.

## What is true, what is a hypothesis

The email is an idea source, not customer validation. These are the critical assumptions to test rather than treat as facts.

| Claim | Current status | Fastest falsification |
| --- | --- | --- |
| Companion teams struggle with cross-turn risk, not just a message classifier. | Plausible hypothesis | Review 20 real, de-identified incidents with a safety lead and ask where their process failed. |
| A safety operator will pay for intervention evidence, not merely a risk score. | Plausible hypothesis | Run a concierge review and ask which fields must exist for an internal incident review. |
| An API gateway is the initial buyer's preferred integration point. | Unknown | Show web, mobile, and platform engineers a one-hour integration sketch. |
| Dependency patterns are as valuable as acute crisis signals. | Unknown | Compare reviewer agreement, false positive cost, and time to action by signal class. |
| A narrow companion vertical can produce a wedge. | Plausible hypothesis | Find 10 design partners with an active companion product and recurring safety-review work. |

## Initial customer and job

The initial customer should be a consumer AI companion company that already has some moderation effort and a named owner for safety, trust, policy, or legal risk. That avoids building an abstract safety product for every chatbot.

The likely buyer, user, and integrator are different:

- Buyer: Head of Safety, Trust and Safety leader, or product executive accountable for platform risk.
- Daily user: Safety analyst or on-call reviewer who needs a fast, evidence-rich decision.
- Integrator: Backend/platform engineer who needs a minimal, reliable gateway contract.
- Stakeholders: Legal, privacy, security, and clinical-advisory counterparts.

The job is not "classify unsafe text." It is: "When a companion exchange becomes concerning, let me decide and document the least-invasive safe next action quickly enough that the product does not continue the harmful turn."

## The YC plan

YC's central loop is launch, talk to users, and iterate. It warns against scaling before the product has a small group of users who love it, and recommends a 90/10 solution. YC also describes a v0 as the least work needed to make the intended value legible.

Applied to Wardship:

1. Pick one wedge: English-language, consumer AI companions with a human safety-review owner.
2. Launch this console as an interview artifact, not an enterprise platform.
3. Invite 10 safety owners to bring a small, de-identified sample of historical cases. Do the analysis manually with them; do not pretend automation exists before it is reliable.
4. Ask which decision changed, which evidence they trusted, and what they needed to open a real case.
5. Build only the repeated workflow. A plausible next feature is a reviewer queue with policy revision and disposition, not billing, analytics, or an expansive agent framework.
6. Track two leading signals: weekly active safety reviewers and the share of flagged cases where the reviewer agrees the evidence made the next action clearer.
7. Do not chase broad growth until several teams use Wardship on their own cases repeatedly.

The v0 can fail usefully. If users want a red-team simulator, incident reporting system, or policy authoring tool instead, that is strong evidence to change the roadmap before a large implementation locks in the wrong assumption.

## Product thesis and wedge

The compelling promise is not "we detect every bad message." That cannot be responsibly promised. The promise is:

    We make a high-stakes companion-safety decision visible, reviewable, and faster to act on.

The defensible asset would be the feedback loop: policy versions, reviewer dispositions, intervention outcomes, and carefully governed evaluation data. The model can be swapped. The operating evidence and workflow become the product.

## MVP success and failure criteria

A pilot should have an explicit pass/fail line.

Pass signals:

- A reviewer can understand a flag and its evidence in under two minutes.
- The team agrees on a response category more often with the console than without it.
- At least one design partner asks to process new, not merely historical, conversations.
- The pilot gives a specific integration request and accepts a narrow data contract.

Failure signals:

- Teams only want a generic moderation score.
- Reviewers do not trust cross-turn evidence or do not find it action-guiding.
- The integration and privacy burden dominates the learning benefit.
- Different pilots want unrelated products, with no common workflow.

## Research sources

- YC Essential Startup Advice: https://www.ycombinator.com/blog/ycs-essential-startup-advice/
- YC The Art of Shipping Early and Often: https://www.ycombinator.com/blog/tips-ship-early-and-often
- Steve Yegge, Six New Tips for Better Coding With Agents: https://steve-yegge.medium.com/six-new-tips-for-better-coding-with-agents-d4e9c86e42a9
