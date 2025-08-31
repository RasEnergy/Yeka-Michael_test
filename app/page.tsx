"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function HomePage() {
	const { isAuthenticated, isLoading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!isLoading) {
			if (isAuthenticated) {
				router.push("/dashboard");
			} else {
				router.push("/login");
			}
		}
	}, [isAuthenticated, isLoading, router]);

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-lg">Loading...</div>
			</div>
		);
	}

	return null;
}
// "use client";

// import type React from "react";

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { Button } from "@/components/custom-button";
// import {
// 	BookOpen,
// 	Calendar,
// 	LineChart,
// 	MessageSquare,
// 	Users,
// 	Award,
// 	Clock,
// 	Backpack,
// 	ChevronRight,
// 	Menu,
// 	X,
// 	Star,
// 	CheckCircle,
// 	Mail,
// 	Phone,
// 	MapPin,
// 	ArrowRight,
// 	Sparkles,
// } from "lucide-react";
// import {
// 	translations,
// 	type Language,
// 	type TranslationKeys,
// } from "@/components/home/translations";
// import {
// 	Select,
// 	SelectContent,
// 	SelectItem,
// 	SelectTrigger,
// 	SelectValue,
// } from "@/components/ui/select";
// import { motion, AnimatePresence } from "framer-motion";
// import { useRouter } from "next/navigation";
// import { EnhancedHeroSection } from "@/components/home/EnhancedHeroSection";
// import { WorksSection } from "@/components/home/WorksSection";

// export default function LandingPage() {
// 	const router = useRouter();
// 	const [lang, setLang] = useState<Language>("en");
// 	const t = translations[lang];
// 	const [isMenuOpen, setIsMenuOpen] = useState(false);
// 	const [activeSection, setActiveSection] = useState("");
// 	const [scrollY, setScrollY] = useState(0);

// 	const handleGetStarted = () => {
// 		router.push("/");
// 	};

// 	useEffect(() => {
// 		const handleScroll = () => {
// 			setScrollY(window.scrollY);

// 			const sections = [
// 				"features",
// 				"events",
// 				"teachers",
// 				"classes",
// 				"works",
// 				"pricing",
// 				"contact",
// 			];
// 			let current = "";

// 			for (const section of sections) {
// 				const element = document.getElementById(section);
// 				if (element) {
// 					const rect = element.getBoundingClientRect();
// 					if (rect.top <= 100 && rect.bottom >= 100) {
// 						current = section;
// 						break;
// 					}
// 				}
// 			}

// 			setActiveSection(current);
// 		};

// 		window.addEventListener("scroll", handleScroll);
// 		return () => window.removeEventListener("scroll", handleScroll);
// 	}, []);

// 	const isScrolled = scrollY > 50;

