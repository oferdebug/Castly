import "@/app/landing.css";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";

export default function Page() {
  return (
    <>
      <div className="grain" />
      <Navbar />
      <main>
        <Hero />
        <div className="divider" />
        <Features />
      </main>
    </>
  );
}