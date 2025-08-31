"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/custom-button";
import type { TranslationKeys } from "@/components/home/translations";
import { cn } from "@/lib/utils";
import { Pacifico } from "next/font/google";

const pacifico = Pacifico({
	subsets: ["latin"],
	weight: ["400"],
	variable: "--font-pacifico",
});

function ElegantShape({
	className,
	delay = 0,
	width = 400,
	height = 100,
	rotate = 0,
	gradient = "from-white/[0.08]",
}: {
	className?: string;
	delay?: number;
	width?: number;
	height?: number;
	rotate?: number;
	gradient?: string;
}) {
	return (
		<motion.div
			initial={{
				opacity: 0,
				y: -150,
				rotate: rotate - 15,
			}}
			animate={{
				opacity: 1,
				y: 0,
				rotate: rotate,
			}}
			transition={{
				duration: 2.4,
				delay,
				ease: [0.23, 0.86, 0.39, 0.96],
				opacity: { duration: 1.2 },
			}}
			className={cn("absolute", className)}>
			<motion.div
				animate={{
					y: [0, 15, 0],
				}}
				transition={{
					duration: 12,
					repeat: Number.POSITIVE_INFINITY,
					ease: "easeInOut",
				}}
				style={{
					width,
					height,
				}}
				className="relative">
				<div
					className={cn(
						"absolute inset-0 rounded-full",
						"bg-gradient-to-r to-transparent",
						gradient,
						"backdrop-blur-[2px] border-2 border-white/[0.15]",
						"shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]",
						"after:absolute after:inset-0 after:rounded-full",
						"after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]"
					)}
				/>
			</motion.div>
		</motion.div>
	);
}

interface EnhancedHeroSectionProps {
	t: TranslationKeys;
	handleGetStarted: () => void;
}

export function EnhancedHeroSection({
	t,
	handleGetStarted,
}: EnhancedHeroSectionProps) {
	const fadeUpVariants = {
		hidden: { opacity: 0, y: 30 },
		visible: (i: number) => ({
			opacity: 1,
			y: 0,
			transition: {
				duration: 1,
				delay: 0.5 + i * 0.2,
				ease: [0.25, 0.4, 0.25, 1],
			},
		}),
	};

	return (
		<div
			className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat"
			style={{ backgroundImage: 'url("/school_photo2.jpg")' }}>
			<div className="absolute inset-0 bg-black opacity-50"></div>

			<div className="absolute inset-0 overflow-hidden">
				<ElegantShape
					delay={0.3}
					width={600}
					height={140}
					rotate={12}
					gradient="from-indigo-500/[0.15]"
					className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]"
				/>

				<ElegantShape
					delay={0.5}
					width={500}
					height={120}
					rotate={-15}
					gradient="from-rose-500/[0.15]"
					className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]"
				/>

				<ElegantShape
					delay={0.4}
					width={300}
					height={80}
					rotate={-8}
					gradient="from-violet-500/[0.15]"
					className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]"
				/>

				<ElegantShape
					delay={0.6}
					width={200}
					height={60}
					rotate={20}
					gradient="from-amber-500/[0.15]"
					className="right-[15%] md:right-[20%] top-[10%] md:top-[15%]"
				/>

				<ElegantShape
					delay={0.7}
					width={150}
					height={40}
					rotate={-25}
					gradient="from-cyan-500/[0.15]"
					className="left-[20%] md:left-[25%] top-[5%] md:top-[10%]"
				/>
			</div>

			<div className="relative z-10 container mx-auto px-4 md:px-6">
				<div className="max-w-3xl mx-auto text-center">
					<motion.div
						custom={0}
						variants={fadeUpVariants}
						initial="hidden"
						animate="visible"
						className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] mb-8 md:mb-12">
						<Image
							src="/logo.png"
							alt="St. Micheal Schools"
							width={20}
							height={20}
						/>
						<span className="text-sm text-white/60 tracking-wide">
							Yeka Micheal Schools
						</span>
					</motion.div>

					<motion.div
						custom={1}
						variants={fadeUpVariants}
						initial="hidden"
						animate="visible">
						<h1 className="text-4xl sm:text-6xl md:text-8xl font-bold mb-6 md:mb-8 tracking-tight text-white drop-shadow-lg">
							<span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">
								{t.title.split(" ").slice(0, -1).join(" ")}
							</span>
							<br />
							<span
								className={cn(
									"bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300",
									pacifico.className
								)}>
								{t.title.split(" ").slice(-1)}
							</span>
						</h1>
					</motion.div>

					<motion.div
						custom={2}
						variants={fadeUpVariants}
						initial="hidden"
						animate="visible">
						<p className="text-base sm:text-lg md:text-xl text-white/80 mb-8 leading-relaxed font-light tracking-wide max-w-xl mx-auto px-4 drop-shadow-lg">
							{t.subtitle}
						</p>
					</motion.div>

					<motion.div
						custom={3}
						variants={fadeUpVariants}
						initial="hidden"
						animate="visible"
						className="space-x-4">
						<Button
							onClick={handleGetStarted}
							className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
							{t.getStarted}
						</Button>
						<Button
							variant="outline"
							className="w-full sm:w-auto bg-white/20 text-white hover:bg-white/30">
							{t.learnMore}
						</Button>
					</motion.div>
				</div>
			</div>

			<div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/80 pointer-events-none" />
		</div>
	);
}
