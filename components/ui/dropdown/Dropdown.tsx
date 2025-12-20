import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface DropdownProps {
  isOpen: boolean;
  onClose: () => void;
  anchorEl: HTMLElement | null;
  children: React.ReactNode;
  className?: string;
  align?: "start" | "end";
  offset?: number;
  preventHideOnScroll?: boolean; // ⭐ NEW PROP
}

const VIEWPORT_PADDING = 16;

export const Dropdown: React.FC<DropdownProps> = ({
  isOpen,
  onClose,
  anchorEl,
  children,
  className = "",
  align = "start",
  offset = 8,
  preventHideOnScroll = false, // ⭐ default: false (hide on scroll)
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const container = useRef(document.createElement("div"));
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  // Mount portal container
  useEffect(() => {
    const mountNode = container.current;
    document.body.appendChild(mountNode);
    return () => {
      document.body.removeChild(mountNode);
    };
  }, []);

  // Positioning logic + scroll handling
  useEffect(() => {
    if (!isOpen || !anchorEl) return;

    const updatePosition = () => {
      if (!dropdownRef.current || !anchorEl) return;

      const rect = anchorEl.getBoundingClientRect();
      const dropdownHeight = dropdownRef.current.offsetHeight;
      const dropdownWidth = dropdownRef.current.offsetWidth;

      const spaceBelow = window.innerHeight - rect.bottom;
      const placeAbove = spaceBelow < dropdownHeight + offset;

      let top = placeAbove
        ? rect.top - dropdownHeight - offset
        : rect.bottom + offset;

      let left = rect.left;

      if (align === "end") {
        left = rect.right - dropdownWidth;
      }

      // clamp within viewport
      left = Math.min(
        Math.max(left, VIEWPORT_PADDING),
        window.innerWidth - dropdownWidth - VIEWPORT_PADDING
      );

      top = Math.min(
        Math.max(top, VIEWPORT_PADDING),
        window.innerHeight - dropdownHeight - VIEWPORT_PADDING
      );

      setCoords({ top, left });
    };

    updatePosition();

    // ⭐ Scroll behavior
    const handleScroll = () => {
      if (!preventHideOnScroll) {
        onClose(); // hide dropdown
      } else {
        updatePosition(); // reposition instead of hiding
      }
    };

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen, anchorEl, align, offset, preventHideOnScroll, onClose]);

  // Click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        anchorEl &&
        !anchorEl.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [anchorEl, onClose]);

  if (!isOpen || !anchorEl) return null;

  return createPortal(
    <div
      ref={dropdownRef}
      className={`fixed z-50 rounded-xl border border-gray-200 bg-white dark:bg-gray-800 shadow-lg ${className}`}
      style={{
        top: coords.top,
        left: coords.left,
        position: "fixed",
      }}
    >
      {children}
    </div>,
    container.current
  );
};
