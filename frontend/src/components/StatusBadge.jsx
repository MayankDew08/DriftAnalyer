const ROUTING_CLASSES = {
  Accept: "bg-severity-none text-white",
  "Revise → Implementation": "bg-severity-medium text-white",
  "Revise → Strategy": "bg-severity-high text-white",
};

export default function StatusBadge({ routing }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
        ROUTING_CLASSES[routing] || "bg-navy-700 text-slate-100"
      }`}
    >
      {routing}
    </span>
  );
}
