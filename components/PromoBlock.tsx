import Image from "next/image";

export interface PromoStat {
  label: string;
  value: string;
}

export interface PromoBlockProps {
  imageSrc?: string;
  altText?: string;
  badge?: string;
  title?: string;
  description?: string;
  stats?: PromoStat[];
}

const PromoBlock = ({
  imageSrc = "/images/promo-mockup.svg",
  altText = "Premium print mockups",
  badge = "Trade Exclusive",
  title = "Built for high-volume print partners",
  description = "From offset to digital, embellishments to packaging, Rehmat Graphics empowers print resellers with enterprise-grade infrastructure and hands-on support.",
  stats = [
    { label: "Certified Agents", value: "850+" },
    { label: "Daily Shipments", value: "4.5k" },
  ],
}: PromoBlockProps) => {
  return (
    <div className="flex flex-col gap-6 overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg sm:p-8 lg:p-10">
      <span className="w-fit rounded-full bg-slate-900 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-white">
        {badge}
      </span>
      <h3 className="text-2xl font-bold text-slate-900 sm:text-3xl">{title}</h3>
      <p className="text-base text-slate-600 sm:text-lg">{description}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4 text-center"
          >
            <p className="text-2xl font-semibold text-slate-900">
              {stat.value}
            </p>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
      <div className="relative mt-4 h-72 w-full overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-slate-100">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 via-transparent to-brand-secondary/20" />
        <Image
          src={imageSrc}
          alt={altText}
          fill
          sizes="(min-width: 1024px) 460px, 100vw"
          className="object-cover"
        />
      </div>
    </div>
  );
};

export default PromoBlock;
