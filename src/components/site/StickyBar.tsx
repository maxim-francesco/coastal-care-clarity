import { Link } from "@tanstack/react-router";
import { Phone } from "lucide-react";
import { site } from "@/content/site";

export function StickyBar() {
  return (
    <div className="md:hidden fixed left-0 right-0 bottom-0 z-40 pb-safe">
      <div className="glass mx-3 mb-3 h-16 rounded-[20px] flex items-center gap-2 px-2">
        <a
          href={site.phoneHref}
          className="btn-pill btn-secondary flex-1 !h-12"
          aria-label={`Call ${site.phone}`}
        >
          <Phone size={16} strokeWidth={2.25} /> Call
        </a>
        <Link to="/contact" className="btn-pill btn-primary flex-1 !h-12">
          Get a quote
        </Link>
      </div>
    </div>
  );
}
