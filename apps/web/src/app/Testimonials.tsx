'use client';



interface Testimonial {
    quote: string;
    author: string;
    role: string;
}

const testimonials: Testimonial[] = [
	{
		quote:
			'This turned our backlog of ideas into a real show. The workflow feels effortless.',
		author: 'Jordan Lee',
		role: 'Indie creator',
	},
	{
		quote:
			'We ship an episode every week now. Quality is consistent and the team actually enjoys the process.',
		author: 'Sam Rivera',
		role: 'Head of content',
	},
	{
		quote:
			'From script to publish in one afternoon. Exactly what we needed for our internal comms podcast.',
		author: 'Alex Chen',
		role: 'Product marketing',
	},
	{
		quote:
			'The AI transcription is incredibly accurate. It saves me hours every week.',
		author: 'Marcus Johnson',
		role: 'Daily Tech Podcast',
	},
];

export default function Testimonials() {
  return (
    <section className='testimonials'>
        <div className='section-header'>
            <span className='section-eyebrow'>Testimonials</span>
            <h2 className='section-title'>What our users are saying</h2>
            <p className='section-desc'>See what our users are saying about our product</p>
        </div>
        <div className='testimonials-grid'>
       {testimonials.map((testimonial) => {
        return (
        <div className="testimonial-card" key={testimonial.author}>
            <p className="testimonial-card__quote">"{testimonial.quote}"</p>
            <div className="testimonial-card__author">
                <div className="testimonial-card__avatar">{testimonial.author[0]}</div>
                <div>
                    <div className="testimonial-card__name">{testimonial.author}</div>
                    <div className="testimonial-card__role">{testimonial.role}</div>
                </div>
            </div>
            </div>
        );
        })}
        </div>
		</section>
	);
}