// 	return (
// 		<div className="flex flex-col min-h-screen">
// 			<header
// 				className={`px-4 lg:px-6 h-16 flex items-center fixed w-full z-50 transition-all duration-300 ${
// 					isScrolled
// 						? "bg-white/90 backdrop-blur-md shadow-md"
// 						: "bg-transparent"
// 				}`}>
// 				<Link className="flex items-center justify-center" href="#">
// 					<div className="relative w-10 h-10 mr-2">
// 						<Image
// 							src="/logo2.jpg"
// 							alt="logo"
// 							fill
// 							className="object-contain"
// 						/>
// 					</div>
// 					<span
// 						className={`text-lg font-bold ${
// 							isScrolled ? "text-[#141f42]" : "text-[#d6a357]"
// 						}`}>
// 						Yeka Micheal Schools
// 					</span>
// 				</Link>
// 				<nav className="hidden md:flex ml-auto gap-4 sm:gap-6">
// 					{[
// 						"features",
// 						"events",
// 						"teachers",
// 						"classes",
// 						"works",
// 						"pricing",
// 						"contact",
// 					].map((item) => (
// 						<Link
// 							key={item}
// 							className={`text-sm font-medium transition-colors relative ${
// 								activeSection === item
// 									? isScrolled
// 										? "text-[#d6a357]"
// 										: "text-white"
// 									: isScrolled
// 									? "text-[#141f42]/80"
// 									: "text-white/80"
// 							} hover:text-[#d6a357] group`}
// 							href={`#${item}`}>
// 							{t[item as keyof TranslationKeys]}
// 							<span
// 								className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-[#d6a357] transition-all duration-300 ${
// 									activeSection === item ? "w-full" : "group-hover:w-full"
// 								}`}></span>
// 						</Link>
// 					))}
// 				</nav>
// 				<Select
// 					onValueChange={(value: Language) => setLang(value)}
// 					defaultValue={lang}>
// 					<SelectTrigger
// 						className={`w-[100px] ml-4 border-none ${
// 							isScrolled
// 								? "bg-[#141f42]/5 text-[#141f42]"
// 								: "bg-white/10 text-white"
// 						}`}>
// 						<SelectValue placeholder="Language" />
// 					</SelectTrigger>
// 					<SelectContent>
// 						<SelectItem value="en">English</SelectItem>
// 						<SelectItem value="am">አማርኛ</SelectItem>
// 						<SelectItem value="fr">Français</SelectItem>
// 					</SelectContent>
// 				</Select>
// 				<button
// 					className={`ml-4 p-2 md:hidden ${
// 						isScrolled ? "text-[#141f42]" : "text-white"
// 					}`}
// 					onClick={() => setIsMenuOpen(!isMenuOpen)}>
// 					{isMenuOpen ? <X size={24} /> : <Menu size={24} />}
// 				</button>
// 			</header>
// 			<AnimatePresence>
// 				{isMenuOpen && (
// 					<motion.nav
// 						initial={{ opacity: 0, y: -20 }}
// 						animate={{ opacity: 1, y: 0 }}
// 						exit={{ opacity: 0, y: -20 }}
// 						className="fixed top-16 left-0 right-0 bg-[#141f42]/95 backdrop-blur-md z-40 shadow-lg md:hidden">
// 						{[
// 							"features",
// 							"events",
// 							"teachers",
// 							"classes",
// 							"works",
// 							"pricing",
// 							"contact",
// 						].map((item) => (
// 							<Link
// 								key={item}
// 								className={`block px-6 py-3 text-sm font-medium border-l-2 ${
// 									activeSection === item
// 										? "text-[#d6a357] border-[#d6a357] bg-[#d6a357]/10"
// 										: "text-white/80 border-transparent"
// 								} hover:bg-[#d6a357]/10 hover:text-[#d6a357] transition-all duration-200`}
// 								href={`#${item}`}
// 								onClick={() => setIsMenuOpen(false)}>
// 								{t[item as keyof TranslationKeys]}
// 							</Link>
// 						))}
// 					</motion.nav>
// 				)}
// 			</AnimatePresence>
// 			<main className="flex-1">
// 				<EnhancedHeroSection t={t} handleGetStarted={handleGetStarted} />
// 				<FeatureSection t={t} />
// 				<WorksSection t={t} />
// 				<EventSection t={t} />
// 				<TeacherSection t={t} />
// 				<ClassSection t={t} />
// 				<TestimonialSection t={t} />
// 				<PricingSection t={t} />
// 				{/* <ContactSection t={t} /> */}
// 			</main>
// 			<footer className="py-12 w-full bg-[#141f42] text-white">
// 				<div className="container px-4 md:px-6 mx-auto">
// 					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
// 						<div>
// 							<div className="flex items-center mb-4">
// 								<div className="relative w-10 h-10 mr-2">
// 									<Image
// 										src="/logo2.jpg"
// 										alt="logo"
// 										fill
// 										className="object-contain"
// 									/>
// 								</div>
// 								<span className="text-lg font-bold text-[#d6a357]">
// 									Yeka Micheal Schools
// 								</span>
// 							</div>
// 							<p className="text-sm text-white/70 mb-4">
// 								{t.footerDescription ||
// 									"Providing quality education and nurturing future leaders since 1995."}
// 							</p>
// 							<div className="flex space-x-4">
// 								<a
// 									href="#"
// 									className="text-white/70 hover:text-[#d6a357] transition-colors">
// 									<svg
// 										xmlns="http://www.w3.org/2000/svg"
// 										width="20"
// 										height="20"
// 										fill="currentColor"
// 										viewBox="0 0 24 24">
// 										<path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
// 									</svg>
// 								</a>
// 								<a
// 									href="#"
// 									className="text-white/70 hover:text-[#d6a357] transition-colors">
// 									<svg
// 										xmlns="http://www.w3.org/2000/svg"
// 										width="20"
// 										height="20"
// 										fill="currentColor"
// 										viewBox="0 0 24 24">
// 										<path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
// 									</svg>
// 								</a>
// 								<a
// 									href="#"
// 									className="text-white/70 hover:text-[#d6a357] transition-colors">
// 									<svg
// 										xmlns="http://www.w3.org/2000/svg"
// 										width="20"
// 										height="20"
// 										fill="currentColor"
// 										viewBox="0 0 24 24">
// 										<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
// 									</svg>
// 								</a>
// 							</div>
// 						</div>

