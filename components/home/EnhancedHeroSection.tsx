"use client";

// import { motion } from "framer-motion";
// import Image from "next/image";
// import { Button } from "@/components/custom-button";
// import type { TranslationKeys } from "@/components/home/translations";
import { cn } from "@/lib/utils";
import { Pacifico } from "next/font/google";
// import { GraduationCap, Book, Users } from "lucide-react";

const pacifico = Pacifico({
	subsets: ["latin"],
	weight: ["400"],
	variable: "--font-pacifico",
});

// function FloatingIcon({
// 	icon: Icon,
// 	delay,
// 	x,
// 	y,
// }: {
// 	icon: any;
// 	delay: number;
// 	x: number;
// 	y: number;
// }) {
// 	return (
// 		<motion.div
// 			className="absolute text-white/80"
// 			initial={{ opacity: 0, scale: 0 }}
// 			animate={{ opacity: 1, scale: 1 }}
// 			transition={{
// 				delay,
// 				duration: 0.5,
// 				ease: "easeOut",
// 			}}>
// 			<motion.div
// 				animate={{
// 					y: [0, 10, 0],
// 					rotate: [0, 5, -5, 0],
// 				}}
// 				transition={{
// 					duration: 5,
// 					repeat: Number.POSITIVE_INFINITY,
// 					repeatType: "reverse",
// 					ease: "easeInOut",
// 				}}
// 				style={{ x, y }}>
// 				<Icon size={32} />
// 			</motion.div>
// 		</motion.div>
// 	);
// }

// interface EnhancedHeroSectionProps {
// 	t: TranslationKeys;
// 	handleGetStarted: () => void;
// }

// export function EnhancedHeroSection({
// 	t,
// 	handleGetStarted,
// }: EnhancedHeroSectionProps) {
// 	return (
// 		<div
// 			className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat"
// 			style={{ backgroundImage: 'url("/assets/images/school_photo2.jpg")' }}>
// 			<div className="absolute inset-0 bg-gradient-to-br from-[#2b2d32]/70 via-[#2b2d32]/50 to-transparent"></div>

// 			<div className="absolute inset-0">
// 				<FloatingIcon icon={GraduationCap} delay={0.5} x={100} y={100} />
// 				<FloatingIcon
// 					icon={Book}
// 					delay={0.7}
// 					x={window.innerWidth - 150}
// 					y={150}
// 				/>
// 				<FloatingIcon
// 					icon={Users}
// 					delay={0.9}
// 					x={window.innerWidth / 2}
// 					y={window.innerHeight - 150}
// 				/>
// 			</div>

// 			<div className="relative z-10 container mx-auto px-4 md:px-6">
// 				<div className="max-w-4xl mx-auto text-center">
// 					<motion.div
// 						initial={{ opacity: 0, y: 20 }}
// 						animate={{ opacity: 1, y: 0 }}
// 						transition={{ duration: 0.8 }}
// 						className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.15] border border-white/[0.25] mb-8 md:mb-12 backdrop-blur-sm">
// 						<Image
// 							src="/logo.png"
// 							alt="St. Micheal Schools"
// 							width={24}
// 							height={24}
// 						/>
// 						<span className="text-sm font-medium text-white tracking-wide">
// 							Yeka Micheal Schools
// 						</span>
// 					</motion.div>

// 					<motion.h1
// 						initial={{ opacity: 0, y: 20 }}
// 						animate={{ opacity: 1, y: 0 }}
// 						transition={{ duration: 0.8, delay: 0.2 }}
// 						className="text-6xl sm:text-7xl md:text-8xl font-bold mb-6 md:mb-8 tracking-tight text-white drop-shadow-lg">
// 						<span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-[#d6a357]">
// 							{t.title.split(" ").slice(0, -1).join(" ")}
// 						</span>
// 						<br />
// 						<span
// 							className={cn(
// 								"bg-clip-text text-transparent bg-gradient-to-r from-[#d6a357] via-[#d6a357] to-white",
// 								pacifico.className
// 							)}>
// 							{t.title.split(" ").slice(-1)}
// 						</span>
// 					</motion.h1>

// 					<motion.p
// 						initial={{ opacity: 0, y: 20 }}
// 						animate={{ opacity: 1, y: 0 }}
// 						transition={{ duration: 0.8, delay: 0.4 }}
// 						className="text-xl md:text-2xl text-white/90 mb-10 leading-relaxed font-light tracking-wide max-w-2xl mx-auto px-4 drop-shadow-lg">
// 						{t.subtitle}
// 					</motion.p>

