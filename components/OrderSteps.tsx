import Link from "next/link";

export interface StepItem {
  title: string;
  description?: string;
  href?: string;
}

export interface OrderStepsProps {
  heading?: string;
  subheading?: string;
  steps?: StepItem[];
}

const defaultSteps: StepItem[] = [
  {
    title: "Select Printing Option",
    description: "Choose from offset, digital, or specialty finishes.",
    href: "#order",
  },
  {
    title: "Upload Your File",
    description: "Submit ready-to-print artwork with a single click.",
    href: "#upload",
  },
  {
    title: "Checkout & Order",
    description: "Secure payments, transparent pricing, instant confirmations.",
    href: "#checkout",
  },
  {
    title: "Get Delivery",
    description: "Nationwide delivery with live tracking updates.",
    href: "#delivery",
  },
];

const cardGradients = [
  "from-brand-primary via-indigo-500 to-brand-secondary",
  "from-brand-secondary via-sky-500 to-brand-accent",
  "from-purple-500 via-indigo-500 to-brand-primary",
  "from-slate-900 via-slate-800 to-brand-primary",
];

const OrderSteps = ({
  heading = "Order Online with Rehmat Graphics",
  subheading = "A simplified workflow built for professional print resellers.",
  steps = defaultSteps,
}: OrderStepsProps) => {
  return (
    <section className="bg-brand-ash" id="order">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
        <div className="max-w-2xl text-center sm:mx-auto">
          <span className="inline-flex items-center justify-center rounded-full border border-slate-300/60 bg-white px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600">
            Seamless Flow
          </span>
          <h2 className="mt-4 text-3xl font-semibold text-slate-900 sm:text-4xl">
            {heading}
          </h2>
          <p className="mt-3 text-base text-slate-600 sm:text-lg">
            {subheading}
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const gradient = cardGradients[index % cardGradients.length];
            return (
              <Link
                key={step.title}
                href={step.href ?? "#"}
                className={`group relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br ${gradient} p-6 text-white shadow-lg shadow-brand-primary/20 transition duration-200 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80`}
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 transition duration-300 group-hover:opacity-100" />
                <div className="relative">
                  <span className="text-sm font-semibold uppercase tracking-wide text-white/80">
                    Step {index + 1}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
                  {step.description ? (
                    <p className="mt-2 text-sm text-white/90">
                      {step.description}
                    </p>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default OrderSteps;
