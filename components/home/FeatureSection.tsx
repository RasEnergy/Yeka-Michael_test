import { motion } from "framer-motion";
import type { TranslationKeys } from "@/components/home/translations";
import {
	Users,
	BookOpen,
	Calendar,
	MessageSquare,
	LineChart,
	GraduationCap,
} from "lucide-react";
import type React from "react"; // Import React

interface FeatureSectionProps {
	t: TranslationKeys;
}

export function FeatureSection({ t }: FeatureSectionProps) {
	const features = [
		{
			icon: Users,
			title: t.studentInformationSystemTitle,
			description: t.studentInformationSystemDescription,
		},
		{
			icon: BookOpen,
			title: t.curriculumManagementTitle,
			description: t.curriculumManagementDescription,
		},
		{
			icon: Calendar,
			title: t.schedulingTimetablesTitle,
			description: t.schedulingTimetablesDescription,
		},
		{
			icon: MessageSquare,
			title: t.communicationPortalTitle,
			description: t.communicationPortalDescription,
		},
		{
			icon: LineChart,
			title: t.performanceAnalyticsTitle,
			description: t.performanceAnalyticsDescription,
		},
		{
			icon: GraduationCap,
			title: t.multilingualSupportTitle,
			description: t.multilingualSupportDescription,
		},
	];

	return (
		<section
			id="features"
			className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-800">
			<div className="container px-4 md:px-6">
				<motion.h2
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
					className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">
					{t.keyFeatures}
				</motion.h2>
				<div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
					{features.map((feature, index) => (
						<motion.div
							key={index}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, delay: index * 0.1 }}>
							<FeatureCard
								icon={<feature.icon className="h-10 w-10" />}
								title={feature.title}
								description={feature.description}
							/>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}

function FeatureCard({
	icon,
	title,
	description,
}: {
	icon: React.ReactNode;
	title: string;
	description: string;
}) {
	return (
		<div className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl">
			<div className="mb-4 rounded-full bg-primary/10 p-3 text-primary">
				{icon}
			</div>
			<h3 className="mb-2 text-xl font-bold">{title}</h3>
			<p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
		</div>
	);
}
