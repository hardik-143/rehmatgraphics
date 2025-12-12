import { Metadata } from "next";
import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import OrderSteps from "@/components/OrderSteps";
import ServicesGrid from "@/components/ServicesGrid";
import WhyChooseUs from "@/components/WhyChooseUs";
import PromoBlock from "@/components/PromoBlock";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Mamaji Trade Printing | Professional Printing Services",
  description:
    "Trusted trade printing partner offering visiting cards, packaging, catalogues, and more with nationwide delivery and agent-only pricing.",
};

const Page = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-brand-ash/40 to-white text-slate-900">
      <TopBar />
      <Navbar />
      <main>
        <HeroBanner />
        <OrderSteps />
        <ServicesGrid />
        <WhyChooseUs />
        <section className="bg-brand-ash py-16 sm:py-20" id="downloads">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 lg:grid-cols-2">
            <PromoBlock />
            <FAQSection />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Page;
