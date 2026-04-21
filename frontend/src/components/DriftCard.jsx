import { useState } from "react";

const SEVERITY_STYLES = {
  High: {
    badge: "bg-severity-high text-white",
    border: "border-severity-high",
  },
  Medium: {
    badge: "bg-severity-medium text-white",
    border: "border-severity-medium",
  },
  Low: {
    badge: "bg-severity-low text-white",
    border: "border-severity-low",
  },
  None: {
    badge: "bg-severity-none text-white",
    border: "border-severity-none",
  },
};

export default function DriftCard({ category }) {
  const isDetected = Boolean(category?.detected);
  const [expanded, setExpanded] = useState(isDetected);

  if (!category) {
    return null;
  }

  const severity = category.severity || "None";
  const severityStyle = SEVERITY_STYLES[severity] || SEVERITY_STYLES.None;

  if (!isDetected) {
    return (
      <div className="rounded-lg border border-navy-700 bg-slate-900/40 p-4 text-slate-400">
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="flex w-full items-center justify-between text-left"
        >
          <span className="font-medium">{category.category}</span>
          <span className="text-sm">{expanded ? "▾" : "▸"} ✓</span>
        </button>

        {expanded && (
          <div className="mt-3 space-y-2 text-sm">
            <p>{category.reason}</p>
            <p className="rounded-md border border-navy-700 bg-navy-900 px-3 py-2 font-mono text-xs">
              {category.evidence}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`rounded-lg border border-navy-700 border-l-4 bg-navy-900 p-4 ${severityStyle.border}`}>
      <div className="mb-2 flex items-start justify-between gap-3">
        <h4 className="font-semibold text-slate-50">{category.category}</h4>
        <span className={`rounded px-2 py-1 text-xs font-bold ${severityStyle.badge}`}>{severity}</span>
      </div>
      <p className="mb-3 text-sm text-slate-300">{category.reason}</p>
      <blockquote className="rounded-md border border-navy-700 bg-slate-950/70 px-3 py-2 font-mono text-xs text-slate-300">
        {category.evidence}
      </blockquote>
    </div>
  );
}
