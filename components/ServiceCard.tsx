import { ReactNode } from "react";

export interface ServiceCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
}

const ServiceCard = ({ title, description, icon }: ServiceCardProps) => {
  return (
    <div className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-brand-primary/50 hover:shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-brand-secondary/10 opacity-0 transition duration-300 group-hover:opacity-100" />
      <div className="relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-ash text-brand-primary">
        {icon ?? (
          <span className="text-lg font-semibold">{title.charAt(0)}</span>
        )}
      </div>
      <div className="relative">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        {description ? (
          <p className="mt-2 text-sm text-slate-600">{description}</p>
        ) : null}
      </div>
    </div>
  );
};

export default ServiceCard;
