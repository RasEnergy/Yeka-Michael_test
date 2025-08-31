// const images = [
//     { src: "/assets/images/1.jpg?height=400&width=600", alt: "School event 1" },
//     {
//         src: "/assets/images/2.jpg?height=400&width=600",
//         alt: "Students in classroom",
//     },
//     { src: "/assets/images/3.jpg?height=400&width=600", alt: "Sports activity" },
//     { src: "/assets/images/4.jpg?height=400&width=600", alt: "Art exhibition" },
//     { src: "/assets/images/5.jpg?height=400&width=600", alt: "Science fair" },
//     {
//         src: "/assets/images/6.jpg?height=400&width=600",
//         alt: "Graduation ceremony",
//     },
// ];
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import type { TranslationKeys } from "@/components/home/translations";
import { X } from "lucide-react";

interface WorksSectionProps {
	t: TranslationKeys;
}

const images = [
	{
		src: "/assets/images/1.jpg?height=600&width=400",
		alt: "School event 1",
		width: 400,
		height: 600,
	},
	{
		src: "/assets/images/2.jpg?height=400&width=600",
		alt: "Students in classroom",
		width: 600,
		height: 400,
	},
	{
		src: "/assets/images/3.jpg?height=800&width=600",
		alt: "Sports activity",
		width: 600,
		height: 800,
	},
	{
		src: "/assets/images/4.jpg?height=400&width=600",
		alt: "Art exhibition",
		width: 600,
		height: 400,
	},
	{
		src: "/assets/images/5.jpg?height=600&width=400",
		alt: "Science fair",
		width: 400,
		height: 600,
	},
	{
		src: "/assets/images/6.jpg?height=400&width=600",
		alt: "Graduation ceremony",
		width: 600,
		height: 400,
	},
];

export function WorksSection({ t }: WorksSectionProps) {
	const [selectedImage, setSelectedImage] = useState<string | null>(null);

	return (
		<section
			id="works"
			className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-[#141f42] to-[#1c2b5a]">
			<div className="container px-4 md:px-6 mx-auto">
				<h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12 text-white">
					{t.ourWorks}
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[200px] md:auto-rows-[250px]">
					{images.map((image, index) => (
						<motion.div
							key={index}
							className={`relative overflow-hidden rounded-lg cursor-pointer ${
								index % 3 === 0 ? "md:col-span-2 md:row-span-2" : ""
							}`}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={() => setSelectedImage(image.src)}>
							<Image
								src={image.src || "/placeholder.svg"}
								alt={image.alt}
								width={image.width}
								height={image.height}
								className="object-cover w-full h-full transition-transform duration-300 hover:scale-110"
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end justify-start p-4">
								<p className="text-white text-lg font-semibold drop-shadow-lg">
									{image.alt}
								</p>
							</div>
						</motion.div>
					))}
				</div>
			</div>
			{selectedImage && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
					onClick={() => setSelectedImage(null)}>
					<motion.div
						initial={{ scale: 0.8, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 0.8, opacity: 0 }}
						className="relative max-w-4xl w-full bg-white rounded-lg overflow-hidden shadow-2xl">
						<Image
							src={selectedImage || "/placeholder.svg"}
							alt="Selected work"
							width={800}
							height={600}
							className="w-full h-auto"
						/>
						<button
							className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors duration-200"
							onClick={(e) => {
								e.stopPropagation();
								setSelectedImage(null);
							}}>
							<X size={24} />
						</button>
					</motion.div>
				</motion.div>
			)}
		</section>
	);
}
