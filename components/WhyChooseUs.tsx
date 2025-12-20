import { Award, ShieldCheck, Smile, Truck } from "lucide-react";

export interface WhyChooseUsProps {
  heading?: string;
  subheading?: string;
}

const features = [
  {
    title: "Quality Printing",
    description:
      "Color-accurate production, calibrated presses, and rigorous quality checks for every batch.",
    icon: <Award className="h-6 w-6" aria-hidden />,
  },
  {
    title: "Trusted & Secure",
    description:
      "Secure file handling, NDA-friendly workflows, and dedicated account managers.",
    icon: <ShieldCheck className="h-6 w-6" aria-hidden />,
  },
  {
    title: "100% Satisfaction",
    description:
      "Guaranteed reprints on print defects and proactive project updates.",
    icon: <Smile className="h-6 w-6" aria-hidden />,
  },
  {
    title: "Fast Delivery",
    description:
      "Express dispatch, white-label packaging, and real-time tracking nationwide.",
    icon: <Truck className="h-6 w-6" aria-hidden />,
  },
];

const WhyChooseUs = ({
  heading = "Why Choose Rehmat Graphics?",
  subheading = "Trade-only printing with enterprise reliability and boutique flexibility.",
}: WhyChooseUsProps) => {
  return (
    <section className="bg-brand-ash" id="about">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
        <div className="max-w-2xl text-center sm:mx-auto">
          <span className="inline-flex items-center justify-center rounded-full border border-slate-300/70 bg-white px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600">
            Why Us
          </span>
          <h2 className="mt-4 text-3xl font-semibold text-slate-900 sm:text-4xl">
            {heading}
          </h2>
          <p className="mt-3 text-base text-slate-600 sm:text-lg">
            {subheading}
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative flex flex-col gap-4 overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-brand-primary/50 hover:shadow-lg"
            >
              <div className="absolute inset-0 bg-linear-to-br from-brand-primary/5 via-transparent to-brand-secondary/10 opacity-0 transition duration-300 group-hover:opacity-100" />
              <div className="relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-brand-primary to-brand-secondary shadow-sm shadow-brand-primary/30">
                {feature.icon}
              </div>
              <div className="relative">
                <h3 className="text-lg font-semibold text-slate-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