// 					<motion.div
// 						initial={{ opacity: 0, y: 20 }}
// 						animate={{ opacity: 1, y: 0 }}
// 						transition={{ duration: 0.8, delay: 0.6 }}
// 						className="space-x-4">
// 						<Button
// 							onClick={handleGetStarted}
// 							className="w-full sm:w-auto text-lg px-8 py-3 bg-[#d6a357] text-[#141f42] hover:bg-[#c08d3e] transition-all duration-300 transform hover:scale-105">
// 							{t.getStarted}
// 						</Button>
// 						<Button
// 							variant="outline"
// 							className="w-full sm:w-auto text-lg px-8 py-3 bg-white/10 text-white border-white/30 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
// 							{t.learnMore}
// 						</Button>
// 					</motion.div>
// 				</div>
// 			</div>

// 			<div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#141f42] to-transparent pointer-events-none" />
// 		</div>
// 	);
// }

// // "use client";

// // import { motion } from "framer-motion";
// // import Image from "next/image";
// // import { Button } from "@/components/custom-button";
// // import type { TranslationKeys } from "@/components/translations";
// // import { cn } from "@/lib/utils";
// // import { Pacifico } from "next/font/google";
// // import { GraduationCap, Book, Users } from "lucide-react";

// // const pacifico = Pacifico({
// // 	subsets: ["latin"],
// // 	weight: ["400"],
// // 	variable: "--font-pacifico",
// // });

// // function FloatingIcon({
// // 	icon: Icon,
// // 	delay,
// // 	x,
// // 	y,
// // }: {
// // 	icon: any;
// // 	delay: number;
// // 	x: number;
// // 	y: number;
// // }) {
// // 	return (
// // 		<motion.div
// // 			className="absolute text-white/80"
// // 			initial={{ opacity: 0, scale: 0 }}
// // 			animate={{ opacity: 1, scale: 1 }}
// // 			transition={{
// // 				delay,
// // 				duration: 0.5,
// // 				ease: "easeOut",
// // 			}}>
// // 			<motion.div
// // 				animate={{
// // 					y: [0, 10, 0],
// // 					rotate: [0, 5, -5, 0],
// // 				}}
// // 				transition={{
// // 					duration: 5,
// // 					repeat: Number.POSITIVE_INFINITY,
// // 					repeatType: "reverse",
// // 					ease: "easeInOut",
// // 				}}
// // 				style={{ x, y }}>
// // 				<Icon size={32} />
// // 			</motion.div>
// // 		</motion.div>
// // 	);
// // }

// // interface EnhancedHeroSectionProps {
// // 	t: TranslationKeys;
// // 	handleGetStarted: () => void;
// // }

// // export function EnhancedHeroSection({
// // 	t,
// // 	handleGetStarted,
// // }: EnhancedHeroSectionProps) {
// // 	return (
// // 		<div
// // 			className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat"
// // 			style={{ backgroundImage: 'url("/assets/images/school_photo.jpg")' }}>
// // 			<div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-transparent"></div>

// // 			<div className="absolute inset-0">
// // 				<FloatingIcon icon={GraduationCap} delay={0.5} x={100} y={100} />
// // 				<FloatingIcon
// // 					icon={Book}
// // 					delay={0.7}
// // 					x={window.innerWidth - 150}
// // 					y={150}
// // 				/>
// // 				<FloatingIcon
// // 					icon={Users}
// // 					delay={0.9}
// // 					x={window.innerWidth / 2}
// // 					y={window.innerHeight - 150}
// // 				/>
// // 			</div>

// // 			<div className="relative z-10 container mx-auto px-4 md:px-6">
// // 				<div className="max-w-4xl mx-auto text-center">
// // 					<motion.div
// // 						initial={{ opacity: 0, y: 20 }}
// // 						animate={{ opacity: 1, y: 0 }}
// // 						transition={{ duration: 0.8 }}
// // 						className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.15] border border-white/[0.25] mb-8 md:mb-12 backdrop-blur-sm">
// // 						<Image
// // 							src="/logo.png"
// // 							alt="St. Micheal Schools"
// // 							width={24}
// // 							height={24}
// // 						/>
// // 						<span className="text-sm font-medium text-white tracking-wide">
// // 							St. Micheal Schools
// // 						</span>
// // 					</motion.div>

