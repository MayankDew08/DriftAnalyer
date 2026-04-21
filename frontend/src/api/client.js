const DEFAULT_ERROR = "Something went wrong. Please try again.";

function mapError(status) {
  if (status === 422) {
    return "Input format error - make sure your text includes the correct labels.";
  }
  if (status === 500) {
    return "Analysis failed. The drift engine encountered an error.";
  }
  if (status === 404) {
    return "Could not submit feedback - analysis session expired.";
  }
  return DEFAULT_ERROR;
}

async function request(path, options = {}) {
  try {
    const response = await fetch(path, options);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const error = new Error(mapError(response.status));
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("Could not reach the backend. Check that the server is running.");
    }
    throw error;
  }
}

export function analyzeInputs(strategyRaw, implementationRaw) {
  return request("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      strategy_raw: strategyRaw,
      implementation_raw: implementationRaw,
    }),
  });
}

export function submitFeedback(analysisId, verdict, notes, disagreementType) {
  return request("/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      analysis_id: analysisId,
      human_verdict: verdict,
      human_notes: notes,
      disagreement_type: disagreementType,
    }),
  });
}

export function fetchHistory() {
  return request("/api/history");
}

export function fetchDisagreements() {
  return request("/api/feedback/disagreements");
}

export function checkHealth() {
  return request("/api/health");
}
