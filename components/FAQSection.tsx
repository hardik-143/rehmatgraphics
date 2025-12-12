import Accordion from "@/components/Accordion";
import AccordionItem from "@/components/AccordionItem";

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface FAQSectionProps {
  title?: string;
  description?: string;
  items?: FAQItem[];
}

const defaultFaqs: FAQItem[] = [
  {
    id: "order-online",
    question: "How Do I Order Online?",
    answer:
      "Login to your agent dashboard, select the product, choose print specs, upload artwork, and confirm checkout. Our prepress team will verify files before production.",
  },
  {
    id: "agent-access",
    question: "Only registered agents can order online with MMamaji.",
    answer:
      "Mamaji operates strictly as a trade printer. To protect reseller relationships, only verified partners with approved accounts can access pricing and ordering tools.",
  },
  {
    id: "register-agent",
    question: "How to Register as an Agent?",
    answer:
      "Complete the registration form with business credentials, GST/Tax IDs, and portfolio samples. Our onboarding team approves new agents within 24 business hours.",
  },
  {
    id: "file-types",
    question: "What type of files to upload?",
    answer:
      "Supply print-ready PDFs with vector artwork and embedded fonts. High-resolution TIFF or PNG files (300 DPI) are also accepted for raster-heavy designs.",
  },
  {
    id: "file-size",
    question: "Max file size?",
    answer:
      "You can upload up to 1.5 GB per artwork. For larger assets, share a secure download link via Google Drive, Dropbox, or WeTransfer inside the job notes.",
  },
];

const FAQSection = ({
  title = "Frequently Asked Questions",
  description = "Your success is our priority—here are the answers we share with every new partner.",
  items = defaultFaqs,
}: FAQSectionProps) => {
  return (
    <div className="flex flex-col gap-6 overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg sm:p-8 lg:p-10">
      <Accordion
        defaultId={items[0]?.id}
        heading={
          <div>
            <h3 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              {title}
            </h3>
            <p className="mt-3 text-base text-slate-600 sm:text-lg">
              {description}
            </p>
          </div>
        }
        className="divide-y divide-slate-200"
      >
        {items.map((item) => (
          <AccordionItem key={item.id} id={item.id} title={item.question}>
            {item.answer}
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default FAQSection;
