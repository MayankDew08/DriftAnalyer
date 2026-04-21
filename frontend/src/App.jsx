import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { checkHealth } from "./api/client";
import DriftReport from "./components/DriftReport";
import HistoryDetailModal from "./components/HistoryDetailModal";
import HistoryPanel from "./components/HistoryPanel";
import HumanConfirmation from "./components/HumanConfirmation";
import InputPanel from "./components/InputPanel";
import LanguageToggle from "./components/LanguageToggle";
import useDriftAnalyzer from "./hooks/useDriftAnalyzer";

export default function App() {
  const { t } = useTranslation();
  const {
    strategyRaw,
    implementationRaw,
    analysisResult,
    analysisId,
    isAnalyzing,
    analyzeError,
    feedbackSubmitted,
    feedbackError,
    isSubmittingFeedback,
    history,
    isHistoryOpen,
    selectedEntry,
    backendHealthy,
    setBackendHealthy,
    setAnalyzeError,
    setFeedbackError,
    setStrategyRaw,
    setImplementationRaw,
    runAnalysis,
    submitHumanFeedback,
    loadHistory,
    toggleHistory,
    clearAll,
    selectEntry,
    closeEntryDetail,
  } = useDriftAnalyzer();

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    async function probeHealth() {
      try {
        const health = await checkHealth();
        setBackendHealthy(health?.status === "ok");
      } catch (_error) {
        setBackendHealthy(false);
      }
    }

    probeHealth();
  }, []);

  return (
    <div className="h-screen overflow-hidden bg-navy-900 text-slate-50">
      <header className="border-b border-navy-700 px-6 py-4">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">{t("header.title")}</h1>
            <p className="text-xs text-slate-400">{t("header.subtitle")}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <span
                className={`inline-block h-2.5 w-2.5 rounded-full ${
                  backendHealthy ? "bg-severity-none" : "bg-severity-high"
                }`}
              />
              {backendHealthy ? t("header.health_ok") : t("header.health_fail")}
            </div>
            <button
              type="button"
              onClick={toggleHistory}
              className="rounded-md border border-navy-700 px-3 py-1.5 text-sm font-medium text-slate-200 transition hover:border-slate-500"
            >
              {t("header.history_button")}
            </button>
            <LanguageToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto grid h-[calc(100vh-81px)] max-w-[1600px] grid-cols-1 gap-4 p-4 lg:grid-cols-10">
        <div className="h-full overflow-y-auto lg:col-span-3">
          <InputPanel
            strategyRaw={strategyRaw}
            implementationRaw={implementationRaw}
            setStrategyRaw={setStrategyRaw}
            setImplementationRaw={setImplementationRaw}
            runAnalysis={runAnalysis}
            clearAll={clearAll}
            isAnalyzing={isAnalyzing}
            analyzeError={analyzeError}
            setAnalyzeError={setAnalyzeError}
          />
        </div>

        <div className="h-full overflow-y-auto lg:col-span-4">
          <DriftReport analysisResult={analysisResult} isAnalyzing={isAnalyzing} />
        </div>

        <div className="h-full overflow-y-auto lg:col-span-3">
          <HumanConfirmation
            analysisId={analysisId}
            feedbackSubmitted={feedbackSubmitted}
            feedbackError={feedbackError}
            setFeedbackError={setFeedbackError}
            isSubmittingFeedback={isSubmittingFeedback}
            onSubmit={submitHumanFeedback}
          />
        </div>
      </main>

      <HistoryPanel
        isOpen={isHistoryOpen}
        history={history}
        onClose={toggleHistory}
        onSelectEntry={selectEntry}
      />
      <HistoryDetailModal entry={selectedEntry} onClose={closeEntryDetail} />
    </div>
  );
}
