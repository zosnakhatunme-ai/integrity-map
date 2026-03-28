import { Clock } from "lucide-react";

const TIME_OPTIONS = [
  { label: "সব", value: "all", days: 0 },
  { label: "৭ দিন", value: "7d", days: 7 },
  { label: "১ মাস", value: "1m", days: 30 },
  { label: "১ বছর", value: "1y", days: 365 },
];

interface TimeSliderProps {
  value: string;
  onChange: (value: string) => void;
}

export default function TimeSlider({ value, onChange }: TimeSliderProps) {
  return (
    <div className="bg-card/95 backdrop-blur-sm shadow-md rounded-lg border px-3 py-2 flex items-center gap-2">
      <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      <div className="flex gap-1">
        {TIME_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors ${
              value === opt.value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function getTimeDays(value: string): number {
  const opt = TIME_OPTIONS.find((o) => o.value === value);
  return opt?.days || 0;
}
