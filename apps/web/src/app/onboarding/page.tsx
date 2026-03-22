'use client';
import { useRouter } from "next/navigation";
import { api } from "../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import {useEffect, useState} from 'react';
import { Button } from "../../components/ui/button";
import { useMutation, useQuery } from "convex/react";
import '../../app/landing.css';

export default function OnboardingPage() {
    const {user}=useUser();
    const router=useRouter();
    const [role,setRole]=useState<'listener' | 'creator'>('listener');
    const setUserRole=useMutation(api.users.setUserRole);
    const [isLoading,setIsLoading]=useState(false);
    const [error,setError]=useState<string|null>(null);

    const currentUser = useQuery(
      api.users.getCurrentUser,
      user?.id ? { clerkId: user.id } : "skip",
    );

    const handleSelectRole = async (
					selectedRole: 'listener' | 'creator',
				) => {
					if (!user?.id) return;
					setIsLoading(true);
					try {
						await setUserRole({ clerkId: user.id, role: selectedRole });
						router.push('/dashboard');
					} catch (_err) {
						setError('Something went wrong');
					} finally {
						setIsLoading(false);
					}
				};

        useEffect(() => {
        if (!user?.id) return;
        if (currentUser === undefined) return;
        if (currentUser?.onBoardingCompleted) {
            router.push('/dashboard');
        }
        }, [currentUser, user?.id, router]);
         return (
										<div className="onboarding">
											<div className="onboarding__left">
												<h1 className="onboarding__title">
													Architect Your
													<br />
													<span className="hero__title--gradient">
														Sonic Identity.
													</span>
												</h1>
												<p className="onboarding__subtitle">
													Join the next generation of professional audio
													creators and curators.
												</p>
											</div>
											<div className="onboarding__right">
												<h2 className="onboarding__step">
													Step 1: Choose your path
												</h2>
												<p className="onboarding__desc">
													Are you here to share your voice or find your next
													obsession?
												</p>
												<div className="onboarding__roles">
													<Button
														className={`onboarding__role ${role === 'listener' ? 'onboarding__role--active' : ''}`}
														onClick={() => setRole('listener')}
														type="button"
													>
														<span className="onboarding__role-icon">🎧</span>
														<span className="onboarding__role-name">
															Listener
														</span>
														<span className="onboarding__role-desc">
															Discover curated episodes and AI summaries
														</span>
													</Button>

													<Button
														className={`onboarding__role ${role === 'creator' ? 'onboarding__role--active' : ''}`}
														onClick={() => setRole('creator')}
														type="button"
													>
														<span className="onboarding__role-icon">🎙️</span>
														<span className="onboarding__role-name">
															Creator
														</span>
														<span className="onboarding__role-desc">
															Studio-grade tools and real-time analytics
														</span>
													</Button>
												</div>

												{error && <p className="onboarding__error">{error}</p>}

												<Button
													className="btn-primary btn-primary--block"
													onClick={() => handleSelectRole(role)}
													disabled={isLoading}
												>
													{isLoading ? 'Setting up...' : 'Continue →'}
												</Button>
											</div>
										</div>
									);
};
