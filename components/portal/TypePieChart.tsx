const TYPE_COLORS: Record<string, string> = {
  Feature: "#3d7cb8",
  Bug: "#f87171",
  Request: "#fbbf24",
};

const FALLBACK_COLORS = ["#60a5fa", "#a78bfa", "#34d399", "#8899b4"];

function colorForType(type: string, index: number): string {
  return TYPE_COLORS[type] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

interface TypePieChartProps {
  data: Record<string, number>;
}

export function TypePieChart({ data }: TypePieChartProps) {
  const entries = Object.entries(data).sort(([, a], [, b]) => b - a);
  const total = entries.reduce((sum, [, count]) => sum + count, 0);

  if (total === 0) {
    return null;
  }

  let angle = 0;
  const segments = entries.map(([type, count], index) => {
    const share = count / total;
    const start = angle;
    angle += share * 360;
    return {
      type,
      count,
      share,
      start,
      end: angle,
      color: colorForType(type, index),
    };
  });

  const gradient = segments
    .map((segment) => `${segment.color} ${segment.start}deg ${segment.end}deg`)
    .join(", ");

  const ariaLabel = segments
    .map((segment) => `${segment.type}: ${Math.round(segment.share * 100)}%`)
    .join(", ");

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
      <div
        className="relative h-36 w-36 shrink-0 rounded-full ring-1 ring-border"
        style={{ background: `conic-gradient(${gradient})` }}
        role="img"
        aria-label={`Ticket types: ${ariaLabel}`}
      >
        <div className="absolute inset-[22%] flex items-center justify-center rounded-full bg-surface text-center">
          <div>
            <p className="text-2xl font-semibold leading-none">{total}</p>
            <p className="mt-1 text-xs text-muted">tickets</p>
          </div>
        </div>
      </div>

      <ul className="w-full min-w-0 space-y-2.5">
        {segments.map((segment) => (
          <li key={segment.type} className="flex items-center gap-2.5 text-sm">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: segment.color }}
              aria-hidden
            />
            <span className="min-w-0 flex-1 truncate">{segment.type}</span>
            <span className="shrink-0 text-muted">
              {segment.count}{" "}
              <span className="text-xs">({Math.round(segment.share * 100)}%)</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