// // 					<motion.h1
// // 						initial={{ opacity: 0, y: 20 }}
// // 						animate={{ opacity: 1, y: 0 }}
// // 						transition={{ duration: 0.8, delay: 0.2 }}
// // 						className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 md:mb-8 tracking-tight text-white drop-shadow-lg">
// // 						<span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/80">
// // 							{t.title.split(" ").slice(0, -1).join(" ")}
// // 						</span>
// // 						<br />
// // 						<span
// // 							className={cn(
// // 								"bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-yellow-300 to-orange-400",
// // 								pacifico.className
// // 							)}>
// // 							{t.title.split(" ").slice(-1)}
// // 						</span>
// // 					</motion.h1>

// // 					<motion.p
// // 						initial={{ opacity: 0, y: 20 }}
// // 						animate={{ opacity: 1, y: 0 }}
// // 						transition={{ duration: 0.8, delay: 0.4 }}
// // 						className="text-xl md:text-2xl text-white/90 mb-10 leading-relaxed font-light tracking-wide max-w-2xl mx-auto px-4 drop-shadow-lg">
// // 						{t.subtitle}
// // 					</motion.p>

// // 					<motion.div
// // 						initial={{ opacity: 0, y: 20 }}
// // 						animate={{ opacity: 1, y: 0 }}
// // 						transition={{ duration: 0.8, delay: 0.6 }}
// // 						className="space-x-4">
// // 						<Button
// // 							onClick={handleGetStarted}
// // 							className="w-full sm:w-auto text-lg px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105">
// // 							{t.getStarted}
// // 						</Button>
// // 						<Button
// // 							variant="outline"
// // 							className="w-full sm:w-auto text-lg px-8 py-3 bg-white/10 text-white border-white/30 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
// // 							{t.learnMore}
// // 						</Button>
// // 					</motion.div>
// // 				</div>
// // 			</div>

// // 			<div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
// // 		</div>
// // 	);
// // }

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
	Book,
	Backpack,
	Award,
	Users,
	Calendar,
	LineChart,
} from "lucide-react";
import { Button } from "@/components/custom-button";
import Image from "next/image";
import type { TranslationKeys } from "./translations";

interface FloatingIconProps {
	icon: any;
	delay: number;
	x: number;
	y: number;
}

