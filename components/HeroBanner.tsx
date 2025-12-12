import Image from "next/image";
import Link from "next/link";

export interface HeroBannerProps {
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  collageImageSrc?: string;
  bannerImageSrc?: string;
}

const HeroBanner = ({
  title = "We Print for Printers",
  subtitle = "Partner with the printing experts behind your favorite brands. From speedy turnarounds to meticulous color consistency, we deliver every job with pride.",
  ctaLabel = "Order Now",
  ctaHref = "#order",
  collageImageSrc = "/images/printing-collage.svg",
  bannerImageSrc = "/images/hero-banner.svg",
}: HeroBannerProps) => {
  return (
    <section
      className="relative isolate overflow-hidden bg-brand-night text-slate-100"
      id="home"
    >
      <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-brand-primary/20 via-transparent to-transparent" />
      <div className="absolute -left-24 top-1/3 h-80 w-80 rounded-full bg-brand-secondary/30 blur-3xl" />
      <div className="absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-brand-primary/20 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 sm:py-24 lg:grid-cols-[0.85fr_1fr_0.9fr]">
        <div className="relative hidden h-[22rem] w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-card lg:block">
          <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-white/10" />
          <Image
            src={collageImageSrc}
            alt="Printed materials collage"
            fill
            sizes="(min-width: 1280px) 280px, (min-width: 1024px) 240px"
            className="object-cover"
            priority
          />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center lg:items-start lg:text-left">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-accent">
            Trade Print Network
          </span>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl xl:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-xl text-base text-slate-200/80 sm:text-lg">
            {subtitle}
          </p>
          <div className="mt-10 flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-start">
            <Link
              href={ctaHref}
              className="w-full rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary px-7 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-brand-primary/30 transition duration-200 hover:shadow-xl hover:shadow-brand-primary/40 sm:w-auto"
            >
              {ctaLabel}
            </Link>
            <Link
              href="tel:+919876543210"
              className="w-full rounded-full border border-white/20 px-7 py-3 text-center text-sm font-semibold text-slate-100 transition duration-200 hover:border-brand-accent/80 hover:text-white sm:w-auto"
            >
              Talk to Sales
            </Link>
          </div>
          <div className="mt-10 grid w-full gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
              <p className="text-2xl font-semibold text-white">18+</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-200/70">
                Years in print production
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
              <p className="text-2xl font-semibold text-white">1.5k</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-200/70">
                Trade orders processed daily
              </p>
            </div>
          </div>
        </div>

        <div className="relative h-80 w-full overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/10 shadow-card sm:h-96 lg:h-[28rem]">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/30 via-transparent to-brand-secondary/20" />
          <Image
            src={bannerImageSrc}
            alt="Digital press illustration"
            fill
            sizes="(min-width: 1280px) 320px, (min-width: 640px) 100vw, 100vw"
            className="object-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
