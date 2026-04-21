import { useTranslation } from "react-i18next";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLOR_BY_CATEGORY = {
  "Scope Violation": "#EF4444",
  "Constraint Violation": "#F59E0B",
  "Priority Misalignment": "#3B82F6",
  "Intent Drift": "#A855F7",
  "Internal Inconsistency": "#EC4899",
};

function CustomTooltip({ active, payload, t }) {
  if (!active || !payload || payload.length === 0) return null;

  const item = payload[0]?.payload;
  if (!item) return null;

  return (
    <div className="rounded-md border border-navy-700 bg-navy-900 px-3 py-2 text-xs text-slate-100 shadow-lg">
      {t("charts.tooltip_detected", { count: item.count })}
    </div>
  );
}

export default function CategoryFrequency({ data }) {
  const { t, i18n } = useTranslation();

  const shortLabel = (fullName) => {
    const map = {
      en: {
        "Scope Violation": "Scope",
        "Constraint Violation": "Constraint",
        "Priority Misalignment": "Priority",
        "Intent Drift": "Intent",
        "Internal Inconsistency": "Inconsistency",
      },
      ja: {
        "Scope Violation": "スコープ",
        "Constraint Violation": "制約",
        "Priority Misalignment": "優先順位",
        "Intent Drift": "意図",
        "Internal Inconsistency": "内部矛盾",
      },
    };

    const lang = i18n.language.startsWith("ja") ? "ja" : "en";
    return map[lang]?.[fullName] ?? fullName;
  };

  if (!data || data.length === 0) {
    return (
      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-100">{t("charts.category_title")}</h3>
        <div className="flex h-[200px] items-center justify-center text-sm text-slate-400">{t("charts.no_data")}</div>
      </div>
    );
  }

  const maxCount = Math.max(...data.map((item) => item.count), 0);
  const preparedData = data.map((item) => ({ ...item, displayLabel: shortLabel(item.category) }));

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-slate-100">{t("charts.category_title")}</h3>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={preparedData} layout="vertical" margin={{ top: 0, right: 12, left: 4, bottom: 0 }}>
            <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
            <XAxis
              type="number"
              domain={[0, Math.max(1, maxCount + 1)]}
              allowDecimals={false}
              tick={{ fill: "#94A3B8", fontSize: 11 }}
            />
            <YAxis
              type="category"
              dataKey="displayLabel"
              tick={{ fill: "#94A3B8", fontSize: 11 }}
              width={96}
            />
            <Tooltip content={<CustomTooltip t={t} />} />
            <Bar dataKey="count" radius={[4, 4, 4, 4]}>
              {preparedData.map((item) => (
                <Cell key={item.category} fill={COLOR_BY_CATEGORY[item.category] || "#3B82F6"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
