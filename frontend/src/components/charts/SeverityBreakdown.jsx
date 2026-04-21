import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
 
const SEVERITY_DOT_CLASS = {
  Critical: "bg-red-700",
  High: "bg-severity-high",
  Moderate: "bg-severity-medium",
  Medium: "bg-severity-medium",
  Low: "bg-severity-low",
  None: "bg-severity-none",
  Unknown: "bg-slate-400",
};

function CustomTooltip({ active, payload }) {
  if (!active || !payload || payload.length === 0) return null;

  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <div className="rounded-md border border-navy-700 bg-navy-900 px-3 py-2 text-xs text-slate-100 shadow-lg">
      {point.severity} - {point.count} flags
    </div>
  );
}

function CenterLabel({ viewBox, total }) {
  const cx = viewBox?.cx;
  const cy = viewBox?.cy;
  if (typeof cx !== "number" || typeof cy !== "number") return null;

  return (
    <g>
      <text x={cx} y={cy - 2} textAnchor="middle" fill="#F8FAFC" fontSize="18" fontWeight="700">
        {total}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="#94A3B8" fontSize="11">
        Total Flags
      </text>
    </g>
  );
}

export default function SeverityBreakdown({ data }) {
  const total = (data || []).reduce((sum, item) => sum + item.count, 0);

  if (!data || data.length === 0 || total === 0) {
    return (
      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-100">Severity Distribution</h3>
        <div className="flex h-[220px] items-center justify-center text-sm text-slate-400">
          No drift detected yet
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-slate-100">Severity Distribution</h3>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="severity"
              cx="50%"
              cy="45%"
              outerRadius={80}
              innerRadius={50}
              stroke="#1E293B"
              strokeWidth={1}
              labelLine={false}
              label={(props) => <CenterLabel {...props} total={total} />}
            >
              {data.map((item) => (
                <Cell key={item.severity} fill={item.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
        {data.map((item) => (
          <div key={item.severity} className="flex items-center gap-2 text-xs text-slate-300">
            <span
              className={`inline-block h-2.5 w-2.5 rounded-full ${
                SEVERITY_DOT_CLASS[item.severity] || "bg-slate-400"
              }`}
            />
            <span>
              {item.severity}: {item.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
