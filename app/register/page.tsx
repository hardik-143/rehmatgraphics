import Link from "next/link";
import { Metadata } from "next";
import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";
import RegisterForm from "@/components/RegisterForm";
import Footer from "@/components/Footer";
import PromoBlock from "@/components/PromoBlock";

export const metadata: Metadata = {
  title: "Register | Rehmat Graphics",
  description:
    "Create your Rehmat Graphics trade printing account to unlock live pricing, nationwide delivery, and secure file uploads.",
};

const RegisterPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-amber-100 to-amber-50 text-amber-900">
      <TopBar />
      <Navbar registerHref="/register" loginHref="/login" />
      <main className="pb-20 pt-12 sm:pt-16">
        <section className="py-10 sm:py-16">
          <div className="mx-auto grid max-w-7xl items-start gap-12 px-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-6">
              <span className="inline-flex items-center justify-center rounded-full border border-amber-200 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-amber-700">
                Become an agent
              </span>
              <h1 className="text-3xl font-semibold text-amber-900 sm:text-4xl">
                Register for premium trade print access
              </h1>
              <p className="text-base text-amber-800 sm:text-lg">
                Join India&rsquo;s fastest trade printing network. Submit this
                quick form to unlock wholesale pricing, white-label delivery,
                and expert prepress support tailored for agencies and print
                brokers.
              </p>
              <ul className="space-y-3 text-sm text-amber-800">
                <li className="flex items-center gap-3">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-700">
                    1
                  </span>
                  Exclusive price lists for 50+ print categories
                </li>
                <li className="flex items-center gap-3">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-700">
                    2
                  </span>
                  Dedicated account managers for enterprise jobs
                </li>
                <li className="flex items-center gap-3">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-700">
                    3
                  </span>
                  Live production tracking and white-label shipping
                </li>
              </ul>
              <p className="text-sm text-amber-700">
                Already registered?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-amber-700 transition hover:text-amber-600"
                >
                  Log in here.
                </Link>
              </p>
            </div>
            <RegisterForm />
          </div>
        </section>
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4">
            <PromoBlock />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default RegisterPage;