// 						<div>
// 							<h3 className="text-lg font-semibold mb-4 text-[#d6a357]">
// 								{t.quickLinks || "Quick Links"}
// 							</h3>
// 							<ul className="space-y-2">
// 								<li>
// 									<Link
// 										href="#features"
// 										className="text-white/70 hover:text-[#d6a357] transition-colors text-sm flex items-center">
// 										<ChevronRight className="h-3 w-3 mr-1" />
// 										{t.features}
// 									</Link>
// 								</li>
// 								<li>
// 									<Link
// 										href="#events"
// 										className="text-white/70 hover:text-[#d6a357] transition-colors text-sm flex items-center">
// 										<ChevronRight className="h-3 w-3 mr-1" />
// 										{t.events}
// 									</Link>
// 								</li>
// 								<li>
// 									<Link
// 										href="#teachers"
// 										className="text-white/70 hover:text-[#d6a357] transition-colors text-sm flex items-center">
// 										<ChevronRight className="h-3 w-3 mr-1" />
// 										{t.teachers}
// 									</Link>
// 								</li>
// 								<li>
// 									<Link
// 										href="#classes"
// 										className="text-white/70 hover:text-[#d6a357] transition-colors text-sm flex items-center">
// 										<ChevronRight className="h-3 w-3 mr-1" />
// 										{t.classes}
// 									</Link>
// 								</li>
// 							</ul>
// 						</div>

// 						<div>
// 							<h3 className="text-lg font-semibold mb-4 text-[#d6a357]">
// 								{t.contactInfo || "Contact Info"}
// 							</h3>
// 							<ul className="space-y-3">
// 								<li className="flex items-start">
// 									<MapPin className="h-5 w-5 mr-2 text-[#d6a357] mt-0.5" />
// 									<span className="text-sm text-white/70">
// 										123 Yeka Road, Addis Ababa, Ethiopia
// 									</span>
// 								</li>
// 								<li className="flex items-center">
// 									<Phone className="h-5 w-5 mr-2 text-[#d6a357]" />
// 									<span className="text-sm text-white/70">
// 										+251 11 123 4567
// 									</span>
// 								</li>
// 								<li className="flex items-center">
// 									<Mail className="h-5 w-5 mr-2 text-[#d6a357]" />
// 									<span className="text-sm text-white/70">
// 										info@yekamicheal.edu.et
// 									</span>
// 								</li>
// 								<li className="flex items-center">
// 									<Clock className="h-5 w-5 mr-2 text-[#d6a357]" />
// 									<span className="text-sm text-white/70">
// 										Mon-Fri: 8:00 AM - 5:00 PM
// 									</span>
// 								</li>
// 							</ul>
// 						</div>

