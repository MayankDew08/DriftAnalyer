import {
  CartesianGrid,
  Label,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function dotColor(score) {
  if (score < 0.2) return "#10B981";
  if (score < 0.6) return "#F59E0B";
  return "#EF4444";
}

function CustomDot({ cx, cy, payload, onSelectEntry }) {
  if (typeof cx !== "number" || typeof cy !== "number") return null;

  return (
    <circle
      cx={cx}
      cy={cy}
      r={5}
      fill={dotColor(payload?.score ?? 0)}
      stroke="#0F172A"
      strokeWidth={2}
      className="cursor-pointer"
      onClick={() => onSelectEntry(payload?.id)}
    />
  );
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload || payload.length === 0) return null;

  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <div className="rounded-md border border-navy-700 bg-navy-900 px-3 py-2 text-xs text-slate-100 shadow-lg">
      <p className="font-semibold">Score: {Number(point.score || 0).toFixed(2)}</p>
      <p className="mt-1 text-slate-300">{point.routing || "-"}</p>
    </div>
  );
}

export default function DriftScoreTimeline({ data, onSelectEntry }) {
  if (!data || data.length < 2) {
    return (
      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-100">Drift Score Over Time</h3>
        <div className="flex h-[220px] items-center justify-center text-sm text-slate-400">
          Not enough data yet
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-slate-100">Drift Score Over Time</h3>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" tick={{ fill: "#94A3B8", fontSize: 11 }} />
            <YAxis
              domain={[0, 1]}
              tick={{ fill: "#94A3B8", fontSize: 11 }}
              tickFormatter={(value) => value.toFixed(1)}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0.2} stroke="#10B981" strokeDasharray="5 5">
              <Label value="Aligned" fill="#10B981" position="insideTopLeft" fontSize={11} />
            </ReferenceLine>
            <ReferenceLine y={0.6} stroke="#EF4444" strokeDasharray="5 5">
              <Label value="Significant" fill="#EF4444" position="insideTopLeft" fontSize={11} />
            </ReferenceLine>
            <Line
              type="monotone"
              dataKey="score"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={(props) => <CustomDot {...props} onSelectEntry={onSelectEntry} />}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