const FloatingIcon = ({ icon: Icon, delay, x, y }: FloatingIconProps) => {
	return (
		<motion.div
			className="absolute z-50 hidden lg:flex items-center justify-center w-12 h-12 rounded-full bg-white/10 backdrop-blur-md shadow-lg text-[#d6a357]"
			initial={{ opacity: 0, scale: 0 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{
				type: "spring",
				stiffness: 260,
				damping: 20,
				delay: delay,
			}}
			style={{ left: x, top: y }}
			whileHover={{ scale: 1.2, rotate: 5 }}>
			<Icon size={24} />
		</motion.div>
	);
};

export function EnhancedHeroSection({
	t,
	handleGetStarted,
}: {
	t: TranslationKeys;
	handleGetStarted: () => void;
}) {
	const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });

	useEffect(() => {
		// Set dimensions based on window size only on client side
		const updateDimensions = () => {
			setDimensions({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		};

		// Initial update
		updateDimensions();

		// Add event listener
		window.addEventListener("resize", updateDimensions);

		// Clean up
		return () => window.removeEventListener("resize", updateDimensions);
	}, []);

	return (
		<section className="w-full min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#141f42] to-[#0c1428] text-white">
			{/* Animated background elements */}
			<div className="absolute inset-0 overflow-hidden">
				<div className="absolute top-0 left-0 w-full h-full opacity-10">
					<div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#d6a357] blur-[120px]" />
					<div className="absolute bottom-1/3 right-1/3 w-80 h-80 rounded-full bg-blue-500 blur-[100px]" />
					<div className="absolute top-2/3 left-1/2 w-72 h-72 rounded-full bg-purple-500 blur-[90px]" />
				</div>
			</div>

			<div className="container px-4 md:px-6 relative z-10 pt-16 md:pt-16">
				<div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
					<div className="flex flex-col justify-center space-y-4">
						<div className="space-y-2">
							<motion.h1
								className="text-7xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-white to-[#d6a357]"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5 }}>
								{/* {t.heroTitle} */}
								<br />
								<span className="md:text-8xl bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/80">
									{t.title.split(" ").slice(0, -1).join(" ")}
								</span>
								<br />
								<span
									className={cn(
										"md:text-8xl bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-yellow-300 to-orange-400 mb-2",
										pacifico.className
									)}>
									{t.title.split(" ").slice(-1)}
								</span>
							</motion.h1>

							<motion.p
								className="max-w-[600px] text-white/80 md:text-xl mt-4"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: 0.2 }}>
								{t.heroDescription}
							</motion.p>
						</div>
						<motion.div
							className="flex flex-col sm:flex-row gap-3"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.4 }}>
							<Button
								onClick={handleGetStarted}
								className="bg-[#d6a357] text-[#141f42] hover:bg-[#c08d3e] transition-all duration-300 transform hover:scale-105">
								{t.getStarted}
							</Button>
							<Button
								variant="outline"
								className="border-white/20 text-white hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
								{t.learnMore}
							</Button>
						</motion.div>

						<motion.div
							className="flex flex-wrap gap-4 mt-8"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.5, delay: 0.6 }}>
							<div className="flex items-center gap-2">
								<div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
									<Users size={20} className="text-[#d6a357]" />
								</div>
								<div className="text-sm">
									<p className="font-medium">{t.stat1Value}</p>
									<p className="text-white/60">{t.stat1Label}</p>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
									<Award size={20} className="text-[#d6a357]" />
								</div>
								<div className="text-sm">
									<p className="font-medium">{t.stat2Value}</p>
									<p className="text-white/60">{t.stat2Label}</p>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
									<Calendar size={20} className="text-[#d6a357]" />
								</div>
								<div className="text-sm">
									<p className="font-medium">{t.stat3Value}</p>
									<p className="text-white/60">{t.stat3Label}</p>
								</div>
							</div>
						</motion.div>
					</div>

					<motion.div
						className="relative flex items-center justify-center lg:justify-end"
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.7 }}>
						<div className="relative w-full max-w-[500px] aspect-[4/3]">
							<Image
								src="/school_photo2.jpg"
								alt="School students"
								fill
								className="object-cover rounded-2xl shadow-2xl border-4 border-white/10 z-20"
								priority
							/>
							<div className="absolute z-50  inset-0 rounded-2xl bg-gradient-to-t from-[#141f42]/50 to-transparent" />

							<motion.div
								className="absolute z-50 bottom-4 left-4 right-4 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.5 }}>
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 rounded-full bg-[#d6a357]/20 flex items-center justify-center">
										<LineChart size={20} className="text-[#d6a357]" />
									</div>
									<div>
										<p className="text-sm font-medium">{t.heroCardTitle}</p>
										<p className="text-xs text-white/70">
											{t.heroCardDescription}
										</p>
									</div>
								</div>
							</motion.div>
						</div>
					</motion.div>
				</div>
			</div>

			{/* Floating icons - only rendered on client side with proper dimensions */}
			{typeof window !== "undefined" && (
				<>
					<FloatingIcon
						icon={Book}
						delay={0.7}
						x={dimensions.width * 0.1}
						y={dimensions.height * 0.2}
					/>
					<FloatingIcon
						icon={Backpack}
						delay={0.9}
						x={dimensions.width * 0.8}
						y={dimensions.height * 0.3}
					/>
					<FloatingIcon
						icon={Award}
						delay={1.1}
						x={dimensions.width * 0.7}
						y={dimensions.height * 0.25}
					/>
					<FloatingIcon
						icon={Award}
						delay={1.1}
						x={dimensions.width * 0.2}
						y={dimensions.height * 0.7}
					/>
					<FloatingIcon
						icon={Calendar}
						delay={1.3}
						x={dimensions.width * 0.7}
						y={dimensions.height * 0.6}
					/>
				</>
			)}

			{/* Scroll indicator */}
			<motion.div
				className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 1.5, duration: 0.5 }}>
				<div className="flex flex-col items-center">
					<p className="text-sm text-white/60 mb-2">{t.scrollToExplore}</p>
					<motion.div
						className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center p-1"
						animate={{ y: [0, 10, 0] }}
						transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}>
						<motion.div className="w-1 h-1 bg-white/60 rounded-full" />
					</motion.div>
				</div>
			</motion.div>
		</section>
	);
}