// 						<div>
// 							<h3 className="text-lg font-semibold mb-4 text-[#d6a357]">
// 								{t.newsletter || "Newsletter"}
// 							</h3>
// 							<p className="text-sm text-white/70 mb-4">
// 								{t.subscribeText || "Subscribe to our newsletter for updates"}
// 							</p>
// 							<div className="flex">
// 								<input
// 									type="email"
// 									placeholder={t.emailPlaceholder || "Your email"}
// 									className="px-3 py-2 bg-white/10 border border-white/20 rounded-l-md text-sm focus:outline-none focus:ring-1 focus:ring-[#d6a357] text-white w-full"
// 								/>
// 								<button className="bg-[#d6a357] text-[#141f42] px-3 py-2 rounded-r-md hover:bg-[#c08d3e] transition-colors">
// 									<ArrowRight className="h-4 w-4" />
// 								</button>
// 							</div>
// 						</div>
// 					</div>

// 					<div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center">
// 						<p className="text-xs text-white/60 mb-4 md:mb-0">
// 							© 2024 Yeka Micheal Schools. All rights reserved.
// 						</p>
// 						<nav className="flex gap-4 sm:gap-6">
// 							<Link
// 								className="text-xs text-white/60 hover:text-[#d6a357] hover:underline underline-offset-4 transition-colors"
// 								href="#">
// 								{t.termsOfService}
// 							</Link>
// 							<Link
// 								className="text-xs text-white/60 hover:text-[#d6a357] hover:underline underline-offset-4 transition-colors"
// 								href="#">
// 								{t.privacy}
// 							</Link>
// 							<Link
// 								className="text-xs text-white/60 hover:text-[#d6a357] hover:underline underline-offset-4 transition-colors"
// 								href="#">
// 								{t.cookies || "Cookies"}
// 							</Link>
// 						</nav>
// 					</div>
// 				</div>
// 			</footer>
// 		</div>
// 	);
// }

// function FeatureSection({ t }: { t: TranslationKeys }) {
// 	return (
// 		<section
// 			id="features"
// 			className="w-full py-20 md:py-28 bg-gradient-to-b from-[#141f42] to-[#1a2a56] text-white">
// 			<div className="container px-4 md:px-6 mx-auto">
// 				<div className="text-center mb-16">
// 					<motion.div
// 						initial={{ opacity: 0, y: 20 }}
// 						whileInView={{ opacity: 1, y: 0 }}
// 						viewport={{ once: true }}
// 						transition={{ duration: 0.5 }}>
// 						<h2 className="text-3xl font-bold tracking-tighter sm:text-5xl mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-[#d6a357]">
// 							{t.keyFeatures}
// 						</h2>
// 						<p className="max-w-[700px] mx-auto text-white/70 md:text-lg">
// 							{t.keyFeaturesDescription ||
// 								"Discover what makes our school management system stand out from the rest."}
// 						</p>
// 					</motion.div>
// 				</div>

// 				<div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
// 					<FeatureCard
// 						icon={<Users className="h-10 w-10" />}
// 						title={t.studentInformationSystemTitle}
// 						description={t.studentInformationSystemDescription}
// 					/>
// 					<FeatureCard
// 						icon={<BookOpen className="h-10 w-10" />}
// 						title={t.curriculumManagementTitle}
// 						description={t.curriculumManagementDescription}
// 					/>
// 					<FeatureCard
// 						icon={<Calendar className="h-10 w-10" />}
// 						title={t.schedulingTimetablesTitle}
// 						description={t.schedulingTimetablesDescription}
// 					/>
// 					<FeatureCard
// 						icon={<MessageSquare className="h-10 w-10" />}
// 						title={t.communicationPortalTitle}
// 						description={t.communicationPortalDescription}
// 					/>
// 					<FeatureCard
// 						icon={<LineChart className="h-10 w-10" />}
// 						title={t.performanceAnalyticsTitle}
// 						description={t.performanceAnalyticsDescription}
// 					/>
// 					<FeatureCard
// 						icon={<Sparkles className="h-10 w-10" />}
// 						title={t.multilingualSupportTitle}
// 						description={t.multilingualSupportDescription}
// 					/>
// 				</div>
// 			</div>
// 		</section>
// 	);
// }

