import { useState } from "react";
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

function mapFeedbackError(message, t) {
  if (!message) return message;

  const map = {
    "Could not submit feedback - analysis session expired.": t("human_confirmation.error_404"),
    "Could not submit feedback — analysis session expired.": t("human_confirmation.error_404"),
    "Something went wrong. Please try again.": t("human_confirmation.error_unknown"),
  };

  return map[message] || message;
}

export default function HumanConfirmation({
  analysisId,
  feedbackSubmitted,
  feedbackError,
  setFeedbackError,
  isSubmittingFeedback,
  onSubmit,
}) {
  const { t } = useTranslation();
  const [verdict, setVerdict] = useState("");
  const [notes, setNotes] = useState("");
  const [disagreementType, setDisagreementType] = useState("");

  const VERDICTS = [
    { value: "Yes", label: t("human_confirmation.verdict_yes") },
    { value: "No", label: t("human_confirmation.verdict_no") },
    { value: "Partially", label: t("human_confirmation.verdict_partially") },
  ];

  const DISAGREEMENTS = [
    { value: "False Positive", label: t("human_confirmation.false_positive") },
    { value: "False Negative", label: t("human_confirmation.false_negative") },
    { value: "Wrong Category", label: t("human_confirmation.wrong_category") },
  ];

  const needsDisagreement = verdict === "No" || verdict === "Partially";
  const submitDisabled = !verdict || isSubmittingFeedback || (needsDisagreement && !disagreementType);

  if (!analysisId) {
    return (
      <section className="flex h-full items-center justify-center rounded-xl border border-navy-700 bg-navy-800 p-4 text-center text-slate-400">
        <p>{t("human_confirmation.empty_state")}</p>
      </section>
    );
  }

  if (feedbackSubmitted) {
    return (
      <section className="flex h-full items-center justify-center rounded-xl border border-navy-700 bg-navy-800 p-4">
        <div className="text-center">
          <p className="mb-2 text-3xl text-severity-none">✓</p>
          <p className="font-semibold text-slate-100">{t("human_confirmation.success_title")}</p>
          <p className="mt-2 text-xs text-slate-400">
            {t("human_confirmation.success_id", { id: analysisId?.slice(0, 8) })}
          </p>
        </div>
      </section>
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const disagreement = needsDisagreement ? disagreementType : null;
    await onSubmit(verdict, notes, disagreement);
  }

  return (
    <section className="h-full rounded-xl border border-navy-700 bg-navy-800 p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400">{t("human_confirmation.title")}</p>
          <p className="mt-2 text-sm text-slate-200">{t("human_confirmation.question")}</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {VERDICTS.map((item) => {
            const active = verdict === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setVerdict(item.value)}
                className={`rounded-md border px-2 py-2 text-sm font-medium transition ${
                  active
                    ? "border-blue-500 bg-blue-500 text-white"
                    : "border-navy-700 bg-transparent text-slate-300 hover:border-slate-500"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {needsDisagreement && (
          <div className="space-y-3 rounded-lg border border-navy-700 bg-navy-900 p-3">
            <div>
              <label className="mb-2 block text-sm text-slate-200">{t("human_confirmation.notes_label")}</label>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={4}
                placeholder={t("human_confirmation.notes_placeholder")}
                className="w-full resize-none rounded-lg border border-navy-700 bg-navy-900 p-2 text-sm text-slate-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            <fieldset>
              <legend className="mb-2 text-sm text-slate-200">{t("human_confirmation.disagreement_label")}</legend>
              <div className="space-y-2 text-sm text-slate-300">
                {DISAGREEMENTS.map((option) => (
                  <label key={option.value} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="disagreementType"
                      value={option.value}
                      checked={disagreementType === option.value}
                      onChange={(event) => setDisagreementType(event.target.value)}
                      className="h-4 w-4 accent-blue-500"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        )}

        {!needsDisagreement && (
          <div>
            <label className="mb-2 block text-sm text-slate-300">{t("human_confirmation.notes_label")}</label>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              placeholder={t("human_confirmation.notes_placeholder")}
              className="w-full resize-none rounded-lg border border-navy-700 bg-navy-900 p-2 text-sm text-slate-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={submitDisabled}
          className="flex w-full items-center justify-center rounded-lg bg-blue-500 px-4 py-2 font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmittingFeedback ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              {t("human_confirmation.submitting_button")}
            </span>
          ) : (
            t("human_confirmation.submit_button")
          )}
        </button>

        <ErrorBanner message={mapFeedbackError(feedbackError, t)} onClose={() => setFeedbackError(null)} />
      </form>
    </section>
  );
}
