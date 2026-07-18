export type ConversationMessage = {
  role: string;
  content: string;
  time?: string;
};

export type ScreeningInput = {
  conversationId?: string;
  ageBand: "16-17" | "18+" | "unknown";
  messages: ConversationMessage[];
};

export type ScreeningFinding = {
  name: string;
  lens: string;
  status: "clear" | "watch" | "alert";
  method: string;
  finding: string;
  evidence: string[];
  score: number;
};

export type ScreeningRun = {
  runId: string;
  generatedAt: string;
  riskScore: number;
  posture: "allow" | "hold_for_review" | "block_and_escalate";
  intervention: {
    title: string;
    summary: string;
    action: string;
  };
  agents: Array<Omit<ScreeningFinding, "score">>;
  audit: {
    eventId: string;
    policyVersion: string;
    retention: string;
  };
};

export class ScreeningInputError extends Error {}

export const DEMO_POLICY = {
  version: "companion-safety-v0.2",
  description: "Illustrative deterministic keyword rules for fictional demo conversations. Not a classifier, calibrated confidence score, clinical assessment, or production safety policy.",
  weights: {
    crisisKeyword: 82,
    minorRelationshipKeyword: 72,
    isolationKeyword: 28
  },
  thresholds: {
    blockAndEscalate: 80,
    holdForReview: 40
  },
  rationale: "A crisis keyword alone reaches the demo's strongest posture. A minor-plus-relationship match is held for review. Isolation language contributes only when combined with another relevant signal."
} as const;

const MAX_MESSAGES = 30;
const MAX_MESSAGE_CHARACTERS = 2_000;

const lower = (value: string) => value.toLowerCase();
const includesAny = (value: string, terms: readonly string[]) => terms.some((term) => value.includes(term));
const matchingEvidence = (messages: ConversationMessage[], terms: readonly string[]) =>
  messages
    .filter((message) => includesAny(lower(message.content), terms))
    .map((message) => message.content)
    .slice(0, 2);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateScreeningInput(value: unknown): ScreeningInput {
  if (!isRecord(value)) throw new ScreeningInputError("Request body must be a JSON object.");

  const candidateMessages = value.messages;
  if (!Array.isArray(candidateMessages) || candidateMessages.length === 0) {
    throw new ScreeningInputError("messages must be a non-empty array.");
  }
  if (candidateMessages.length > MAX_MESSAGES) {
    throw new ScreeningInputError("messages exceeds the demo limit of " + MAX_MESSAGES + ".");
  }

  const messages = candidateMessages.map((candidate, index) => {
    if (!isRecord(candidate) || typeof candidate.role !== "string" || typeof candidate.content !== "string") {
      throw new ScreeningInputError("messages[" + index + "] must include string role and content fields.");
    }

    const content = candidate.content.trim();
    if (!content) throw new ScreeningInputError("messages[" + index + "] cannot be blank.");
    if (content.length > MAX_MESSAGE_CHARACTERS) {
      throw new ScreeningInputError("messages[" + index + "] exceeds the demo limit of " + MAX_MESSAGE_CHARACTERS + " characters.");
    }

    return {
      role: candidate.role.slice(0, 80),
      content,
      ...(typeof candidate.time === "string" ? { time: candidate.time.slice(0, 80) } : {})
    };
  });

  const ageBand = value.ageBand === undefined ? "unknown" : value.ageBand;
  if (ageBand !== "16-17" && ageBand !== "18+" && ageBand !== "unknown") {
    throw new ScreeningInputError("ageBand must be 16-17, 18+, or unknown.");
  }

  return {
    ...(typeof value.conversationId === "string" ? { conversationId: value.conversationId.slice(0, 120) } : {}),
    ageBand,
    messages
  };
}

async function crisisSentinel(messages: ConversationMessage[]): Promise<ScreeningFinding> {
  const terms = ["disappear", "end it", "hurt myself", "kill myself", "not be here"];
  const evidence = matchingEvidence(messages, terms);
  const matched = evidence.length > 0;

  return {
    name: "Crisis Sentinel",
    lens: "Self-harm and acute distress",
    status: matched ? "alert" : "clear",
    method: "Demo keyword phrase match",
    score: matched ? DEMO_POLICY.weights.crisisKeyword : 0,
    finding: matched
      ? "Illustrative crisis keywords matched. A real system would require a qualified, context-aware safety path."
      : "No configured demo crisis keyword matched this excerpt.",
    evidence
  };
}

