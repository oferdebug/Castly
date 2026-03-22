'use client';

import Link from "next/link";

export default function Hero() {
  return (
    <section className='hero'>
          {/* Glow orbs */}
          <div className='glow-orb glow-orb--1' />
          <div className='glow-orb glow-orb--2' />
          <div className='glow-orb glow-orb--3' />
          {/* Beta badge */}
           <span className='badge badge--beta'>Beta</span>
          {/* Title */}
                <h1 className="hero__title">
                Podcast production,<br />
                <span className="hero__title--gradient">powered by AI.</span>
          </h1>
          {/* Subtitle */}
            <p className="hero__subtitle">
            The surgical precision of pro-tools meets the magic of generative AI.
            Transcribe, edit, and publish in a heartbeat.
            </p>
          {/* CTAs */}
          <div className='hero__ctas'>
            <Link href='/sign-up' className='btn-primary btn-primary--sm'>Get Started</Link>
            <Link href='/sign-in' className='btn-ghost btn-ghost--sm'>Learn More</Link>
          </div>
          {/* Mini player */}
          <div className="player-bar">
          <div className="player-bar__row">
          <div className="player-bar__thumb">◈</div>
          <div className="player-bar__info">
           <div className="player-bar__title">The Future of AI Audio</div>
            <div className="player-bar__label">NOW STREAMING CLIP</div>
            </div>
            <div className="waveform">
            {[0.6, 1, 0.7, 1, 0.5, 0.8, 1, 0.6, 0.9, 0.7].map((h, i) => (
            <div key={i} className="wave-bar" style={{ height: `${h * 20}px`, animationDelay: `${i * 0.1}s` }} />
            ))}
            </div>
             </div>
                <div className="progress-track">
                    <div className="progress-fill" />
                </div>
                <div className="player-bar__timestamps">
                    <span className="player-bar__time">0:24</span>
                    <span className="player-bar__time">0:60</span>
                </div>
                </div>
      </section>
  );
}