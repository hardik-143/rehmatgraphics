import ServiceCard from "@/components/ServiceCard";
import {
  Box,
  BookOpen,
  Calendar,
  Circle,
  File,
  FileText,
  FolderOpen,
  IdCard,
  Layers,
  Mail,
  Printer,
  ShoppingBag,
} from "lucide-react";

export interface ServicesGridProps {
  heading?: string;
  subheading?: string;
}

const services = [
  { title: "Visiting Card", icon: <IdCard className="h-6 w-6" aria-hidden /> },
  { title: "Letterhead", icon: <FileText className="h-6 w-6" aria-hidden /> },
  { title: "Envelope", icon: <Mail className="h-6 w-6" aria-hidden /> },
  { title: "Sticker", icon: <Circle className="h-6 w-6" aria-hidden /> },
  { title: "A4", icon: <File className="h-6 w-6" aria-hidden /> },
  { title: "Art Card", icon: <Layers className="h-6 w-6" aria-hidden /> },
  { title: "Paper Bag", icon: <ShoppingBag className="h-6 w-6" aria-hidden /> },
  {
    title: "Doctor File",
    icon: <FolderOpen className="h-6 w-6" aria-hidden />,
  },
  { title: "Calendar", icon: <Calendar className="h-6 w-6" aria-hidden /> },
  {
    title: "Book/Catalogue",
    icon: <BookOpen className="h-6 w-6" aria-hidden />,
  },
  { title: "Box/Packaging", icon: <Box className="h-6 w-6" aria-hidden /> },
  {
    title: "Mix Printing Job",
    icon: <Printer className="h-6 w-6" aria-hidden />,
  },
];

const ServicesGrid = ({
  heading = "Wide Range of Printing Services",
  subheading = "Outsource your entire production line to a single technology-enabled partner.",
}: ServicesGridProps) => {
  return (
    <section className="bg-white" id="services">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
        <div className="max-w-2xl text-center sm:mx-auto">
          <span className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600">
            Capabilities
          </span>
          <h2 className="mt-4 text-3xl font-semibold text-slate-900 sm:text-4xl">
            {heading}
          </h2>
          <p className="mt-3 text-base text-slate-600 sm:text-lg">
            {subheading}
          </p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
            Trusted by 800+ certified print partners
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard
              key={service.title}
              title={service.title}
              icon={service.icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesGrid;