// function EventSection({ t }: { t: TranslationKeys }) {
// 	return (
// 		<section
// 			id="events"
// 			className="w-full py-20 md:py-28 bg-gradient-to-b from-white to-gray-50">
// 			<div className="container px-4 md:px-6 mx-auto">
// 				<div className="text-center mb-16">
// 					<motion.div
// 						initial={{ opacity: 0, y: 20 }}
// 						whileInView={{ opacity: 1, y: 0 }}
// 						viewport={{ once: true }}
// 						transition={{ duration: 0.5 }}>
// 						<h2 className="text-3xl font-bold tracking-tighter sm:text-5xl mb-4 text-[#141f42]">
// 							{t.upcomingEvents}
// 						</h2>
// 						<p className="max-w-[700px] mx-auto text-gray-600 md:text-lg">
// 							{t.upcomingEventsDescription ||
// 								"Join us for these exciting events happening at our school."}
// 						</p>
// 					</motion.div>
// 				</div>

// 				<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
// 					<EventCard
// 						title={t.nationalScienceFairTitle}
// 						date={t.nationalScienceFairDate}
// 						description={t.nationalScienceFairDescription}
// 					/>
// 					<EventCard
// 						title={t.parentTeacherConferenceTitle}
// 						date={t.parentTeacherConferenceDate}
// 						description={t.parentTeacherConferenceDescription}
// 					/>
// 					<EventCard
// 						title={t.ethiopianHeritageDayTitle}
// 						date={t.ethiopianHeritageDayDate}
// 						description={t.ethiopianHeritageDayDescription}
// 					/>
// 				</div>
// 			</div>
// 		</section>
// 	);
// }

// function TeacherSection({ t }: { t: TranslationKeys }) {
// 	return (
// 		<section
// 			id="teachers"
// 			className="w-full py-20 md:py-28 bg-gradient-to-b from-gray-50 to-white">
// 			<div className="container px-4 md:px-6 mx-auto">
// 				<div className="text-center mb-16">
// 					<motion.div
// 						initial={{ opacity: 0, y: 20 }}
// 						whileInView={{ opacity: 1, y: 0 }}
// 						viewport={{ once: true }}
// 						transition={{ duration: 0.5 }}>
// 						<h2 className="text-3xl font-bold tracking-tighter sm:text-5xl mb-4 text-[#141f42]">
// 							{t.ourDedicatedTeachers}
// 						</h2>
// 						<p className="max-w-[700px] mx-auto text-gray-600 md:text-lg">
// 							{t.ourDedicatedTeachersDescription ||
// 								"Meet our exceptional educators who inspire and guide our students."}
// 						</p>
// 					</motion.div>
// 				</div>

// 				<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
// 					<TeacherCard
// 						name={t.teacher1Name}
// 						subject={t.teacher1Subject}
// 						description={t.teacher1Description}
// 					/>
// 					<TeacherCard
// 						name={t.teacher2Name}
// 						subject={t.teacher2Subject}
// 						description={t.teacher2Description}
// 					/>
// 					<TeacherCard
// 						name={t.teacher3Name}
// 						subject={t.teacher3Subject}
// 						description={t.teacher3Description}
// 					/>
// 				</div>
// 			</div>
// 		</section>
// 	);
// }

