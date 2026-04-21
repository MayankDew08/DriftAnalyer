import { useEffect } from "react";
import DriftCard from "./DriftCard";
import ScoreBar from "./ScoreBar";
import StatusBadge from "./StatusBadge";

function formatTimestamp(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function stripAnalysisId(summary) {
  if (!summary) return "";
  return summary.replace(/^\[Analysis ID: [^\]]+\]\s*/, "");
}

function parseImplementation(raw) {
  if (!raw || typeof raw !== "string") {
    return { parsed: false, raw: "" };
  }

  const contentMatch = raw.match(/Content:\s*([\s\S]*?)(?:\n\s*Explanation:|$)/i);
  const explanationMatch = raw.match(/Explanation:\s*([\s\S]*)$/i);

  if (!contentMatch || !explanationMatch) {
    return { parsed: false, raw };
  }

  return {
    parsed: true,
    content: (contentMatch[1] || "").trim(),
    explanation: (explanationMatch[1] || "").trim(),
  };
}

function verdictClass(verdict) {
  if (verdict === "Yes") return "bg-severity-none text-white";
  if (verdict === "No") return "bg-severity-high text-white";
  return "bg-severity-medium text-white";
}

export default function HistoryDetailModal({ entry, onClose }) {
  useEffect(() => {
    if (!entry) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [entry, onClose]);

  if (!entry) return null;

  const analysis = entry.analysis || {};
  const parsedStrategy = entry.parsed_strategy || {};
  const implementation = parseImplementation(entry.implementation_raw);
  const categories = [...(analysis.drift_categories || [])].sort(
    (a, b) => Number(b.detected) - Number(a.detected)
  );
  const summary = stripAnalysisId(analysis.human_readable_summary);
  const feedback = entry.feedback;

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 p-4" onClick={onClose}>
      <div
        className="mx-auto flex h-full w-full max-w-[900px] flex-col overflow-hidden rounded-xl border border-navy-700 bg-navy-800"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="border-b border-navy-700 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-100">Analysis Record</h2>
              <p className="mt-1 text-xs text-slate-400">
                {formatTimestamp(entry.timestamp)} • ID: {entry.id}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-navy-700 px-2 py-1 text-sm text-slate-300 hover:border-slate-500"
            >
              ✕ Close
            </button>
          </div>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          <section>
            <h3 className="mb-2 text-xs uppercase tracking-widest text-slate-400">Strategy Input</h3>
            <div className="rounded-lg border border-navy-700 bg-navy-900 p-4 text-sm text-slate-200">
              <p className="font-semibold text-slate-100">Intent:</p>
              <p className="mb-3 mt-1">{parsedStrategy.intent || "-"}</p>
              <p className="font-semibold text-slate-100">Scope:</p>
              <p className="mb-3 mt-1">{parsedStrategy.scope || "-"}</p>
              <p className="font-semibold text-slate-100">Priorities:</p>
              <ol className="mb-3 mt-1 list-decimal pl-5">
                {(parsedStrategy.priorities || []).map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ol>
              <p className="font-semibold text-slate-100">Constraints:</p>
              <ul className="mt-1 list-disc pl-5">
                {(parsedStrategy.constraints || []).map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-xs uppercase tracking-widest text-slate-400">Implementation Input</h3>
            <div className="rounded-lg border border-navy-700 bg-navy-900 p-4 text-sm text-slate-200">
              {implementation.parsed ? (
                <>
                  <p className="font-semibold text-slate-100">Content:</p>
                  <p className="mb-3 mt-1 whitespace-pre-wrap">{implementation.content || "-"}</p>
                  <p className="font-semibold text-slate-100">Explanation:</p>
                  <p className="mt-1 whitespace-pre-wrap">{implementation.explanation || "-"}</p>
                </>
              ) : (
                <pre className="overflow-x-auto whitespace-pre-wrap rounded-md border border-navy-700 bg-slate-950/70 p-3 font-mono text-xs text-slate-300">
                  {implementation.raw}
                </pre>
              )}
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-xs uppercase tracking-widest text-slate-400">Drift Analysis</h3>
            <div className="rounded-lg border border-navy-700 bg-navy-900 p-4">
              <p className="mb-2 text-sm text-slate-200">Overall Score: {Number(analysis.overall_drift_score || 0).toFixed(2)}</p>
              <ScoreBar score={analysis.overall_drift_score || 0} />
              <div className="mt-4">
                <StatusBadge routing={analysis.suggested_routing || "-"} />
              </div>
            </div>
            <div className="mt-3 space-y-3">
              {categories.map((category) => (
                <DriftCard key={category.category} category={category} />
              ))}
            </div>
            <div className="mt-3 rounded-lg border border-navy-700 bg-navy-900 p-4 text-sm text-slate-200">
              <p className="mb-2 text-xs uppercase tracking-widest text-slate-400">Summary</p>
              {summary || "-"}
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-xs uppercase tracking-widest text-slate-400">Human Feedback</h3>
            <div className="rounded-lg border border-navy-700 bg-navy-900 p-4 text-sm text-slate-200">
              {!feedback ? (
                <p className="text-slate-400">No feedback submitted for this analysis.</p>
              ) : (
                <div className="space-y-2">
                  <p>
                    Verdict:{" "}
                    <span className={`rounded px-2 py-1 text-xs font-semibold ${verdictClass(feedback.human_verdict)}`}>
                      {feedback.human_verdict}
                    </span>
                  </p>
                  {feedback.disagreement_type && <p>Disagreement Type: {feedback.disagreement_type}</p>}
                  {feedback.human_notes ? (
                    <blockquote className="rounded-md border border-navy-700 bg-slate-950/70 px-3 py-2 text-slate-300">
                      {feedback.human_notes}
                    </blockquote>
                  ) : null}
                  <p className="text-xs text-slate-400">Submitted at: {formatTimestamp(feedback.submitted_at)}</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
