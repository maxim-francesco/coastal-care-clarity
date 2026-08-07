import { Link } from "@tanstack/react-router";
import { site } from "@/content/site";

export function Footer() {
  return (
    <footer className="bg-[color:var(--surface)] hairline-t mt-24 pb-32 md:pb-12">
      <div className="mx-auto max-w-6xl px-5 py-14 text-[13px] text-muted-foreground">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <p className="text-[15px] font-semibold text-foreground">Coastal Care</p>
            <p className="mt-2 max-w-xs">
              One person looking after your Florida home — cleaning, turnovers, management and home
              watch.
            </p>
          </div>
          <div>
            <p className="text-foreground font-medium mb-3">Services</p>
            <ul className="space-y-2">
              <li>
                <Link to="/services" hash="cleaning" className="block py-3.5 md:py-0">
                  Residential cleaning
                </Link>
              </li>
              <li>
                <Link to="/services" hash="turnover" className="block py-3.5 md:py-0">
                  Vacation turnover
                </Link>
              </li>
              <li>
                <Link to="/services" hash="management" className="block py-3.5 md:py-0">
                  Home management
                </Link>
              </li>
              <li>
                <Link to="/services" hash="home-watch" className="block py-3.5 md:py-0">
                  Home watch
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-foreground font-medium mb-3">Company</p>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="block py-3.5 md:py-0">
                  About
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="block py-3.5 md:py-0">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/service-areas" className="block py-3.5 md:py-0">
                  Service areas
                </Link>
              </li>
              <li>
                <Link to="/faq" className="block py-3.5 md:py-0">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="block py-3.5 md:py-0">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-foreground font-medium mb-3">Contact</p>
            <ul className="space-y-2">
              <li>
                <a href={site.phoneHref} className="block py-3.5 md:py-0">
                  {site.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${site.email}`} className="block py-3.5 md:py-0">
                  {site.email}
                </a>
              </li>
              <li>{site.hours}</li>
            </ul>
            <div className="mt-4 flex gap-4">
              <a href="#" aria-label="Facebook" className="inline-block py-3.5 md:py-0">
                Facebook
              </a>
              <a href="#" aria-label="Instagram" className="inline-block py-3.5 md:py-0">
                Instagram
              </a>
            </div>
          </div>
        </div>
        <div className="mt-10 hairline-t pt-6">© 2026 {site.brand} · Licensed &amp; Insured</div>
      </div>
    </footer>
  );
}
