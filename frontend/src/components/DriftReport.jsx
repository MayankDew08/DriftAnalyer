import DriftCard from "./DriftCard";
import ScoreBar from "./ScoreBar";
import StatusBadge from "./StatusBadge";

function stripAnalysisId(summary) {
  if (!summary) return "";
  return summary.replace(/^\[Analysis ID: [^\]]+\]\s*/, "");
}

function sortCategories(categories = []) {
  return [...categories].sort((a, b) => Number(b.detected) - Number(a.detected));
}

export default function DriftReport({ analysisResult, isAnalyzing }) {
  if (isAnalyzing) {
    return (
      <section className="flex h-full items-center justify-center rounded-xl border border-navy-700 bg-navy-800 p-6">
        <div className="text-center text-slate-300">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-500/40 border-t-slate-100" />
          <p className="animate-pulse">Running drift analysis...</p>
        </div>
      </section>
    );
  }

  if (!analysisResult) {
    return (
      <section className="flex h-full items-center justify-center rounded-xl border border-transparent bg-navy-800 p-6 text-center">
        <div className="text-slate-400">
          <p className="mb-2 text-4xl">◎</p>
          <p>Paste your inputs and click Analyze</p>
        </div>
      </section>
    );
  }

  const categories = sortCategories(analysisResult.drift_categories);
  const summary = stripAnalysisId(analysisResult.human_readable_summary);

  return (
    <section className="h-full rounded-xl border border-navy-700 bg-navy-800 p-4">
      <div className="space-y-5">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400">Drift Analysis Result</p>
          <div className="mt-2">
            <StatusBadge routing={analysisResult.suggested_routing} />
          </div>
        </div>

        <div className="rounded-lg border border-navy-700 bg-navy-900 p-4">
          <p className="mb-3 text-sm font-semibold text-slate-100">Overall Drift Score</p>
          <ScoreBar score={analysisResult.overall_drift_score} />
        </div>

        <div className="space-y-3">
          {categories.map((category) => (
            <DriftCard key={category.category} category={category} />
          ))}
        </div>

        <div className="rounded-lg border border-navy-700 bg-navy-900 p-4">
          <p className="mb-2 text-xs uppercase tracking-widest text-slate-400">Summary</p>
          <p className="text-sm text-slate-200">{summary}</p>
        </div>
      </div>
    </section>
  );
}
