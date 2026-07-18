import { NextRequest, NextResponse } from "next/server";

type Message = { role: string; content: string; time?: string };
type Finding = {
  name: string; lens: string; status: "clear" | "watch" | "alert";
  confidence: number; finding: string; evidence: string[]; score: number;
};

const lower = (value: string) => value.toLowerCase();
const includesAny = (value: string, terms: string[]) => terms.some((term) => value.includes(term));
const evidence = (messages: Message[], terms: string[]) =>
  messages.filter((message) => includesAny(lower(message.content), terms)).map((message) => message.content).slice(0, 2);

async function crisis(messages: Message[]): Promise<Finding> {
  const terms = ["disappear", "end it", "hurt myself", "kill myself", "not be here"];
  const hits = evidence(messages, terms);
  return hits.length ? {
    name: "Crisis Sentinel", lens: "Self-harm and acute distress", status: "alert", confidence: 0.96, score: 82,
    finding: "A high-severity distress signal needs an immediate, supportive safety path.", evidence: hits
  } : {
    name: "Crisis Sentinel", lens: "Self-harm and acute distress", status: "clear", confidence: 0.97, score: 0,
    finding: "No direct acute-distress language was detected in this excerpt.", evidence: []
  };
}

async function boundary(messages: Message[], ageBand: string): Promise<Finding> {
  const text = lower(messages.map((message) => message.content).join(" "));
  const minor = ageBand.includes("16") || ageBand.includes("17") || includesAny(text, ["i am 16", "i'm 16", "i am 17", "i'm 17"]);
  const terms = ["dating", "crush", "kiss", "romantic", "our secret"];
  const hits = minor ? evidence(messages, terms) : [];
  return hits.length ? {
    name: "Boundary Guardian", lens: "Age and relationship boundaries", status: "alert", confidence: 0.94, score: 72,
    finding: "A minor and relationship-coded content appear together. Hold the response.", evidence: hits
  } : {
    name: "Boundary Guardian", lens: "Age and relationship boundaries", status: "clear", confidence: 0.98, score: 0,
    finding: "No age-plus-romance boundary signal was detected.", evidence: []
  };
}

async function attachment(messages: Message[]): Promise<Finding> {
  const terms = ["only one who understands", "do not need anyone else", "stay here with me", "keep this our secret"];
  const hits = evidence(messages, terms);
  return hits.length ? {
    name: "Attachment Lens", lens: "Dependency and isolation", status: "alert", confidence: 0.89, score: 28,
    finding: "The exchange includes language that can deepen exclusivity or isolation.", evidence: hits
  } : {
    name: "Attachment Lens", lens: "Dependency and isolation", status: "clear", confidence: 0.95, score: 0,
    finding: "No exclusivity or dependency pattern was detected.", evidence: []
  };
}

async function recorder(findings: Finding[]): Promise<Finding> {
  const count = findings.filter((finding) => finding.status === "alert").length;
  return {
    name: "Policy Recorder", lens: "Decision evidence", status: count ? "watch" : "clear",
    confidence: count ? 0.92 : 0.99, score: 0,
    finding: count ? "Record the intervention, policy version, and reviewer disposition for later audit." : "Record the allow decision with screening metadata.",
    evidence: count ? [String(count) + " policy signal(s) in one conversation"] : []
  };
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const messages: Message[] = Array.isArray(body.messages) ? body.messages : [];
  const ageBand = typeof body.ageBand === "string" ? body.ageBand : "unknown";
  if (!messages.length) return NextResponse.json({ error: "messages must be a non-empty array" }, { status: 400 });

  const firstPass = await Promise.all([crisis(messages), boundary(messages, ageBand), attachment(messages)]);
  const findings = [...firstPass, await recorder(firstPass)];
  const riskScore = Math.min(100, firstPass.reduce((total, finding) => total + finding.score, 0));
  const posture = riskScore >= 80 ? "block_and_escalate" : riskScore >= 40 ? "hold_for_review" : "allow";
  const intervention = posture === "block_and_escalate"
    ? { title: "Pause the companion response and route to crisis support", summary: "Do not continue unreviewed. Show a supportive, localizable safety flow and create a human-review case.", action: "Open a human-reviewed safety flow" }
    : posture === "hold_for_review"
      ? { title: "Hold the next response for a safety reviewer", summary: "A policy boundary needs review before the companion continues.", action: "Create a reviewer case" }
      : { title: "Allow the response and retain screening evidence", summary: "No high-risk pattern was detected. Continue monitoring for context changes.", action: "Record allow decision" };

  return NextResponse.json({
    runId: "WRD-" + Date.now().toString(36).toUpperCase(), generatedAt: new Date().toISOString(),
    riskScore, posture, intervention,
    agents: findings.map(({ score, ...finding }) => finding),
    audit: { eventId: "evt_" + crypto.randomUUID(), policyVersion: "companion-safety-v0.1", retention: "Demo data only" }
  });
}
