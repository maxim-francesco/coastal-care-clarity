import { Link } from "@tanstack/react-router";
import type { Service } from "@/content/site";
import { Sparkles, BedDouble, Key, Home } from "lucide-react";

const iconFor = {
  cleaning: Sparkles,
  turnover: BedDouble,
  management: Key,
  "home-watch": Home,
} as const;

export function ServiceCard({ s }: { s: Service }) {
  const Icon = iconFor[s.id];
  return (
    <div className="bg-white rounded-[20px] border overflow-hidden flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={s.image}
          alt=""
          loading="lazy"
          width={1200}
          height={900}
          className="h-full w-full object-cover"
        />
        <div className="glass absolute top-3 left-3 h-9 px-3 rounded-full inline-flex items-center text-[13px] font-medium">
          {s.fromLabel}
        </div>
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <Icon size={20} strokeWidth={1.5} className="text-foreground mb-3" />
        <h3 className="text-[22px] font-semibold tracking-tight">{s.name}</h3>
        <p className="mt-2 text-[15px] text-muted-foreground line-clamp-2">
          {s.short}
        </p>
        <div className="mt-5">
          <Link to="/services" hash={s.id} className="link-arrow">
            Learn more
          </Link>
        </div>
      </div>
    </div>
  );
}
