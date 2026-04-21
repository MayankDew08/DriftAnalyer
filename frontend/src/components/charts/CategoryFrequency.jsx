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

const COLORS = {
  Scope: "#EF4444",
  Constraint: "#F59E0B",
  Priority: "#3B82F6",
  Intent: "#A855F7",
  Inconsistency: "#EC4899",
};

function CustomTooltip({ active, payload }) {
  if (!active || !payload || payload.length === 0) return null;

  const item = payload[0]?.payload;
  if (!item) return null;

  return (
    <div className="rounded-md border border-navy-700 bg-navy-900 px-3 py-2 text-xs text-slate-100 shadow-lg">
      Detected {item.count} times
    </div>
  );
}

export default function CategoryFrequency({ data }) {
  if (!data || data.length === 0) {
    return (
      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-100">Most Frequent Drift Categories</h3>
        <div className="flex h-[200px] items-center justify-center text-sm text-slate-400">No data yet</div>
      </div>
    );
  }

  const maxCount = Math.max(...data.map((item) => item.count), 0);

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-slate-100">Most Frequent Drift Categories</h3>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 12, left: 4, bottom: 0 }}
          >
            <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
            <XAxis
              type="number"
              domain={[0, Math.max(1, maxCount + 1)]}
              allowDecimals={false}
              tick={{ fill: "#94A3B8", fontSize: 11 }}
            />
            <YAxis
              type="category"
              dataKey="shortLabel"
              tick={{ fill: "#94A3B8", fontSize: 11 }}
              width={96}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[4, 4, 4, 4]}>
              {data.map((item) => (
                <Cell key={item.category} fill={COLORS[item.shortLabel] || "#3B82F6"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
