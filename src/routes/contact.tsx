import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Section } from "@/components/site/Section";
import { site, services } from "@/content/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Coastal Care Home Services" },
      {
        name: "description",
        content:
          "Get in touch with Maria Reyes at Coastal Care Home Services. Call, email, or send a message for a quote.",
      },
      { property: "og:title", content: "Contact — Coastal Care" },
      {
        property: "og:description",
        content: "Reach Maria at Coastal Care for a quote — call, email, or form.",
      },
    ],
  }),
  component: ContactPage,
});

const propertySizes = [
  "Under 1,500 sq ft",
  "1,500 – 2,500 sq ft",
  "2,500 – 4,000 sq ft",
  "Over 4,000 sq ft",
];

const contactMethods = ["Text", "Call", "Email"] as const;

function ContactPage() {
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [method, setMethod] = useState<(typeof contactMethods)[number]>("Text");

  const inputBase =
    "block w-full min-h-[52px] rounded-[12px] bg-[color:var(--surface)] border-0 px-4 text-[17px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]";

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const next: Record<string, string> = {};
    if (!fd.get("name")) next.name = "Please add your name.";
    const email = String(fd.get("email") ?? "");
    if (!email || !/.+@.+\..+/.test(email)) next.email = "Enter a valid email.";
    if (!fd.get("phone")) next.phone = "Please add a phone number.";
    if (!fd.get("city")) next.city = "Pick a city.";
    if (!fd.get("service")) next.service = "Pick a service.";
    setErrors(next);
    if (Object.keys(next).length === 0) {
      console.log("Contact form:", Object.fromEntries(fd.entries()), { method });
      setSent(true);
      e.currentTarget.reset();
    }
  }

  return (
    <Section tone="white">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="h-display text-[38px] md:text-[64px]">Get in touch.</h1>
        <p className="mt-5 text-[19px] text-muted-foreground">
          A short message is enough to start. I'll follow up personally.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-12">
        <div>
          {sent ? (
            <div className="rounded-[20px] border p-8 bg-white">
              <h2 className="h-display text-[24px]">Message received.</h2>
              <p className="mt-3 text-muted-foreground text-[16px]">
                Thanks — I'll get back to you within one business day.
              </p>
              <button
                onClick={() => setSent(false)}
                className="mt-6 btn-pill btn-secondary"
              >
                Send another
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="space-y-4">
              <Field label="Name" error={errors.name}>
                <input name="name" className={inputBase} autoComplete="name" />
              </Field>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Email" error={errors.email}>
                  <input
                    name="email"
                    type="email"
                    className={inputBase}
                    autoComplete="email"
                  />
                </Field>
                <Field label="Phone" error={errors.phone}>
                  <input
                    name="phone"
                    type="tel"
                    className={inputBase}
                    autoComplete="tel"
                  />
                </Field>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="City" error={errors.city}>
                  <select name="city" className={inputBase} defaultValue="">
                    <option value="" disabled>
                      Choose a city
                    </option>
                    {site.cities.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Service" error={errors.service}>
                  <select name="service" className={inputBase} defaultValue="">
                    <option value="" disabled>
                      Choose a service
                    </option>
                    {services.map((s) => (
                      <option key={s.id}>{s.name}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Property size">
                <select name="size" className={inputBase} defaultValue="">
                  <option value="" disabled>
                    Select size
                  </option>
                  {propertySizes.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
              <Field label="Message">
                <textarea
                  name="message"
                  rows={5}
                  className={`${inputBase} !min-h-[140px] py-3`}
                />
              </Field>

              <div>
                <p className="text-[13px] font-medium uppercase tracking-wider text-muted-foreground mb-3">
                  Preferred contact
                </p>
                <div className="flex flex-wrap gap-2" role="radiogroup">
                  {contactMethods.map((m) => {
                    const active = method === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setMethod(m)}
                        className={`h-12 px-6 rounded-full text-[15px] font-medium border transition-colors ${
                          active
                            ? "bg-accent text-white border-transparent"
                            : "bg-white text-foreground"
                        }`}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" className="btn-pill btn-primary w-full md:w-auto">
                  Send message
                </button>
              </div>
            </form>
          )}
        </div>

        <aside className="md:sticky md:top-24 md:self-start space-y-6">
          <div>
            <p className="text-[13px] uppercase tracking-wider text-muted-foreground font-medium">
              Call or text
            </p>
            <a
              href={site.phoneHref}
              className="mt-1 block text-[28px] font-semibold tracking-tight text-accent"
            >
              {site.phone}
            </a>
          </div>
          <div>
            <p className="text-[13px] uppercase tracking-wider text-muted-foreground font-medium">
              Email
            </p>
            <a
              href={`mailto:${site.email}`}
              className="mt-1 block text-[19px] font-medium text-foreground"
            >
              {site.email}
            </a>
          </div>
          <div>
            <p className="text-[13px] uppercase tracking-wider text-muted-foreground font-medium">
              Hours
            </p>
            <p className="mt-1 text-[17px]">{site.hours}</p>
          </div>
          <p className="text-[14px] text-muted-foreground max-w-xs">
            Most messages get a response within one business day. If it's
            urgent, please call.
          </p>
        </aside>
      </div>
    </Section>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[13px] font-medium text-muted-foreground mb-2">
        {label}
      </span>
      {children}
      {error && (
        <span className="mt-1.5 block text-[13px] text-[color:var(--color-destructive)]">
          {error}
        </span>
      )}
    </label>
  );
}
