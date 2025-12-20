"use client";

import { useFormikContext } from "formik";
import { type LucideIcon } from "lucide-react";
import { type SelectHTMLAttributes } from "react";

export interface FormSelectOption {
  value: string;
  label: string;
}

export interface FormSelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "name"> {
  name: string;
  label: string;
  icon?: LucideIcon;
  options: FormSelectOption[];
  placeholder?: string;
}

const FormSelect = ({
  name,
  label,
  icon: Icon,
  options,
  placeholder = "Select an option",
  className = "",
  disabled,
  ...rest
}: FormSelectProps) => {
  const { values, errors, touched, handleChange, handleBlur } =
    useFormikContext<Record<string, unknown>>();

  const value = (values[name] as string) ?? "";
  const error = errors[name] as string | undefined;
  const isTouched = touched[name] as boolean | undefined;
  const showError = isTouched && error;

  return (
    <label className="group relative flex flex-col">
      <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
        {label}
      </span>
      <div
        className={`mt-2 flex items-center gap-2 rounded-2xl border bg-white px-4 py-3 transition duration-200 group-focus-within:border-brand-primary group-focus-within:shadow-sm ${
          showError ? "border-red-300" : "border-slate-200"
        }`}
      >
        {Icon ? <Icon className="h-4 w-4 text-slate-400" aria-hidden /> : null}
        <select
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          className={`w-full border-none bg-transparent text-sm text-slate-900 focus:outline-none disabled:text-slate-400 ${className}`}
          {...rest}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {showError ? (
        <span className="mt-1 text-xs text-red-500">{error}</span>
      ) : null}
    </label>
  );
};

export default FormSelect;
