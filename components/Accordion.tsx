"use client";

import {
  createContext,
  PropsWithChildren,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";

interface AccordionContextValue {
  activeItem: string | null;
  toggleItem: (id: string) => void;
}

const AccordionContext = createContext<AccordionContextValue | undefined>(
  undefined
);

export interface AccordionProps extends PropsWithChildren {
  defaultId?: string | null;
  className?: string;
  heading?: ReactNode;
}

const Accordion = ({
  defaultId = null,
  className = "divide-y divide-slate-200",
  children,
  heading,
}: AccordionProps) => {
  const [activeItem, setActiveItem] = useState<string | null>(defaultId);

  const toggleItem = (id: string) => {
    setActiveItem((prev) => (prev === id ? null : id));
  };

  const value = useMemo(() => ({ activeItem, toggleItem }), [activeItem]);

  return (
    <div className="space-y-6">
      {heading}
      <AccordionContext.Provider value={value}>
        <div className={className}>{children}</div>
      </AccordionContext.Provider>
    </div>
  );
};

export const useAccordion = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error(
      "AccordionItem must be rendered within an Accordion instance."
    );
  }
  return context;
};

export default Accordion;
