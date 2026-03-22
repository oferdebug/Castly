'use client';

import Link from 'next/link';
import { Logo } from '@/components/Logo';

export default function Footer() {
	return (
		<footer className="footer">
			<div className="footer__brand">
				<Logo size="md" />
				<span className="footer__logo-text">Castly</span>
			</div>
			<div className="footer__links">
				<Link href="/privacy" className="footer__link">
					Privacy
				</Link>
				<Link href="/terms" className="footer__link">
					Terms
				</Link>
				<Link href="/contact" className="footer__link">
					Contact
				</Link>
			</div>
		</footer>
	);
}
