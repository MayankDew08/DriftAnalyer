function getScoreColor(score) {
  if (score <= 0.2) return "#10B981";
  if (score <= 0.5) return "#F59E0B";
  return "#EF4444";
}

function getScoreLabel(score) {
  if (score <= 0.2) return "Aligned";
  if (score <= 0.5) return "Minor Drift";
  return "Significant Drift";
}

export default function ScoreBar({ score }) {
  const safeScore = Number.isFinite(score) ? Math.min(1, Math.max(0, score)) : 0;
  const percent = Math.round(safeScore * 100);
  const label = getScoreLabel(safeScore);
  const fillColor = getScoreColor(safeScore);

  return (
    <div>
      <div className="mb-2 flex items-center gap-3">
        <div className="h-3 w-full overflow-hidden rounded-full bg-navy-700">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${percent}%`, backgroundColor: fillColor }}
          />
        </div>
        <span className="text-sm font-semibold text-slate-100">{safeScore.toFixed(2)}</span>
      </div>
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  );
}
