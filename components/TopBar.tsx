import Link from "next/link";
import { Clock4, Mail, Phone, UtensilsCrossed } from "lucide-react";

export interface TopBarProps {
  workingHours?: string;
  lunchBreak?: string;
  email?: string;
  phone?: string;
}

const sanitizePhoneHref = (phone: string) => phone.replace(/[^+\d]/g, "");

const TopBar = ({
  workingHours = "Mon - Sat: 9:00 AM - 8:00 PM",
  lunchBreak = "Lunch: 1:00 PM - 2:00 PM",
  email = "support@rehmatgraphics.com",
  phone = "+91 98765 43210",
}: TopBarProps) => {
  const phoneHref = `tel:${sanitizePhoneHref(phone)}`;
  const emailHref = `mailto:${email}`;

  return (
    <div className="bg-gradient-to-r from-brand-night via-slate-950 to-brand-night text-xs text-slate-200">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:text-[13px]">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-slate-300">
          <span className="flex items-center gap-2 font-medium text-slate-100/90">
            <Clock4 className="h-4 w-4" aria-hidden />
            {workingHours}
          </span>
          <span className="flex items-center gap-2 font-medium text-slate-100/90">
            <UtensilsCrossed className="h-4 w-4" aria-hidden />
            {lunchBreak}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link
            href={emailHref}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 font-semibold text-slate-100 transition hover:border-brand-accent/60 hover:text-white"
          >
            <Mail className="h-4 w-4" aria-hidden />
            {email}
          </Link>
          <Link
            href={phoneHref}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 font-semibold text-slate-100 transition hover:border-brand-accent/60 hover:text-white"
          >
            <Phone className="h-4 w-4" aria-hidden />
            {phone}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