// function ClassSection({ t }: { t: TranslationKeys }) {
// 	return (
// 		<section id="classes" className="w-full py-20 md:py-28 bg-[#f8f9fa]">
// 			<div className="container px-4 md:px-6 mx-auto">
// 				<div className="text-center mb-16">
// 					<motion.div
// 						initial={{ opacity: 0, y: 20 }}
// 						whileInView={{ opacity: 1, y: 0 }}
// 						viewport={{ once: true }}
// 						transition={{ duration: 0.5 }}>
// 						<h2 className="text-3xl font-bold tracking-tighter sm:text-5xl mb-4 text-[#141f42]">
// 							{t.featuredClasses}
// 						</h2>
// 						<p className="max-w-[700px] mx-auto text-gray-600 md:text-lg">
// 							{t.featuredClassesDescription ||
// 								"Explore our diverse range of classes designed to nurture talent and inspire learning."}
// 						</p>
// 					</motion.div>
// 				</div>

// 				<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
// 					<ClassCard
// 						title={t.class1Title}
// 						description={t.class1Description}
// 						schedule={t.class1Schedule}
// 					/>
// 					<ClassCard
// 						title={t.class2Title}
// 						description={t.class2Description}
// 						schedule={t.class2Schedule}
// 					/>
// 					<ClassCard
// 						title={t.class3Title}
// 						description={t.class3Description}
// 						schedule={t.class3Schedule}
// 					/>
// 				</div>
// 			</div>
// 		</section>
// 	);
// }

// function TestimonialSection({ t }: { t: TranslationKeys }) {
// 	return (
// 		<section className="w-full py-20 md:py-28 bg-gradient-to-r from-[#d6a357] to-[#e6b367] text-[#141f42]">
// 			<div className="container px-4 md:px-6 mx-auto">
// 				<div className="text-center mb-16">
// 					<motion.div
// 						initial={{ opacity: 0, y: 20 }}
// 						whileInView={{ opacity: 1, y: 0 }}
// 						viewport={{ once: true }}
// 						transition={{ duration: 0.5 }}>
// 						<h2 className="text-3xl font-bold tracking-tighter sm:text-5xl mb-4 text-white">
// 							{t.testimonials}
// 						</h2>
// 						{/* <p className="max-w-[700px] mx-auto text-white/80 md:text-lg">
// 							{t.testimonialsDescription ||
// 								"Hear what parents and students have to say about their experience with us."}
// 						</p> */}
// 					</motion.div>
// 				</div>

// 				<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
// 					<TestimonialCard
// 						quote={t.testimonial1Quote}
// 						author={t.testimonial1Author}
// 						role={t.testimonial1Role}
// 					/>
// 					<TestimonialCard
// 						quote={t.testimonial2Quote}
// 						author={t.testimonial2Author}
// 						role={t.testimonial2Role}
// 					/>
// 					<TestimonialCard
// 						quote={t.testimonial3Quote}
// 						author={t.testimonial3Author}
// 						role={t.testimonial3Role}
// 					/>
// 				</div>
// 			</div>
// 		</section>
// 	);
// }

// function PricingSection({ t }: { t: TranslationKeys }) {
// 	return (
// 		<section
// 			id="pricing"
// 			className="w-full py-20 md:py-28 bg-gradient-to-b from-[#141f42] to-[#1a2a56] text-white">
// 			<div className="container px-4 md:px-6 mx-auto">
// 				<div className="text-center mb-16">
// 					<motion.div
// 						initial={{ opacity: 0, y: 20 }}
// 						whileInView={{ opacity: 1, y: 0 }}
// 						viewport={{ once: true }}
// 						transition={{ duration: 0.5 }}>
// 						<h2 className="text-3xl font-bold tracking-tighter sm:text-5xl mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-[#d6a357]">
// 							{t.monthlyPricingPlans}
// 						</h2>
// 						<p className="max-w-[700px] mx-auto text-white/70 md:text-lg">
// 							{t.pricingDescription ||
// 								"Choose the perfect plan for your school's needs with our flexible pricing options."}
// 						</p>
// 					</motion.div>
// 				</div>

