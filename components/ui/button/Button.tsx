import { ReactNode } from "react";
import { CircleCheck, Clock, Info, TriangleAlert } from "lucide-react";

type ButtonSize = "sm" | "md" | "lg";
type ButtonVariant =
  | "primary"
  | "outline"
  | "primaryHoverOutline"
  | "primarySoft"
  | "primaryOutline"
  | "success"
  | "successOutline"
  | "successSoft"
  | "error"
  | "errorOutline"
  | "errorSoft"
  | "warning"
  | "warningOutline"
  | "warningSoft"
  | "orange"
  | "orangeOutline"
  | "orangeSoft";

interface ButtonProps {
  children?: ReactNode; // Button text or custom content
  size?: ButtonSize; // Button size
  variant?: ButtonVariant; // Button variant
  startIcon?: ReactNode; // Icon before the text
  endIcon?: ReactNode; // Icon after the text
  icon?: ReactNode; // Icon for icon-only buttons
  iconOnly?: boolean; // Render without text label
  tooltip?: string; // Optional tooltip message
  ariaLabel?: string; // Accessible label override
  onClick?: () => void; // Click handler
  disabled?: boolean; // Disabled state
  className?: string; // Custom class names
  type?: "button" | "submit" | "reset"; // Button type for forms
  useVariantIcon?: boolean; // Automatically inject icon based on variant
  variantIconPosition?: "start" | "end"; // Placement for auto variant icon
}

