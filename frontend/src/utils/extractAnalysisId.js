export default function extractAnalysisId(summaryString) {
  if (!summaryString || typeof summaryString !== "string") {
    return null;
  }

  const match = summaryString.match(/^\[Analysis ID: ([0-9a-fA-F-]{36})\]/);
  return match ? match[1] : null;
}
