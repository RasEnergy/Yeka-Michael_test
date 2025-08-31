import React from "react";
import { Button as ShadcnButton } from "@/components/ui/button";

interface CustomButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?:
		| "default"
		| "destructive"
		| "outline"
		| "secondary"
		| "ghost"
		| "link";
	size?: "default" | "sm" | "lg" | "icon";
}

export function Button({
	children,
	className,
	variant,
	size,
	...props
}: CustomButtonProps) {
	return (
		<ShadcnButton className={className} {...props}>
			{children}
		</ShadcnButton>
	);
}
