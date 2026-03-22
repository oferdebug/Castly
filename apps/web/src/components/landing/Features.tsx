'use client';


const features = [
    {
    icon: "◈",
    title: "Whisper-Grade Transcription",
    desc: "99.1% accuracy across 90+ languages. Auto-identifies speakers and filters filler words instantly.",
    tag: "AI ENGINE",
  },
  {
    icon: "✦",
    title: "GPT-4 Show Notes",
    desc: "Automatic summaries, bulleted timestamps, and keyword extraction that sounds like you.",
    tag: "AI ENGINE",
  },
  {
    icon: "◎",
    title: "Social Catalyst",
    desc: "Generate LinkedIn posts, Twitter threads, and TikTok captions from your transcript.",
    tag: "DISTRIBUTION",
  },
  {
    icon: "⬡",
    title: "Deep Analytics",
    desc: "Drop-off heatmaps, listener geography, and AI-powered retention insights per episode.",
    tag: "INSIGHTS",
  },  
]

export default function Features() {
    return (
        <section className='features'>
            <div className='section-header'>
                <span className='section-eyebrow'>Features</span>
                <h2 className='section-title'>The AI Podcast Assistant</h2>
                <p className='section-desc'>The AI Podcast Assistant is a tool that helps you transcribe your podcast and generate show notes.</p>
            </div>
            <div className='features-grid'>
                {features.map((feature) => (
                    <div className="feature-card" key={feature.title}>
                        <div className="feature-card__header">
                            <div className="feature-card__icon">{feature.icon}</div>
                            <span className="badge badge--indigo">{feature.tag}</span>
                        </div>
                        <h3 className="feature-card__title">{feature.title}</h3>
                        <p className="feature-card__desc">{feature.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}