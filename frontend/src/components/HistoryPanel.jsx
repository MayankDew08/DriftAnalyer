import StatusBadge from "./StatusBadge";
import CategoryFrequency from "./charts/CategoryFrequency";
import DriftDetectionRate from "./charts/DriftDetectionRate";
import DriftScoreTimeline from "./charts/DriftScoreTimeline";
import SeverityBreakdown from "./charts/SeverityBreakdown";

const CATEGORY_SHORT = {
  "Scope Violation": "Scope",
  "Constraint Violation": "Constraint",
  "Priority Misalignment": "Priority",
  "Intent Drift": "Intent",
  "Internal Inconsistency": "Inconsistency",
};

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

function shortTimestamp(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function scoreColor(score) {
  if (score <= 0.2) return "bg-severity-none";
  if (score <= 0.5) return "bg-severity-medium";
  return "bg-severity-high";
}

function feedbackLabel(feedback) {
  if (!feedback) return { text: "No feedback yet", className: "text-slate-400" };
  if (feedback.human_verdict === "Yes") return { text: "Feedback: Yes ✓", className: "text-severity-none" };
  if (feedback.human_verdict === "No") return { text: "Feedback: No ✗", className: "text-severity-high" };
  return { text: "Feedback: Partially ~", className: "text-severity-medium" };
}

function buildCategoryFrequency(history) {
  const counts = {
    "Scope Violation": 0,
    "Constraint Violation": 0,
    "Priority Misalignment": 0,
    "Intent Drift": 0,
    "Internal Inconsistency": 0,
  };

  history.forEach((entry) => {
    (entry.analysis?.drift_categories || []).forEach((item) => {
      if (item.detected && counts[item.category] !== undefined) {
        counts[item.category] += 1;
      }
    });
  });

  return Object.entries(counts).map(([category, count]) => ({
    category,
    shortLabel: CATEGORY_SHORT[category] || category,
    count,
  }));
}

function buildSeverityBreakdown(history) {
  const counts = {};

  history.forEach((entry) => {
    (entry.analysis?.drift_categories || []).forEach((item) => {
      if (item.detected) {
        const severity = String(item.severity || "Unknown");
        counts[severity] = (counts[severity] || 0) + 1;
      }
    });
  });

  const severityOrder = ["High", "Critical", "Moderate", "Medium", "Low", "None", "Unknown"];
  const severityColor = {
    Critical: "#B91C1C",
    High: "#EF4444",
    Moderate: "#F59E0B",
    Medium: "#F59E0B",
    Low: "#3B82F6",
    None: "#10B981",
    Unknown: "#94A3B8",
  };

  return Object.entries(counts)
    .map(([severity, count]) => ({
      severity,
      count,
      color: severityColor[severity] || "#94A3B8",
    }))
    .sort((a, b) => {
      const aIndex = severityOrder.indexOf(a.severity);
      const bIndex = severityOrder.indexOf(b.severity);
      const aRank = aIndex === -1 ? 999 : aIndex;
      const bRank = bIndex === -1 ? 999 : bIndex;
      return aRank - bRank;
    });
}

export default function HistoryPanel({ isOpen, history, onClose, onSelectEntry }) {
  const sortedHistory = [...history].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const withDriftCount = history.filter((entry) => entry.analysis?.drift_detected).length;
  const withFeedbackCount = history.filter((entry) => entry.feedback !== null).length;

  const timelineData = sortedHistory
    .slice()
    .reverse()
    .map((entry) => ({
      id: entry.id,
      timestamp: shortTimestamp(entry.timestamp),
      score: Number(entry.analysis?.overall_drift_score || 0),
      routing: entry.analysis?.suggested_routing || "-",
    }));

  const categoryData = history.length > 0 ? buildCategoryFrequency(history) : [];
  const severityData = buildSeverityBreakdown(history);
  const driftDetectedCount = history.filter((entry) => entry.analysis?.drift_detected === true).length;
  const noDriftCount = history.length - driftDetectedCount;
  const detectionRateData = [
    { name: "Drift Detected", count: driftDetectedCount, color: "#EF4444" },
    { name: "No Drift (Aligned)", count: noDriftCount, color: "#10B981" },
  ];

  function handleTimelineSelect(id) {
    const entry = history.find((item) => item.id === id);
    if (entry) onSelectEntry(entry);
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-0 z-50 h-full w-full transform border-l border-navy-700 bg-navy-800 p-5 transition-transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="mb-4 flex items-start justify-between gap-3 border-b border-navy-700 pb-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-200">Analysis History</h2>
            <p className="mt-1 text-xs text-slate-400">
              {history.length} analyses • {withDriftCount} with drift • {withFeedbackCount} with feedback
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

        <div className="h-[calc(100%-64px)] space-y-4 overflow-y-auto pb-8">
          <section className="rounded-lg border border-navy-700 bg-navy-900 p-4">
            <DriftScoreTimeline data={timelineData} onSelectEntry={handleTimelineSelect} />
          </section>

          <section className="grid grid-cols-1 gap-4 xl:grid-cols-3 md:grid-cols-2">
            <div className="rounded-lg border border-navy-700 bg-navy-900 p-4">
              <DriftDetectionRate data={detectionRateData} total={history.length} />
            </div>
            <div className="rounded-lg border border-navy-700 bg-navy-900 p-4">
              <CategoryFrequency data={categoryData} />
            </div>
            <div className="rounded-lg border border-navy-700 bg-navy-900 p-4">
              <SeverityBreakdown data={severityData} />
            </div>
          </section>

          <section className="border-t border-navy-700 pt-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
              Records (sorted newest first)
            </h3>
            <div className="space-y-3">
              {sortedHistory.map((entry) => {
                const analysis = entry.analysis || {};
                const score = Number(analysis.overall_drift_score || 0);
                const detected = (analysis.drift_categories || [])
                  .filter((item) => item.detected)
                  .map((item) => CATEGORY_SHORT[item.category] || item.category);
                const feedback = feedbackLabel(entry.feedback);

                return (
                  <article
                    key={entry.id}
                    className="cursor-pointer rounded-lg border border-navy-700 bg-navy-900 p-4 transition hover:bg-slate-800/60"
                    onClick={() => onSelectEntry(entry)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="flex items-center gap-2 text-sm text-slate-100">
                        <span className={`inline-block h-2.5 w-2.5 rounded-full ${scoreColor(score)}`} />
                        {formatTimestamp(entry.timestamp)}
                      </p>
                      <p className="text-sm text-slate-100">Score: {score.toFixed(2)}</p>
                    </div>

                    <div className="mt-2">
                      <StatusBadge routing={analysis.suggested_routing || "-"} />
                    </div>

                    <p className="mt-2 text-sm text-slate-300">
                      {detected.length > 0 ? `Drift in: ${detected.join(", ")}` : "No drift detected"}
                    </p>

                    <div className="mt-2 flex items-center justify-between gap-3">
                      <p className={`text-xs ${feedback.className}`}>{feedback.text}</p>
                      <button
                        type="button"
                        className="text-sm font-medium text-blue-400 hover:text-blue-300"
                        onClick={(event) => {
                          event.stopPropagation();
                          onSelectEntry(entry);
                        }}
                      >
                        View Full Record →
                      </button>
                    </div>
                  </article>
                );
              })}

              {sortedHistory.length === 0 && (
                <p className="rounded-lg border border-navy-700 bg-navy-900 p-4 text-sm text-slate-400">
                  No analyses found yet.
                </p>
              )}
            </div>
          </section>
        </div>
      </aside>
    </>
  );
}
