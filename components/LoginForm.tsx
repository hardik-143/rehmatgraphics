"use client";

import { FormEvent, useState } from "react";
import {
  Loader2,
  LogIn,
  Mail,
  Lock,
  ShieldCheck,
  KeyRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/authSlice";

type LoginFormValues = {
  email: string;
  password: string;
};

type StatusState = {
  type: "idle" | "loading" | "success" | "error";
  message: string | null;
};

const initialState: LoginFormValues = {
  email: "",
  password: "",
};

const LoginForm = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [formValues, setFormValues] = useState(initialState);
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [userId, setUserId] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusState>({
    type: "idle",
    message: null,
  });

  const handleChange =
    (field: keyof LoginFormValues) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormValues((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const resetFlow = () => {
    setFormValues(initialState);
    setOtpCode("");
    setUserId(null);
    setStep("credentials");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus({
      type: "loading",
      message:
        step === "credentials"
          ? "Verifying your credentials…"
          : "Checking your one-time code…",
    });

    try {
      if (step === "credentials") {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formValues),
        });

        const data = await response.json();

        if (!response.ok) {
          const message =
            typeof data?.error === "string" ? data.error : "Unable to sign in.";
          setStatus({ type: "error", message });
          return;
        }

        if (data?.otpRequired && typeof data?.userId === "string") {
          setUserId(data.userId);
          setStep("otp");
          setOtpCode("");
          setStatus({
            type: "success",
            message:
              typeof data?.message === "string"
                ? data.message
                : "We just sent a one-time code to your email.",
          });
          return;
        }

        if (data?.user) {
          dispatch(setCredentials(data.user));
        }

        const firstName = data?.user?.firstName as string | undefined;
        setStatus({
          type: "success",
          message: firstName
            ? `Welcome back, ${firstName}. Redirecting…`
            : "Login successful. Redirecting…",
        });
        resetFlow();
        router.push("/");
        return;
      }

      if (!userId) {
        setStatus({
          type: "error",
          message: "We lost your session. Please start over.",
        });
        resetFlow();
        return;
      }

      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, otpCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        const message =
          typeof data?.error === "string"
            ? data.error
            : "We couldn't verify that code.";
        setStatus({ type: "error", message });
        if (response.status === 400 || response.status === 429) {
          resetFlow();
        }
        return;
      }

      if (data?.user) {
        dispatch(setCredentials(data.user));
      }

      const firstName = data?.user?.firstName as string | undefined;
      setStatus({
        type: "success",
        message: firstName
          ? `Welcome back, ${firstName}. Redirecting…`
          : "Login successful. Redirecting…",
      });
      resetFlow();
      router.push("/");
    } catch (error) {
      console.error("Login error:", error);
      setStatus({
        type: "error",
        message: "Something went wrong. Please try again.",
      });
    }
  };

  const isLoading = status.type === "loading";

  return (
    <div
      id="login"
      className="relative flex flex-col gap-6 overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white p-8 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-secondary via-brand-accent to-brand-primary" />
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
          Existing Agents
        </p>
        <h3 className="mt-3 text-2xl font-semibold text-slate-900">
          Access your dashboard
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          Sign in with your registered email to manage quotes, upload artwork,
          and track orders in one place.
        </p>
      </div>

      <form className="relative space-y-4" onSubmit={handleSubmit}>
        {step === "credentials" ? (
          <>
            <label className="group relative flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                Email
              </span>
              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition duration-200 group-focus-within:border-brand-primary group-focus-within:shadow-sm">
                <Mail className="h-4 w-4 text-slate-400" aria-hidden />
                <input
                  type="email"
                  name="email"
                  value={formValues.email}
                  onChange={handleChange("email")}
                  placeholder="agent@rehmatgraphics.com"
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
                  placeholder="Your secure password"
                  required
                  minLength={8}
                  className="w-full border-none bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </label>
          </>
        ) : (
          <>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              We sent a 6-digit security code to {formValues.email}. Enter it
              below to finish signing in.
            </div>
            <label className="group relative flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                One-time code
              </span>
              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition duration-200 group-focus-within:border-brand-primary group-focus-within:shadow-sm">
                <KeyRound className="h-4 w-4 text-slate-400" aria-hidden />
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  name="otp"
                  value={otpCode}
                  onChange={(event) => setOtpCode(event.target.value)}
                  placeholder="123456"
                  required
                  className="w-full border-none bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </label>
          </>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-md transition duration-200 hover:bg-slate-950 hover:shadow-lg disabled:pointer-events-none disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              {step === "credentials" ? "Signing In" : "Verifying"}
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" aria-hidden />
              {step === "credentials" ? "Login" : "Verify code"}
            </>
          )}
        </button>
      </form>

      {status.type !== "idle" && status.message ? (
        <div
          role={status.type === "error" ? "alert" : "status"}
          className={`flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm ${
            status.type === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-slate-200 bg-slate-900 text-slate-100"
          }`}
        >
          {status.type === "success" ? (
            <ShieldCheck className="mt-0.5 h-4 w-4" aria-hidden />
          ) : null}
          <span>{status.message}</span>
        </div>
      ) : null}
    </div>
  );
};

export default LoginForm;
