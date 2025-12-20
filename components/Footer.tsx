import Link from "next/link";
import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Youtube,
} from "lucide-react";

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterProps {
  companyName?: string;
  description?: string;
  quickLinks?: FooterLink[];
  addressLines?: string[];
  phone?: string;
  email?: string;
  socialLinks?: FooterLink[];
}

const sanitizePhoneHref = (phone: string) => phone.replace(/[^+\d]/g, "");

const Footer = ({
  companyName = "Rehmat Graphics Printing Services Pvt. Ltd.",
  description = "Professional trade printing solutions for agencies, print brokers, and creative studios across India.",
  quickLinks = [
    { label: "Login", href: "#login" },
    { label: "New Registration", href: "#register" },
    { label: "Price List", href: "#pricing" },
    { label: "Downloads", href: "#downloads" },
    { label: "Video Tutorials", href: "#videos" },
  ],
  addressLines = [
    "Flat No. 302, Rehmat Graphics Building,",
    "MG Road, Near Central Mall,",
    "Ahmedabad, Gujarat - 380009, India",
  ],
  phone = "+91 98989 98989",
  email = "support@rehmatgraphics.com",
  socialLinks = [
    { label: "Facebook", href: "https://facebook.com" },
    { label: "Instagram", href: "https://instagram.com" },
    { label: "YouTube", href: "https://youtube.com" },
  ],
}: FooterProps) => {
  const phoneHref = `tel:${sanitizePhoneHref(phone)}`;
  const emailHref = `mailto:${email}`;
  const year = new Date().getFullYear();

  return (
    <footer
      className="relative overflow-hidden bg-amber-900 text-amber-100"
      id="contact"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-transparent to-amber-400/10" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white">{companyName}</h4>
          <p className="text-sm text-slate-300">{description}</p>
          <div className="flex items-start gap-3 text-sm text-slate-300">
            <MapPin
              className="mt-0.5 h-4 w-4 flex-none text-brand-accent"
              aria-hidden
            />
            <div>
              {addressLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h5 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-300">
            Quick Links
          </h5>
          <ul className="mt-4 space-y-2 text-sm">
            {quickLinks.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="transition duration-200 hover:text-amber-400 text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3 text-sm">
          <h5 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-300">
            Contact
          </h5>
          <Link
            href={phoneHref}
            className="flex items-center gap-2 text-amber-200 transition duration-200 hover:text-amber-400"
          >
            <Phone className="h-4 w-4" aria-hidden />
            {phone}
          </Link>
          <Link
            href={emailHref}
            className="flex items-center gap-2 text-amber-200 transition duration-200 hover:text-amber-400"
          >
            <Mail className="h-4 w-4" aria-hidden />
            {email}
          </Link>
        </div>

        <div className="space-y-4">
          <h5 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-300">
            Follow Us
          </h5>
          <div className="flex items-center gap-3">
            {socialLinks.map((link) => {
              const Icon =
                link.label === "Facebook"
                  ? Facebook
                  : link.label === "Instagram"
                    ? Instagram
                    : Youtube;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  aria-label={link.label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-amber-100 transition duration-200 hover:border-amber-400/70 hover:text-amber-400"
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-white sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {companyName}. All rights reserved.
          </p>
          <p>
            Crafted with precision for professional print partners.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
