import { useState } from "react";

export function Segmented({
  options,
  onChange,
}: {
  options: string[];
  onChange?: (v: string) => void;
}) {
  const [active, setActive] = useState(options[0]);
  return (
    <div
      role="tablist"
      className="inline-flex p-1 bg-[color:var(--surface)] rounded-full"
    >
      {options.map((o) => {
        const isActive = o === active;
        return (
          <button
            key={o}
            role="tab"
            aria-selected={isActive}
            onClick={() => {
              setActive(o);
              onChange?.(o);
            }}
            className={`h-10 px-5 rounded-full text-[14px] font-medium transition-colors ${
              isActive
                ? "bg-white text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                : "text-muted-foreground"
            }`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}