async function boundaryGuardian(messages: ConversationMessage[], ageBand: ScreeningInput["ageBand"]): Promise<ScreeningFinding> {
  const terms = ["dating", "crush", "kiss", "romantic", "our secret"];
  // Demo fixture only. A production age band must come from an authenticated identity source, never untrusted message text.
  const evidence = ageBand === "16-17" ? matchingEvidence(messages, terms) : [];
  const matched = evidence.length > 0;

  return {
    name: "Boundary Guardian",
    lens: "Age and relationship boundaries",
    status: matched ? "alert" : "clear",
    method: "Demo keyword phrase match",
    score: matched ? DEMO_POLICY.weights.minorRelationshipKeyword : 0,
    finding: matched
      ? "A demo minor-plus-relationship keyword rule matched. A qualified reviewer must own any real decision."
      : "No configured demo age-plus-relationship keyword matched.",
    evidence
  };
}

async function attachmentLens(messages: ConversationMessage[]): Promise<ScreeningFinding> {
  const terms = ["only one who understands", "do not need anyone else", "stay here with me", "keep this our secret"];
  const evidence = matchingEvidence(messages, terms);
  const matched = evidence.length > 0;

  return {
    name: "Attachment Lens",
    lens: "Dependency and isolation",
    status: matched ? "alert" : "clear",
    method: "Demo keyword phrase match",
    score: matched ? DEMO_POLICY.weights.isolationKeyword : 0,
    finding: matched
      ? "Illustrative exclusivity keywords matched. This is not a determination of dependency or coercion."
      : "No configured demo isolation keyword matched.",
    evidence
  };
}

async function policyRecorder(findings: ScreeningFinding[]): Promise<ScreeningFinding> {
  const count = findings.filter((finding) => finding.status === "alert").length;

  return {
    name: "Policy Recorder",
    lens: "Decision evidence",
    status: count > 0 ? "watch" : "clear",
    method: "Deterministic policy reducer",
    score: 0,
    finding: count > 0
      ? "This demo would show the configured rule matches and policy version. No record is persisted."
      : "This demo would show an allow result and policy version. No record is persisted.",
    evidence: count > 0 ? [String(count) + " configured rule match(es)"] : []
  };
}

export async function screenConversation(input: ScreeningInput): Promise<ScreeningRun> {
  const firstPass = await Promise.all([
    crisisSentinel(input.messages),
    boundaryGuardian(input.messages, input.ageBand),
    attachmentLens(input.messages)
  ]);
  const findings = [...firstPass, await policyRecorder(firstPass)];
  const riskScore = Math.min(100, firstPass.reduce((total, finding) => total + finding.score, 0));
  const posture = riskScore >= DEMO_POLICY.thresholds.blockAndEscalate
    ? "block_and_escalate"
    : riskScore >= DEMO_POLICY.thresholds.holdForReview
      ? "hold_for_review"
      : "allow";

  const intervention = posture === "block_and_escalate"
    ? {
        title: "Preview: pause and route to a safety flow",
        summary: "The demo would recommend a pre-approved, human-owned safety path. It takes no action and stores no case.",
        action: "Preview safety flow"
      }
    : posture === "hold_for_review"
      ? {
          title: "Preview: hold for human review",
          summary: "The demo would recommend review before a companion continues. It creates no case and takes no action.",
          action: "Preview review path"
        }
      : {
          title: "Preview: allow with visible rule result",
          summary: "No configured demo keyword matched. A real system would need context-aware monitoring and review.",
          action: "View demo result"
        };

  return {
    runId: "WRD-" + Date.now().toString(36).toUpperCase(),
    generatedAt: new Date().toISOString(),
    riskScore,
    posture,
    intervention,
    agents: findings.map(({ score, ...finding }) => finding),
    audit: {
      eventId: "demo_" + crypto.randomUUID(),
      policyVersion: DEMO_POLICY.version,
      retention: "Not persisted - demo session only"
    }
  };
}
