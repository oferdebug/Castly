/** biome-ignore-all assist/source/organizeImports: Skip */
import '@/app/landing.css';
import Features from "@/components/landing/Features";
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import Pricing from '@/components/landing/Pricing';
import Testimonials from './Testimonials';
import Footer from './Footer';
import OnboardingPage from './onboarding/page';
export default function Page() {
	return (
		<>
			<div className="grain" />
			<Navbar />
			<main>
				<Hero />
				<div className="divider" />
				<Features />
				<div className="divider" />
				<Pricing />
				<div className="divider" />
				<Testimonials />
				<div className="divider" />
				<Footer />
			</main>
		</>
	);
}