// 				<div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
// 					<PricingCard
// 						title={t.basicPlanTitle}
// 						price={t.basicPlanPrice}
// 						description={t.basicPlanDescription}
// 						features={t.basicPlanFeatures}
// 					/>
// 					<PricingCard
// 						title={t.proPlanTitle}
// 						price={t.proPlanPrice}
// 						description={t.proPlanDescription}
// 						features={t.proPlanFeatures}
// 					/>
// 					<PricingCard
// 						title={t.enterprisePlanTitle}
// 						price={t.enterprisePlanPrice}
// 						description={t.enterprisePlanDescription}
// 						features={t.enterprisePlanFeatures}
// 					/>
// 				</div>
// 			</div>
// 		</section>
// 	);
// }

// function FeatureCard({
// 	icon,
// 	title,
// 	description,
// }: {
// 	icon: React.ReactNode;
// 	title: string;
// 	description: string;
// }) {
// 	return (
// 		<motion.div
// 			className="flex flex-col items-center text-center p-6 bg-[#141f42]/50 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl border border-[#d6a357]/20"
// 			whileHover={{ scale: 1.05 }}
// 			whileTap={{ scale: 0.95 }}
// 			initial={{ opacity: 0, y: 20 }}
// 			whileInView={{ opacity: 1, y: 0 }}
// 			viewport={{ once: true }}
// 			transition={{ type: "spring", stiffness: 300 }}>
// 			<div className="mb-4 rounded-full bg-[#d6a357]/10 p-3 text-[#d6a357]">
// 				{icon}
// 			</div>
// 			<h3 className="mb-2 text-xl font-bold text-[#d6a357]">{title}</h3>
// 			<p className="text-sm text-white/80">{description}</p>
// 		</motion.div>
// 	);
// }

// function EventCard({
// 	title,
// 	date,
// 	description,
// }: {
// 	title: string;
// 	date: string;
// 	description: string;
// }) {
// 	return (
// 		<motion.div
// 			className="flex flex-col p-6 bg-white rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl border border-gray-100"
// 			whileHover={{ scale: 1.05 }}
// 			initial={{ opacity: 0, y: 20 }}
// 			whileInView={{ opacity: 1, y: 0 }}
// 			viewport={{ once: true }}
// 			transition={{ type: "spring", stiffness: 300 }}>
// 			<div className="rounded-full bg-[#d6a357]/10 p-3 w-14 h-14 flex items-center justify-center mb-4">
// 				<Calendar className="h-8 w-8 text-[#d6a357]" />
// 			</div>
// 			<h3 className="text-xl font-bold mb-2 text-[#141f42]">{title}</h3>
// 			<p className="text-sm font-semibold text-[#d6a357] mb-2">{date}</p>
// 			<p className="text-sm text-gray-600">{description}</p>
// 		</motion.div>
// 	);
// }

// function TeacherCard({
// 	name,
// 	subject,
// 	description,
// }: {
// 	name: string;
// 	subject: string;
// 	description: string;
// }) {
// 	return (
// 		<motion.div
// 			className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl border border-gray-100"
// 			whileHover={{ scale: 1.05 }}
// 			initial={{ opacity: 0, y: 20 }}
// 			whileInView={{ opacity: 1, y: 0 }}
// 			viewport={{ once: true }}
// 			transition={{ type: "spring", stiffness: 300 }}>
// 			<div className="mb-4 rounded-full bg-[#141f42]/10 p-3 w-14 h-14 flex items-center justify-center">
// 				<Award className="h-8 w-8 text-[#141f42]" />
// 			</div>
// 			<h3 className="text-xl font-bold mb-2 text-[#141f42]">{name}</h3>
// 			<p className="text-sm font-semibold text-[#d6a357] mb-2">{subject}</p>
// 			<p className="text-sm text-gray-600">{description}</p>
// 		</motion.div>
// 	);
// }

