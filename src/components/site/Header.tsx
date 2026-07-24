import { Link } from "@tanstack/react-router";
import { Menu, Phone, X } from "lucide-react";
import { useEffect, useState } from "react";
import { site } from "@/content/site";

export function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className="glass fixed top-0 left-0 right-0 z-50 h-12 md:h-14 flex items-center px-5">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
          <Link
            to="/"
            className="text-[17px] font-semibold tracking-tight text-foreground"
            onClick={() => setOpen(false)}
          >
            Coastal Care
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            {site.nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="text-[14px] text-muted-foreground hover:text-foreground transition-colors"
                activeProps={{ className: "text-foreground" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={site.phoneHref}
              className="btn-pill btn-primary md:hidden !h-9 !px-4 !text-[14px]"
              aria-label={`Call ${site.phone}`}
            >
              <Phone size={14} strokeWidth={2.25} />
              Call
            </a>
            <div className="hidden md:block">
              <Link
                to="/contact"
                className="btn-pill btn-primary !h-9 !px-4 !text-[14px]"
              >
                Get a quote
              </Link>
            </div>
            <button
              className="md:hidden inline-flex h-12 w-12 items-center justify-center -mr-2 text-foreground"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile full-screen glass menu */}
      {open && (
        <div
          className="glass fixed inset-0 z-40 md:hidden flex flex-col pt-16 pb-safe px-6"
          role="dialog"
          aria-modal="true"
        >
          <nav className="flex-1 flex flex-col gap-6 pt-10">
            {site.nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="text-[28px] font-semibold tracking-tight text-foreground"
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="hairline-t pt-6 pb-8">
            <p className="text-[13px] text-muted-foreground">Call directly</p>
            <a
              href={site.phoneHref}
              className="text-[24px] font-semibold text-accent"
            >
              {site.phone}
            </a>
          </div>
        </div>
      )}
    </>
  );
}
