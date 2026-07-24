import type { ReactNode } from "react";

export function Section({
  tone = "white",
  children,
  className = "",
  id,
}: {
  tone?: "white" | "grey";
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={`relative ${tone === "grey" ? "bg-[color:var(--surface)]" : "bg-white"} py-16 md:py-24 ${className}`}
    >
      <div className="relative mx-auto max-w-6xl px-5">{children}</div>
    </section>
  );
}
