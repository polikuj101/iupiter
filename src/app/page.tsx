import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Features } from "@/components/landing/Features";
import { LiveDemo } from "@/components/landing/LiveDemo";
import { ContactCTA } from "@/components/landing/ContactCTA";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Hero />
      <HowItWorks />
      <Features />
      <LiveDemo />
      <ContactCTA />
    </main>
  );
}
