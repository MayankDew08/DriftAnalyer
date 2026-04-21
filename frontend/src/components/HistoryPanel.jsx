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

function scoreColor(score) {
  if (score <= 0.2) return "bg-severity-none";
  if (score <= 0.5) return "bg-severity-medium";
  return "bg-severity-high";
}

export default function HistoryPanel({ isOpen, history, onClose }) {
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
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-md transform border-l border-navy-700 bg-navy-800 p-4 transition-transform sm:w-[420px] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-200">History</h2>
            <p className="text-xs text-slate-400">{history.length} analyses stored</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-navy-700 px-2 py-1 text-sm text-slate-300 hover:border-slate-500"
          >
            ✕ Close
          </button>
        </div>

        <div className="space-y-3 overflow-y-auto pb-8">
          {history.map((entry) => {
            const analysis = entry.analysis || {};
            const feedback = entry.feedback;
            const feedbackText = feedback?.human_verdict
              ? `Feedback: ${feedback.human_verdict} ✓`
              : "No feedback yet";

            return (
              <article key={entry.id} className="rounded-lg border border-navy-700 bg-navy-900 p-3">
                <p className="text-xs text-slate-400">{formatTimestamp(entry.timestamp)}</p>
                <p className="mt-1 flex items-center gap-2 text-sm text-slate-100">
                  <span
                    className={`inline-block h-2.5 w-2.5 rounded-full ${scoreColor(
                      analysis.overall_drift_score || 0
                    )}`}
                  />
                  Score: {(analysis.overall_drift_score || 0).toFixed(2)}
                </p>
                <p className="mt-1 text-sm text-slate-200">{analysis.suggested_routing || "-"}</p>
                <p className="mt-1 text-xs text-slate-400">{feedbackText}</p>
              </article>
            );
          })}

          {history.length === 0 && <p className="text-sm text-slate-400">No analyses found yet.</p>}
        </div>
      </aside>
    </>
  );
}
