import { useState } from "react";
import { Plus } from "lucide-react";

export function FaqAccordion({
  items,
}: {
  items: { q: string; a: string }[];
}) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="hairline-t">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className="hairline-b">
            <button
              className="w-full min-h-14 py-4 flex items-center justify-between gap-4 text-left"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
            >
              <span className="text-[17px] font-medium tracking-tight">
                {it.q}
              </span>
              <Plus
                size={20}
                strokeWidth={1.75}
                className={`shrink-0 text-muted-foreground transition-transform duration-300 ease-[cubic-bezier(.28,.11,.32,1)] ${
                  isOpen ? "rotate-45" : ""
                }`}
              />
            </button>
            <div
              className={`grid transition-[grid-template-rows] duration-400 ease-[cubic-bezier(.28,.11,.32,1)] ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <p className="pb-5 pr-8 text-[16px] text-muted-foreground max-w-2xl">
                  {it.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
