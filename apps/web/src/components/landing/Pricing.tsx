'use client';

import Link from 'next/link';

const plans = [
	{
		name: 'Explorer',
		price: '$0',
		period: '/mo',
		features: [
			'2 hours of transcription/mo',
			'Standard AI summaries',
			'GPT-4 Advanced Insights',
		],
		cta: 'Get Started',
		highlight: false,
	},
	{
		name: 'Pro',
		price: '$29',
		period: '/mo',
		features: [
			'10 hours of transcription/mo',
			'Advanced AI summaries',
			'GPT-4 Advanced Insights',
		],
		badge:'Most Popular',
        cta: 'Get Started',
		highlight: true,
	},
	{
		name: 'Enterprise',
		price: 'Custom',
		period: '',
        badge:'Enterprise',
		features: [
            'Custom transcription',
			'Custom AI summaries',
			'Custom GPT-4 Advanced Insights',
		],
        cta: 'Contact Sales',
		highlight: false,
	},
];

export default function Pricing() {
	return (
		<section className='pricing'>
        <div className='section-header'>
            <span className='section-eyebrow'>Pricing</span>
            <h2 className='section-title'>Simple, focused pricing.</h2>
            <p className='section-desc'>Choose the plan that fits your production volume.</p>
            </div>
               <div className='plans-grid'>
				{plans.map((plan) => {
					return (
						<div className={`plan-card ${plan.highlight ? 'plan-card--highlight' : 'plan-card--default'}`} key={plan.name}>
							<div className='plan-card__badge-row'>
								<span className='badge badge--indigo'>{plan.name}</span>
							</div>
							<div className='plan-card__price'>
								<span className='plan-card__amount'>{plan.price}</span>
								<span className='plan-card__period'>{plan.period}</span>
							</div>
							<ul className='plan-card__features'>
								{plan.features.map((feature) => {
									return <li className='plan-card__feature' key={feature}>{feature}</li>;
								})}
							</ul>
                            <Link href='/sign-up' className='btn-primary btn-primary--lg'>{plan.cta}</Link>
						</div>
					);
				})}
			    </div>
		</section>
	);
}
