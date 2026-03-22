"use client";

import { forwardRef, type ComponentPropsWithoutRef } from "react";

export const Button = forwardRef<
	HTMLButtonElement,
	ComponentPropsWithoutRef<"button">
>(function Button({ className = "", type = "button", ...props }, ref) {
	return (
		<button
			ref={ref}
			type={type}
			className={`inline-flex cursor-pointer items-center justify-center rounded-[var(--radius-md)] bg-[var(--indigo)] px-5 py-2.5 text-sm font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
			{...props}
		/>
	);
});
