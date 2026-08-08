import { createFileRoute, Link, useLoaderData } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Eye, Search, Droplet, FileText, ArrowRight } from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import { Section } from "@/components/site/Section";
import { ServiceCard } from "@/components/site/ServiceCard";
import {
  whyMe,
  howVisitWorks,
  site,
} from "@/content/site";
import { getServicesAndPricing, getTestimonials, type UiSiteSettings } from "@/server/services";


export const Route = createFileRoute("/")({
  loader: async () => {
    const [servicesData, testimonials] = await Promise.all([
      getServicesAndPricing(),
      getTestimonials(),
    ]);
    return {
      servicesForUi: servicesData.servicesForUi,
      pricingCardsForUi: servicesData.pricingCardsForUi,
      testimonials,
    };
  },
  head: () => ({
    meta: [
      { title: "Coastal Care Home Services — Naples, FL" },
      {
        name: "description",
        content:
          "Cleaning, vacation turnovers, home management, and home watch across Southwest Florida. One person, every visit. Licensed and insured.",
      },
      {
        property: "og:title",
        content: "Coastal Care Home Services — Naples, FL",
      },
      {
        property: "og:description",
        content:
          "One person looking after your Florida home. Cleaning, turnovers, home management, home watch.",
      },
    ],
  }),
  component: Home,
});


function ScrollReveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [ref, setRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(ref);
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref]);

  return (
    <div
      ref={setRef}
      className={`${className} transition-all duration-700 ease-out`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(24px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function Home() {
  const { servicesForUi, pricingCardsForUi, testimonials } = Route.useLoaderData();
  const settings = useLoaderData({ from: "__root__" }) as UiSiteSettings;
  const phone = settings?.phone ?? site.phone;
  const phoneHref = settings?.phoneHref ?? site.phoneHref;
  const cities = settings?.cities ?? site.cities;

  const [displayText, setDisplayText] = useState("");
  const [currentVerbIndex, setCurrentVerbIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);


  useEffect(() => {
    const verbs = ["Cleaned", "Watched", "Managed", "Looked after"];
    const currentVerb = verbs[currentVerbIndex];

    const tick = () => {
      if (!isDeleting) {
        if (displayText === currentVerb) {
          setIsDeleting(true);
        } else {
          setDisplayText(currentVerb.substring(0, displayText.length + 1));
        }
      } else {
        if (displayText === "") {
          setIsDeleting(false);
          setCurrentVerbIndex((prev) => (prev + 1) % verbs.length);
        } else {
          setDisplayText(currentVerb.substring(0, displayText.length - 1));
        }
      }
    };

    // Determine speed based on status
    let speed = 100;
    if (isDeleting) {
      speed = 55;
    } else if (displayText === currentVerb) {
      speed = 2200; // pause when fully typed
    } else if (displayText === "") {
      speed = 250; // pause before typing next word
    }

    const timer = setTimeout(tick, speed);
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, currentVerbIndex]);

  const timelineRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!timelineRef.current) return;
      const rect = timelineRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Calculate scroll progress through the timeline
      const startOffset = viewportHeight * 0.75;
      const endOffset = viewportHeight * 0.25;
      
      const totalHeight = rect.height;
      const currentScroll = startOffset - rect.top;
      const progress = Math.min(Math.max(currentScroll / (totalHeight - (startOffset - endOffset)), 0), 1);
      
      setScrollProgress(progress);

      // Determine which step number is currently active
      const steps = timelineRef.current.querySelectorAll(".timeline-step");
      let activeIdx = 0;
      steps.forEach((step, idx) => {
        const stepRect = step.getBoundingClientRect();
        if (stepRect.top < viewportHeight * 0.65) {
          activeIdx = idx + 1;
        }
      });
      setActiveStep(activeIdx);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <>
      {/* HERO */}
      <section className="relative bg-white overflow-hidden">
        {/* Ambient blue glow for desktop */}
        <div className="ambient-blue absolute -top-24 left-1/2 -translate-x-1/2 h-[520px] w-[720px] hidden md:block" />

        {/* Hero Text Content (occupies full screen on mobile, normal flow on desktop) */}
        <div className="relative z-10 px-5 text-center flex flex-col justify-center items-center h-[calc(100dvh-3rem)] min-h-[480px] md:h-auto md:min-h-0 md:block md:max-w-6xl md:mx-auto md:pt-24 md:pb-0">
          <h1 className="h-display text-[40px] md:text-[80px] max-w-4xl mx-auto rise-in">
            Your Florida home.
            <br />
            <span className="text-accent">{displayText || "\u00A0"}</span> by one person.
            <span className="inline-block w-[3px] md:w-[6px] h-[0.8em] bg-accent ml-1 align-middle cursor-blink" />
          </h1>
          <p className="mt-5 md:mt-6 text-[19px] md:text-[24px] text-muted-foreground max-w-xl mx-auto tracking-tight rise-in [animation-delay:150ms]">
            Cleaning, vacation turnovers, home management and home watch across
            Southwest Florida.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-4 rise-in [animation-delay:300ms]">
            <Link to="/contact" className="btn-pill btn-primary">
              Get a quote
            </Link>
            <Link to="/pricing" className="link-arrow">
              See pricing
            </Link>
          </div>
          
          {/* Scroll down indicator for mobile, floating above the sticky bar */}
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 md:hidden animate-bounce z-20 pointer-events-none opacity-50">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Scroll</span>
            <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>

        {/* Hero Image and Trust indicators (appears below the fold on mobile, and below text on desktop) */}
        <div className="relative z-10 mx-auto max-w-5xl px-5 pb-16 md:pb-24">
          <div className="rounded-[28px] overflow-hidden aspect-[4/3] md:aspect-[16/9]">
            <img
              src={heroImg}
              alt="Bright, sunlit Florida living room with folded linen and open windows"
              width={1600}
              height={1200}
              className="h-full w-full object-cover"
            />
          </div>
          <p className="mt-6 text-[13px] text-muted-foreground text-center">
            {site.trust.join(" · ")}
          </p>
        </div>
      </section>

      {/* SERVICES */}
      <Section tone="grey">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="h-display text-[34px] md:text-[56px]">
            Four ways I can help.
          </h2>
          <p className="mt-4 text-[19px] md:text-[21px] text-muted-foreground">
            Pick one, or combine — most clients do.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {servicesForUi.map((s) => (
            <ServiceCard key={s.id} s={s} />
          ))}
        </div>
      </Section>

      {/* HOME WATCH FEATURE */}
      <Section tone="white" id="home-watch">
        <ScrollReveal className="text-center max-w-2xl mx-auto">
          <span className="text-[12px] font-semibold uppercase tracking-wider text-accent bg-accent/10 px-3.5 py-1.5 rounded-full inline-block">
            Home Watch Process
          </span>
          <h2 className="h-display text-[34px] md:text-[56px] mt-5">
            Peace of mind while you're away.
          </h2>
          <p className="mt-4 text-[17px] md:text-[19px] text-muted-foreground leading-relaxed">
            Home watch is a slow, careful check-in on a vacant home. I look for
            the quiet problems — humidity, leaks, pests, storm damage — before
            they become expensive ones. Every visit ends with a photo report by
            email.
          </p>
        </ScrollReveal>
        
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {(() => {
            const icons = [Eye, Search, Droplet, FileText];
            return howVisitWorks.map((step, i) => {
              const Icon = icons[i] || Search;
              return (
                <ScrollReveal key={step.step} delay={i * 100} className="h-full">
                  <div className="relative group bg-white rounded-[24px] border border-hairline/60 p-6 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 h-full min-h-[240px]">
                    {/* Huge background number */}
                    <span className="absolute -right-2 -top-4 text-[96px] font-bold text-foreground/[0.02] select-none pointer-events-none group-hover:text-accent/[0.04] transition-colors duration-300">
                      {step.step}
                    </span>
                    
                    <div className="flex flex-col h-full justify-between">
                      <div>
                        {/* Icon wrapper */}
                        <div className="w-12 h-12 rounded-full bg-accent/5 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all duration-300 mb-5">
                          <Icon size={22} strokeWidth={1.75} className="group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        
                        <span className="text-[11px] font-semibold text-accent/80 tracking-wider uppercase block mb-1">
                          Step {step.step}
                        </span>
                        <h3 className="text-[20px] font-bold tracking-tight text-foreground group-hover:text-accent transition-colors duration-300 leading-tight">
                          {step.title}
                        </h3>
                      </div>
                      <p className="mt-3 text-[14px] text-muted-foreground leading-relaxed">
                        {step.body}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              );
            });
          })()}
        </div>
      </Section>

      {/* PRICING PREVIEW */}
      <Section tone="grey" id="pricing-preview">
        <ScrollReveal className="text-center max-w-2xl mx-auto">
          <span className="text-[12px] font-semibold uppercase tracking-wider text-accent bg-accent/10 px-3.5 py-1.5 rounded-full inline-block">
            Pricing Preview
          </span>
          <h2 className="h-display text-[34px] md:text-[56px] mt-5">
            Simple starting prices.
          </h2>
          <p className="mt-4 text-[17px] md:text-[19px] text-muted-foreground">
            Your final quote comes after a short call or walkthrough.
          </p>
        </ScrollReveal>
        
        <div className="mt-12 max-w-3xl mx-auto flex flex-col gap-4">
          {pricingCardsForUi.map((c, i) => (
            <ScrollReveal key={c.id} delay={i * 80}>
              <Link
                to="/pricing"
                className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-white rounded-[24px] border border-hairline/60 hover:shadow-lg hover:border-accent/40 hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer gap-4"
              >
                <div className="flex-1">
                  <span className="text-[19px] font-bold tracking-tight text-foreground group-hover:text-accent transition-colors duration-300 block">
                    {c.name}
                  </span>
                  <span className="text-[14px] text-muted-foreground mt-1 block max-w-xl leading-relaxed">
                    {c.note}
                  </span>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t border-hairline/30 sm:border-0 gap-4 shrink-0">
                  <div className="text-left sm:text-right flex items-baseline">
                    <span className="text-[24px] font-bold text-foreground group-hover:text-accent transition-colors duration-300">
                      {c.from}
                    </span>
                    <span className="text-[14px] text-muted-foreground ml-1.5">
                      {c.unit}
                    </span>
                  </div>
                  <ArrowRight size={18} className="text-accent ml-2 transform group-hover:translate-x-1.5 transition-transform duration-300 hidden sm:block" />
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
        
        <ScrollReveal className="mt-12 text-center" delay={300}>
          <Link to="/pricing" className="btn-pill btn-primary">
            See full pricing details
          </Link>
        </ScrollReveal>
      </Section>

      {/* WHY ME */}
      <Section tone="white" id="why-me">
        <div ref={timelineRef} className="flex flex-col md:flex-row gap-12 md:gap-24 relative">
          {/* Left Column: Heading (sticky on desktop) */}
          <div className="md:w-1/3 md:sticky md:top-24 self-start">
            <ScrollReveal>
              <span className="text-[12px] font-semibold uppercase tracking-wider text-accent bg-accent/10 px-3.5 py-1.5 rounded-full inline-block">
                Our Philosophy
              </span>
              <h2 className="h-display text-[34px] md:text-[56px] mt-4 leading-tight">
                Why work with me.
              </h2>
              <p className="mt-4 text-[16px] text-muted-foreground leading-relaxed">
                I started Coastal Care because I believe homeowners deserve a single, trusted point of contact who takes pride in every detail.
              </p>
            </ScrollReveal>
          </div>

          {/* Right Column: Scroll-Animated Timeline */}
          <div className="md:w-2/3 relative">
            {/* Background Grey Line */}
            <div className="absolute left-[20px] md:left-[24px] top-6 bottom-6 w-[3px] bg-muted/20 rounded-full" />
            
            {/* Active Blue Line (drawn on scroll) */}
            <div 
              className="absolute left-[20px] md:left-[24px] top-6 w-[3px] bg-accent rounded-full transition-all duration-300 ease-out origin-top"
              style={{ height: `${scrollProgress * 100}%`, maxHeight: 'calc(100% - 48px)' }}
            />

            <div className="flex flex-col gap-12 md:gap-16">
              {whyMe.map((w, idx) => {
                const stepNumber = idx + 1;
                const isActive = stepNumber <= activeStep;
                return (
                  <div 
                    key={w.n} 
                    className="timeline-step relative pl-12 md:pl-16 transition-all duration-500"
                    style={{
                      opacity: isActive ? 1 : 0.3,
                      transform: isActive ? 'translateX(0)' : 'translateX(12px)'
                    }}
                  >
                    {/* Timeline Indicator (Number) */}
                    <div 
                      className={`absolute left-[21.5px] md:left-[25.5px] top-0.5 -translate-x-1/2 w-[28px] h-[28px] md:w-[36px] md:h-[36px] rounded-full border-2 flex items-center justify-center font-bold text-[12px] md:text-[14px] transition-all duration-300 z-10
                        ${isActive 
                          ? 'bg-accent border-accent text-white scale-110 shadow-md shadow-accent/20' 
                          : 'bg-white border-muted-foreground/30 text-muted-foreground/50'
                        }`}
                    >
                      {w.n}
                    </div>

                    {/* Text content */}
                    <div>
                      <h3 
                        className={`text-[20px] md:text-[24px] font-bold tracking-tight transition-colors duration-300
                          ${isActive ? 'text-accent' : 'text-foreground'}`}
                      >
                        {w.title}
                      </h3>
                      <p className="mt-2.5 text-[15px] md:text-[17px] text-muted-foreground leading-relaxed max-w-xl">
                        {w.body}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Section>

      {/* AREAS */}
      <Section tone="grey">
        <div className="max-w-2xl">
          <h2 className="h-display text-[30px] md:text-[44px]">
            Serving Southwest Florida.
          </h2>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          {cities.map((c) => (
            <span key={c} className="pill-chip">
              {c}
            </span>
          ))}
          <span className="pill-chip !text-muted-foreground">
            Not on the list? Just ask.
          </span>
        </div>
      </Section>

      {/* QUOTES */}
      <Section tone="white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
          {testimonials.map((q) => (
            <figure key={q.id || q.who}>
              <blockquote className="text-[24px] md:text-[28px] font-medium tracking-tight text-foreground leading-snug">
                “{q.text}”
              </blockquote>
              <figcaption className="mt-4 text-[15px] text-muted-foreground">
                — {q.who}
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      {/* CLOSING CTA */}
      <Section tone="grey">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="h-display text-[36px] md:text-[64px]">
            Ready to talk?
          </h2>
          <p className="mt-4 text-[19px] text-muted-foreground">
            A short call is the fastest way to a real quote.
          </p>
          <div className="mt-8">
            <Link to="/contact" className="btn-pill btn-primary">
              Get a quote
            </Link>
          </div>
          <a
            href={phoneHref}
            className="mt-4 block text-[15px] text-muted-foreground"
          >
            or call {phone}
          </a>
        </div>
      </Section>
    </>
  );
}
