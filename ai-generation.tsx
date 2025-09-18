import Header from "@/components/header";
import Hero from "@/components/hero";
import { LaptopShowcase } from "@/components/laptop-showcase";
import PricingSection from "@/components/pricing-section";
import Footer from "@/components/footer";
import MobileBottomNav from "@/components/mobile-bottom-nav";

export default function AIGeneration() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <LaptopShowcase />
      <PricingSection />
      <Footer />
      <MobileBottomNav />
    </div>
  );
}