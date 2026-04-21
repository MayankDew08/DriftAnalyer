import { useTranslation } from "react-i18next";

const ROUTING_CLASSES = {
  Accept: "bg-severity-none text-white",
  "Revise → Implementation": "bg-severity-medium text-white",
  "Revise → Strategy": "bg-severity-high text-white",
};

const routingKeyMap = {
  Accept: "status_badge.accept",
  "Revise → Implementation": "status_badge.revise_impl",
  "Revise → Strategy": "status_badge.revise_strategy",
};

export default function StatusBadge({ routing }) {
  const { t } = useTranslation();

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
        ROUTING_CLASSES[routing] || "bg-navy-700 text-slate-100"
      }`}
    >
      {t(routingKeyMap[routing] || routing)}
    </span>
  );
}
