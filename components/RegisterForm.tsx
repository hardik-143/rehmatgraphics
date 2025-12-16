"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, Loader2, Mail, Lock, User } from "lucide-react";

const initialState = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
};

type StatusState = {
  type: "idle" | "loading" | "success" | "error";
  message: string | null;
};

const RegisterForm = () => {
  const [formValues, setFormValues] = useState(initialState);
  const [status, setStatus] = useState<StatusState>({
    type: "idle",
    message: null,
  });

  const handleChange =
    (field: keyof typeof formValues) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormValues((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus({ type: "loading", message: "Creating your account…" });

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formValues),
      });

      const data = await response.json();

      if (!response.ok) {
        const message =
          typeof data?.error === "string" ? data.error : "Registration failed.";
        setStatus({ type: "error", message });
        return;
      }

      setStatus({
        type: "success",
        message:
          typeof data?.message === "string"
            ? data.message
            : "Registration received. We'll email you once an administrator approves your account.",
      });
      setFormValues(initialState);
    } catch (error) {
      console.error("Registration error:", error);
      setStatus({
        type: "error",
        message: "Something went wrong. Please try again.",
      });
    }
  };

  const isLoading = status.type === "loading";

  return (
    <div className="relative flex flex-col gap-6 overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white p-8 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent" />
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
          New Agents
        </p>
        <h3 className="mt-3 text-2xl font-semibold text-slate-900">
          Create your trade account
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          Complete the form to access live pricing, file uploads, and nationwide
          delivery support.
        </p>
      </div>

      <form className="relative space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="group relative flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
              First Name
            </span>
            <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition duration-200 group-focus-within:border-brand-primary group-focus-within:shadow-sm">
              <User className="h-4 w-4 text-slate-400" aria-hidden />
              <input
                type="text"
                name="firstName"
                value={formValues.firstName}
                onChange={handleChange("firstName")}
                placeholder="Mamaji"
                required
                minLength={2}
                className="w-full border-none bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </label>
          <label className="group relative flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
              Last Name
            </span>
            <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition duration-200 group-focus-within:border-brand-primary group-focus-within:shadow-sm">
              <User className="h-4 w-4 text-slate-400" aria-hidden />
              <input
                type="text"
                name="lastName"
                value={formValues.lastName}
                onChange={handleChange("lastName")}
                placeholder="Prints"
                required
                minLength={2}
                className="w-full border-none bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </label>
        </div>

        <label className="group relative flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
            Work Email
          </span>
          <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition duration-200 group-focus-within:border-brand-primary group-focus-within:shadow-sm">
            <Mail className="h-4 w-4 text-slate-400" aria-hidden />
            <input
              type="email"
              name="email"
              value={formValues.email}
              onChange={handleChange("email")}
              placeholder="hello@mamajiprint.com"
              required
              className="w-full border-none bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
        </label>

        <label className="group relative flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
            Password
          </span>
          <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition duration-200 group-focus-within:border-brand-primary group-focus-within:shadow-sm">
            <Lock className="h-4 w-4 text-slate-400" aria-hidden />
            <input
              type="password"
              name="password"
              value={formValues.password}
              onChange={handleChange("password")}
              placeholder="Minimum 8 characters"
              required
              minLength={8}
              className="w-full border-none bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
        </label>

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary px-6 py-3 text-sm font-semibold text-white shadow-md transition duration-200 hover:shadow-lg disabled:pointer-events-none disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Processing
            </>
          ) : (
            <>Create Account</>
          )}
        </button>
      </form>

      {status.type !== "idle" && status.message ? (
        <div
          role={status.type === "error" ? "alert" : "status"}
          className={`flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm ${
            status.type === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {status.type === "success" ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4" aria-hidden />
          ) : null}
          <span>{status.message}</span>
        </div>
      ) : null}
    </div>
  );
};

export default RegisterForm;