const Button = ({
  children,
  size = "md",
  variant = "primary",
  startIcon,
  endIcon,
  icon,
  iconOnly = false,
  tooltip,
  ariaLabel,
  onClick,
  className = "",
  disabled = false,
  type = "button",
  useVariantIcon = false,
  variantIconPosition = "start",
}: ButtonProps) => {
  const sizeClasses: Record<ButtonSize, string> = {
    sm: "px-3 py-[9px] text-sm",
    md: "px-5 py-3.5 !text-sm",
    lg: "px-6 py-4 !text-[20px]",
  };

  const iconOnlySizeClasses: Record<ButtonSize, string> = {
    sm: "h-9 w-9 text-base",
    md: "h-11 w-11 text-lg",
    lg: "h-12 w-12 text-xl",
  };

  const variantClasses: Record<ButtonVariant, string> = {
    primary:
      "bg-brand-500 !text-white shadow-theme-xs enabled:hover:bg-brand-600 disabled:bg-brand-300",
    outline:
      "bg-white !text-gray-700 border border-gray-300 enabled:hover:bg-gray-50 dark:bg-gray-800 dark:!text-gray-400 dark:border-gray-700 dark:enabled:hover:bg-white/[0.03] dark:enabled:hover:!text-gray-300",
    primarySoft:
      "bg-brand-50 text-brand-600 border border-brand-100 enabled:hover:bg-brand-100 dark:bg-brand-500/15 dark:text-brand-200 dark:border-brand-500/20 disabled:bg-brand-100 disabled:text-brand-300",
    primaryOutline:
      "bg-transparent ring-0! !text-brand-500 border border-brand-500 enabled:hover:bg-transparent enabled:hover:!text-brand-500 disabled:text-brand-300 disabled:ring-brand-200",
    primaryHoverOutline:
      "bg-brand-500 !text-white shadow-theme-xs enabled:hover:bg-transparent enabled:hover:!text-brand-500 border border-brand-500 disabled:bg-brand-300 disabled:text-white/70",
    success:
      "bg-success-500 !text-white shadow-theme-xs enabled:hover:bg-success-600 disabled:bg-success-300",
    successOutline:
      "bg-white text-success-600 border border-success-500 enabled:hover:bg-success-50 dark:bg-gray-900 dark:text-success-300 dark:border-success-500/60 dark:enabled:hover:bg-success-500/10 disabled:border-success-200 disabled:text-success-300",
    successSoft:
      "bg-success-50 text-success-600 border border-success-100 enabled:hover:bg-success-100 dark:bg-success-500/15 dark:text-success-300 dark:border-success-500/20 disabled:bg-success-100 disabled:text-success-300",
    error:
      "bg-error-500 !text-white shadow-theme-xs enabled:hover:bg-error-600 disabled:bg-error-300",
    errorOutline:
      "bg-white text-error-600 border border-error-500 enabled:hover:bg-error-50 dark:bg-gray-900 dark:text-error-300 dark:border-error-500/60 dark:enabled:hover:bg-error-500/10 disabled:border-error-200 disabled:text-error-300",
    errorSoft:
      "bg-error-50 text-error-600 border border-error-100 enabled:hover:bg-error-100 dark:bg-error-500/15 dark:text-error-300 dark:border-error-500/20 disabled:bg-error-100 disabled:text-error-300",
    warning:
      "bg-warning-500 !text-white shadow-theme-xs enabled:hover:bg-warning-600 disabled:bg-warning-300",
    warningOutline:
      "bg-white text-warning-600 border border-warning-500 enabled:hover:bg-warning-50 dark:bg-gray-900 dark:text-warning-300 dark:border-warning-500/60 dark:enabled:hover:bg-warning-500/10 disabled:border-warning-200 disabled:text-warning-300",
    warningSoft:
      "bg-warning-50 text-warning-600 border border-warning-100 enabled:hover:bg-warning-100 dark:bg-warning-500/15 dark:text-warning-300 dark:border-warning-500/20 disabled:bg-warning-100 disabled:text-warning-300",
    orange:
      "bg-orange-500 !text-white shadow-theme-xs enabled:hover:bg-orange-600 disabled:bg-orange-300",
    orangeOutline:
      "bg-white text-orange-600 border border-orange-500 enabled:hover:bg-orange-50 dark:bg-gray-900 dark:text-orange-300 dark:border-orange-500/60 dark:enabled:hover:bg-orange-500/10 disabled:border-orange-200 disabled:text-orange-300",
    orangeSoft:
      "bg-orange-50 text-orange-600 border border-orange-100 enabled:hover:bg-orange-100 dark:bg-orange-500/15 dark:text-orange-300 dark:border-orange-500/20 disabled:bg-orange-100 disabled:text-orange-300",
  };

  const variantIconMap: Partial<Record<ButtonVariant, ReactNode>> = {
    success: <CircleCheck className="size-5" />,
    successOutline: <CircleCheck className="size-5" />,
    successSoft: <CircleCheck className="size-5" />,
    error: <Info className="size-5" />,
    errorOutline: <Info className="size-5" />,
    errorSoft: <Info className="size-5" />,
    warning: <TriangleAlert className="size-5" />,
    warningOutline: <TriangleAlert className="size-5" />,
    warningSoft: <TriangleAlert className="size-5" />,
    orange: <Clock className="size-5" />,
    orangeOutline: <Clock className="size-5" />,
    orangeSoft: <Clock className="size-5" />,
  };

  const variantIconNode = useVariantIcon ? variantIconMap[variant] : undefined;

  const computedStartIcon =
    startIcon ??
    (!iconOnly && variantIconNode && variantIconPosition !== "end"
      ? variantIconNode
      : undefined);

  const computedEndIcon =
    endIcon ??
    (!iconOnly && variantIconNode && variantIconPosition === "end"
      ? variantIconNode
      : undefined);

  const computedIcon =
    icon ??
    ((iconOnly || (!children && !startIcon && !endIcon)) && variantIconNode
      ? variantIconNode
      : undefined);

  const resolvedIconOnly =
    iconOnly ||
    (!children && (computedIcon || computedStartIcon || computedEndIcon));

  const variantLabelFallback = variant
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
  const buttonClasses = [
    "inline-flex items-center justify-center rounded-lg transition ring-0!",
    resolvedIconOnly ? iconOnlySizeClasses[size] : sizeClasses[size],
    resolvedIconOnly ? "" : "gap-2",
    variantClasses[variant],
    disabled ? "cursor-not-allowed opacity-50" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const accessibleLabel = resolvedIconOnly
    ? ariaLabel ||
      tooltip ||
      (typeof children === "string" ? children : undefined) ||
      variantLabelFallback
    : ariaLabel;

  const getButton = () => {
    return (
      <button
        type={type}
        className={buttonClasses}
        onClick={onClick}
        disabled={disabled}
        title={tooltip}
        aria-label={accessibleLabel}
      >
        {resolvedIconOnly ? (
          <span className="flex items-center justify-center">
            {computedIcon || computedStartIcon || computedEndIcon || children}
          </span>
        ) : (
          <>
            {computedStartIcon && (
              <span className="flex items-center">{computedStartIcon}</span>
            )}
            {children}
            {computedEndIcon && (
              <span className="flex items-center">{computedEndIcon}</span>
            )}
          </>
        )}
      </button>
    );
  };

  return getButton();
};

export default Button;
