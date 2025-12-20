"use client";

import { useState } from "react";
import { useFormikContext } from "formik";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";
import { type InputHTMLAttributes } from "react";

export interface FormInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "name"> {
  name: string;
  label: string;
  icon?: LucideIcon;
}

const FormInput = ({
  name,
  label,
  icon: Icon,
  type = "text",
  className = "",
  ...rest
}: FormInputProps) => {
  const { values, errors, touched, handleChange, handleBlur } =
    useFormikContext<Record<string, unknown>>();
  const [showPassword, setShowPassword] = useState(false);

  const value = (values[name] as string) ?? "";
  const error = errors[name] as string | undefined;
  const isTouched = touched[name] as boolean | undefined;
  const showError = isTouched && error;

  const isPasswordField = type === "password";
  const inputType = isPasswordField && showPassword ? "text" : type;

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
        <input
          type={inputType}
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full border-none bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none ${className}`}
          {...rest}
        />
        {isPasswordField ? (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="flex-shrink-0 text-slate-400 transition hover:text-slate-600 focus:outline-none"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden />
            ) : (
              <Eye className="h-4 w-4" aria-hidden />
            )}
          </button>
        ) : null}
      </div>
      {showError ? (
        <span className="mt-1 text-xs text-red-500">{error}</span>
      ) : null}
    </label>
  );
};

export default FormInput;
