import { useTranslation } from "react-i18next";

function ErrorBanner({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="mt-4 flex items-start justify-between gap-2 rounded-md border border-severity-high/60 bg-severity-high/10 px-3 py-2 text-sm text-red-200">
      <span>{message}</span>
      <button type="button" className="text-red-200" onClick={onClose} aria-label="Dismiss error">
        ✕
      </button>
    </div>
  );
}

function mapAnalyzeError(message, t) {
  if (!message) return message;

  const map = {
    "Input format error - make sure your text includes the correct labels.": t("input_panel.error_format"),
    "Input format error — make sure your text includes the correct labels.": t("input_panel.error_format"),
    "Analysis failed. The drift engine encountered an error.": t("input_panel.error_server"),
    "Could not reach the backend. Check that the server is running.": t("input_panel.error_network"),
    "Something went wrong. Please try again.": t("input_panel.error_unknown"),
  };

  return map[message] || message;
}

export default function InputPanel({
  strategyRaw,
  implementationRaw,
  setStrategyRaw,
  setImplementationRaw,
  runAnalysis,
  clearAll,
  isAnalyzing,
  analyzeError,
  setAnalyzeError,
}) {
  const { t } = useTranslation();

  return (
    <section className="h-full rounded-xl border border-navy-700 bg-navy-800 p-4">
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-xs uppercase tracking-widest text-slate-400">
            {t("input_panel.strategy_label")}
          </label>
          <textarea
            value={strategyRaw}
            onChange={(event) => setStrategyRaw(event.target.value)}
            rows={12}
            placeholder={t("input_panel.strategy_placeholder")}
            className="w-full resize-none rounded-lg border border-navy-700 bg-navy-900 p-3 font-mono text-sm text-slate-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
          />
          <p className="mt-1 text-xs text-slate-400">{t("input_panel.strategy_hint")}</p>
        </div>

        <div>
          <label className="mb-2 block text-xs uppercase tracking-widest text-slate-400">
            {t("input_panel.implementation_label")}
          </label>
          <textarea
            value={implementationRaw}
            onChange={(event) => setImplementationRaw(event.target.value)}
            rows={12}
            placeholder={t("input_panel.implementation_placeholder")}
            className="w-full resize-none rounded-lg border border-navy-700 bg-navy-900 p-3 font-mono text-sm text-slate-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
          />
          <p className="mt-1 text-xs text-slate-400">{t("input_panel.implementation_hint")}</p>
        </div>

        <button
          type="button"
          onClick={runAnalysis}
          disabled={isAnalyzing || !strategyRaw.trim() || !implementationRaw.trim()}
          className="flex w-full items-center justify-center rounded-lg bg-blue-500 px-4 py-2 font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isAnalyzing ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              {t("input_panel.analyzing_button")}
            </span>
          ) : (
            t("input_panel.analyze_button")
          )}
        </button>

        <button
          type="button"
          onClick={clearAll}
          className="w-full rounded-lg border border-navy-700 bg-transparent px-4 py-2 font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white"
        >
          {t("input_panel.clear_button")}
        </button>

        <ErrorBanner message={mapAnalyzeError(analyzeError, t)} onClose={() => setAnalyzeError(null)} />
      </div>
    </section>
  );
}
