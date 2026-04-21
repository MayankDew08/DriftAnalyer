import { useState } from "react";
import { analyzeInputs, fetchHistory, submitFeedback } from "../api/client";
import extractAnalysisId from "../utils/extractAnalysisId";

export default function useDriftAnalyzer() {
  const [strategyRaw, setStrategyRaw] = useState("");
  const [implementationRaw, setImplementationRaw] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisId, setAnalysisId] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackError, setFeedbackError] = useState(null);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [history, setHistory] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [backendHealthy, setBackendHealthy] = useState(false);

  async function runAnalysis() {
    setAnalyzeError(null);
    setFeedbackSubmitted(false);
    setFeedbackError(null);

    if (!strategyRaw.trim() || !implementationRaw.trim()) {
      setAnalyzeError("Input format error - make sure your text includes the correct labels.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeInputs(strategyRaw, implementationRaw);
      const id = extractAnalysisId(result?.human_readable_summary);

      setAnalysisResult(result);
      setAnalysisId(id);
    } catch (error) {
      setAnalysisResult(null);
      setAnalysisId(null);
      setAnalyzeError(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function submitHumanFeedback(verdict, notes, disagreementType) {
    setFeedbackError(null);

    if (!analysisId) {
      setFeedbackError("Could not submit feedback - analysis session expired.");
      return;
    }

    setIsSubmittingFeedback(true);
    try {
      await submitFeedback(analysisId, verdict, notes, disagreementType);
      setFeedbackSubmitted(true);
      await loadHistory();
    } catch (error) {
      setFeedbackError(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmittingFeedback(false);
    }
  }

  async function loadHistory() {
    try {
      const data = await fetchHistory();
      setHistory(data?.entries || []);
    } catch (_error) {
      setHistory([]);
    }
  }

  function toggleHistory() {
    setIsHistoryOpen((current) => !current);
  }

  function clearAll() {
    setStrategyRaw("");
    setImplementationRaw("");
    setAnalysisResult(null);
    setAnalysisId(null);
    setAnalyzeError(null);
    setFeedbackSubmitted(false);
    setFeedbackError(null);
    setIsSubmittingFeedback(false);
  }

  return {
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
  };
}
