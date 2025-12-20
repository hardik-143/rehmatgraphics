"use client";

import { useState } from "react";
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
import { Formik, Form, useFormikContext } from "formik";
import * as Yup from "yup";
import FormInput from "@/components/ui/form/FormInput";

type StatusState = {
  type: "idle" | "loading" | "success" | "error";
  message: string | null;
};

interface LoginFormValues {
  email: string;
  password: string;
}

interface OtpFormValues {
  otpCode: string;
}

const loginInitialValues: LoginFormValues = {
  email: "",
  password: "",
};

const otpInitialValues: OtpFormValues = {
  otpCode: "",
};

const loginValidationSchema = Yup.object().shape({
  email: Yup.string()
    .trim()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
});

const otpValidationSchema = Yup.object().shape({
  otpCode: Yup.string()
    .matches(/^[0-9]{6}$/, "Enter the 6-digit code we emailed you")
    .required("OTP code is required"),
});

interface CredentialsFormProps {
  isLoading: boolean;
}

const CredentialsForm = ({ isLoading }: CredentialsFormProps) => {
  return (
    <>
      <FormInput
        name="email"
        label="Email"
        icon={Mail}
        type="email"
        placeholder="agent@rehmatgraphics.com"
        required
      />

      <FormInput
        name="password"
        label="Password"
        icon={Lock}
        type="password"
        placeholder="Your secure password"
        required
      />

      <button
        type="submit"
        disabled={isLoading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-md transition duration-200 hover:bg-slate-950 hover:shadow-lg disabled:pointer-events-none disabled:opacity-60"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Signing In
          </>
        ) : (
          <>
            <LogIn className="h-4 w-4" aria-hidden />
            Login
          </>
        )}
      </button>
    </>
  );
};

interface OtpFormComponentProps {
  email: string;
  isLoading: boolean;
  isDev?: boolean;
}

const OtpFormComponent = ({ email, isLoading, isDev }: OtpFormComponentProps) => {
  const { values, handleChange, handleBlur, errors, touched } =
    useFormikContext<OtpFormValues>();

  const showError = touched.otpCode && errors.otpCode;

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        {isDev ? (
          <span className="font-medium text-amber-600">
            Dev mode: Enter <code className="rounded bg-amber-100 px-1">000000</code> as your OTP.
          </span>
        ) : (
          <>We sent a 6-digit security code to {email}. Enter it below to finish signing in.</>
        )}
      </div>
      <label className="group relative flex flex-col">
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
          One-time code
        </span>
        <div
          className={`mt-2 flex items-center gap-2 rounded-2xl border bg-white px-4 py-3 transition duration-200 group-focus-within:border-brand-primary group-focus-within:shadow-sm ${
            showError ? "border-red-300" : "border-slate-200"
          }`}
        >
          <KeyRound className="h-4 w-4 text-slate-400" aria-hidden />
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            name="otpCode"
            value={values.otpCode}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="123456"
            required
            className="w-full border-none bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
        {showError ? (
          <span className="mt-1 text-xs text-red-500">{errors.otpCode}</span>
        ) : null}
      </label>

      <button
        type="submit"
        disabled={isLoading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-md transition duration-200 hover:bg-slate-950 hover:shadow-lg disabled:pointer-events-none disabled:opacity-60"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Verifying
          </>
        ) : (
          <>
            <LogIn className="h-4 w-4" aria-hidden />
            Verify code
          </>
        )}
      </button>
    </>
  );
};

const LoginForm = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [userId, setUserId] = useState<string | null>(null);
  const [savedEmail, setSavedEmail] = useState<string>("");
  const [isDev, setIsDev] = useState<boolean>(false);
  const [status, setStatus] = useState<StatusState>({
    type: "idle",
    message: null,
  });

  const resetFlow = () => {
    setUserId(null);
    setSavedEmail("");
    setIsDev(false);
    setStep("credentials");
  };

  const handleCredentialsSubmit = async (
    values: LoginFormValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    setStatus({
      type: "loading",
      message: "Verifying your credentials…",
    });

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
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
        setSavedEmail(values.email);
        setIsDev(data?.isDev === true);
        setStep("otp");
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
      resetForm();
      router.push("/");
    } catch (error) {
      console.error("Login error:", error);
      setStatus({
        type: "error",
        message: "Something went wrong. Please try again.",
      });
    }
  };

  const handleOtpSubmit = async (
    values: OtpFormValues,
    { resetForm }: { resetForm: () => void }
  ) => {
    setStatus({
      type: "loading",
      message: "Checking your one-time code…",
    });

    try {
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
        body: JSON.stringify({ userId, otpCode: values.otpCode }),
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
      resetForm();
      resetFlow();
      router.push("/");
    } catch (error) {
      console.error("OTP verification error:", error);
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

      {step === "credentials" ? (
        <Formik
          initialValues={loginInitialValues}
          validationSchema={loginValidationSchema}
          onSubmit={handleCredentialsSubmit}
        >
          <Form className="relative space-y-4">
            <CredentialsForm isLoading={isLoading} />
          </Form>
        </Formik>
      ) : (
        <Formik
          initialValues={otpInitialValues}
          validationSchema={otpValidationSchema}
          onSubmit={handleOtpSubmit}
        >
          <Form className="relative space-y-4">
            <OtpFormComponent email={savedEmail} isLoading={isLoading} isDev={isDev} />
          </Form>
        </Formik>
      )}

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
