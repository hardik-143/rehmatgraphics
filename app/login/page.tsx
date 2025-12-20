import Link from "next/link";
import { Metadata } from "next";
import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";
import LoginForm from "@/components/LoginForm";
import Footer from "@/components/Footer";
import FAQSection from "@/components/FAQSection";

export const metadata: Metadata = {
  title: "Login | Rehmat Graphics",
  description:
    "Sign in to your Rehmat Graphics trade printing dashboard to manage jobs, upload artwork, and track deliveries.",
};

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-amber-100 to-amber-50 text-amber-900">
      <TopBar />
      <Navbar registerHref="/register" loginHref="/login" />
      <main className="pb-20 pt-12 sm:pt-16">
        <section className="py-10 sm:py-16">
          <div className="mx-auto grid max-w-7xl items-start gap-12 px-4 lg:grid-cols-[0.95fr_1.05fr]">
            <LoginForm />
            <div className="space-y-6">
              <span className="inline-flex items-center justify-center rounded-full border border-amber-200 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-amber-700">
                Welcome back
              </span>
              <h1 className="text-3xl font-semibold text-amber-900 sm:text-4xl">
                Manage every job in one dashboard
              </h1>
              <p className="text-base text-amber-800 sm:text-lg">
                Track production milestones, approve proofs, schedule
                dispatches, and download invoices without emailing support. Your
                secure portal centralizes every action.
              </p>
              <ul className="space-y-3 text-sm text-amber-800">
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-700">
                    ✓
                  </span>
                  Real-time status on offset, digital, and finishing jobs
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-700">
                    ✓
                  </span>
                  One-click reorders from your saved job history
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-700">
                    ✓
                  </span>
                  Secure asset storage with white-label delivery updates
                </li>
              </ul>
              <p className="text-sm text-amber-700">
                Need an account?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-amber-700 transition hover:text-amber-600"
                >
                  Register now.
                </Link>
              </p>
            </div>
          </div>
        </section>
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4">
            <FAQSection />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default LoginPage;