// function ClassCard({
// 	title,
// 	description,
// 	schedule,
// }: {
// 	title: string;
// 	description: string;
// 	schedule: string;
// }) {
// 	return (
// 		<motion.div
// 			className="flex flex-col p-6 bg-white rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl border border-gray-100"
// 			whileHover={{ scale: 1.05 }}
// 			initial={{ opacity: 0, y: 20 }}
// 			whileInView={{ opacity: 1, y: 0 }}
// 			viewport={{ once: true }}
// 			transition={{ type: "spring", stiffness: 300 }}>
// 			<div className="mb-4 rounded-full bg-[#d6a357]/10 p-3 w-14 h-14 flex items-center justify-center">
// 				<Backpack className="h-8 w-8 text-[#d6a357]" />
// 			</div>
// 			<h3 className="text-xl font-bold mb-2 text-[#141f42]">{title}</h3>
// 			<p className="text-sm text-gray-600 mb-4">{description}</p>
// 			<div className="flex items-center mt-auto">
// 				<Clock className="h-4 w-4 mr-2 text-[#d6a357]" />
// 				<p className="text-sm text-gray-600">{schedule}</p>
// 			</div>
// 		</motion.div>
// 	);
// }

// function TestimonialCard({
// 	quote,
// 	author,
// 	role,
// }: {
// 	quote: string;
// 	author: string;
// 	role: string;
// }) {
// 	return (
// 		<motion.div
// 			className="flex flex-col p-6 bg-white/10 backdrop-blur-sm rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl"
// 			whileHover={{ scale: 1.05 }}
// 			initial={{ opacity: 0, y: 20 }}
// 			whileInView={{ opacity: 1, y: 0 }}
// 			viewport={{ once: true }}
// 			transition={{ type: "spring", stiffness: 300 }}>
// 			<div className="mb-4">
// 				<Star className="h-6 w-6 text-white" />
// 				<Star className="h-6 w-6 text-white" />
// 				<Star className="h-6 w-6 text-white" />
// 				<Star className="h-6 w-6 text-white" />
// 				<Star className="h-6 w-6 text-white" />
// 			</div>
// 			<p className="text-white/90 italic mb-6">&quot;</p>
// 			<div className="mt-auto">
// 				<p className="font-semibold text-white">{author}</p>
// 				<p className="text-sm text-white/70">{role}</p>
// 			</div>
// 		</motion.div>
// 	);
// }

// function PricingCard({
// 	title,
// 	price,
// 	description,
// 	features,
// }: {
// 	title: string;
// 	price: string;
// 	description: string;
// 	features: string[];
// }) {
// 	return (
// 		<motion.div
// 			className="flex flex-col p-6 bg-[#141f42]/50 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl border border-[#d6a357]/20"
// 			whileHover={{ scale: 1.05 }}
// 			initial={{ opacity: 0, y: 20 }}
// 			whileInView={{ opacity: 1, y: 0 }}
// 			viewport={{ once: true }}
// 			transition={{ type: "spring", stiffness: 300 }}>
// 			<h3 className="text-2xl font-bold text-[#d6a357]">{title}</h3>
// 			<div className="mt-4 text-4xl font-bold text-white">
// 				{price}
// 				<span className="text-xl font-normal text-white/60">/month</span>
// 			</div>
// 			<p className="mt-2 text-sm text-white/80">{description}</p>
// 			<ul className="mt-4 space-y-2">
// 				{features.map((feature, index) => (
// 					<li key={index} className="flex items-center">
// 						<CheckCircle className="h-4 w-4 mr-2 text-[#d6a357]" />
// 						<span className="text-white/90">{feature}</span>
// 					</li>
// 				))}
// 			</ul>
// 			<Button className="mt-6 w-full bg-[#d6a357] text-[#141f42] hover:bg-[#c08d3e]">
// 				Choose Plan
// 			</Button>
// 		</motion.div>
// 	);
// }
