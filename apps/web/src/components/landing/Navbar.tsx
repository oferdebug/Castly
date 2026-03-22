"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "../Logo";

export default function Navbar() {
	const [isScrolled, setIsScrolled] = useState(false);
	useEffect(() => {
		const handleScroll = () => setIsScrolled(window.scrollY > 0);
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);
	return (
		<nav className={`navbar ${isScrolled ? "scrolled" : ""}`}>
			<div className="navbar__logo">
				<Logo size="md" />
				<span className="navbar__logo-text">Castly</span>
			</div>
			<div className="navbar__content">
				<ul className="navbar__links">
					<li className="navbar__link">
						<Link href="/blog">Blog</Link>
					</li>
					<li className="navbar__link">
						<Link href="/contact">Contact</Link>
					</li>
				</ul>
			</div>
			<div className="navbar__actions">
				<Link href="/sign-in" className="btn-ghost btn-ghost--sm">
					Sign In
				</Link>
				<Link href="/sign-up" className="btn-primary btn-primary--sm">
					Sign Up
				</Link>
			</div>
		</nav>
	);
}
