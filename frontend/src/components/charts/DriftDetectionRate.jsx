import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

function CustomTooltip({ active, payload }) {
  if (!active || !payload || payload.length === 0) return null;

  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <div className="rounded-md border border-navy-700 bg-navy-900 px-3 py-2 text-xs text-slate-100 shadow-lg">
      {point.name} - {point.count} inputs
    </div>
  );
}

function CenterLabel({ viewBox, driftCount, total }) {
  const cx = viewBox?.cx;
  const cy = viewBox?.cy;
  if (typeof cx !== "number" || typeof cy !== "number") return null;

  return (
    <g>
      <text x={cx} y={cy - 4} textAnchor="middle" fill="#F8FAFC" fontSize="18" fontWeight="700">
        {driftCount}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="#94A3B8" fontSize="11">
        / {total}
      </text>
    </g>
  );
}

export default function DriftDetectionRate({ data, total }) {
  if (!data || total === 0) {
    return (
      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-100">Drift Detection Rate</h3>
        <div className="flex h-[220px] items-center justify-center text-sm text-slate-400">No data yet</div>
      </div>
    );
  }

  const driftCount = data.find((item) => item.name === "Drift Detected")?.count || 0;

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-slate-100">Drift Detection Rate</h3>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="name"
              cx="50%"
              cy="45%"
              outerRadius={80}
              innerRadius={50}
              stroke="#1E293B"
              strokeWidth={1}
              labelLine={false}
              label={(props) => <CenterLabel {...props} driftCount={driftCount} total={total} />}
              animationDuration={800}
            >
              {data.map((item) => (
                <Cell key={item.name} fill={item.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2 text-xs text-slate-300">
            <span
              className={`inline-block h-2.5 w-2.5 rounded-full ${
                item.name === "Drift Detected" ? "bg-severity-high" : "bg-severity-none"
              }`}
            />
            <span>
              {item.name}: {item.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
