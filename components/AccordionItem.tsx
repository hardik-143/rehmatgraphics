"use client";

import { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { useAccordion } from "@/components/Accordion";

export interface AccordionItemProps {
  id: string;
  title: string;
  children: ReactNode;
}

const AccordionItem = ({ id, title, children }: AccordionItemProps) => {
  const { activeItem, toggleItem } = useAccordion();
  const isOpen = activeItem === id;

  return (
    <div className="py-4">
      <button
        type="button"
        onClick={() => toggleItem(id)}
        className="flex w-full items-center justify-between gap-4 text-left"
        aria-expanded={isOpen}
        aria-controls={`${id}-content`}
      >
        <span className="text-base font-semibold text-slate-900">{title}</span>
        <ChevronDown
          className={`h-5 w-5 text-slate-500 transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`}
          aria-hidden
        />
      </button>
      <div
        id={`${id}-content`}
        className={`overflow-hidden transition-all duration-300 ease-out ${isOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="pt-3 text-sm text-slate-600">{children}</div>
      </div>
    </div>
  );
};

export default AccordionItem;
