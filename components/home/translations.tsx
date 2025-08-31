export type Language = "en" | "am" | "fr";

export type TranslationKeys = {
	title: string;
	subtitle: string;
	getStarted: string;
	ourWorks: any;
	learnMore: string;
	features: string;
	events: string;
	teachers: string;
	classes: string;
	pricing: string;
	contact: string;
	keyFeatures: string;
	studentInformationSystemTitle: string;
	studentInformationSystemDescription: string;
	curriculumManagementTitle: string;
	curriculumManagementDescription: string;
	schedulingTimetablesTitle: string;
	schedulingTimetablesDescription: string;
	communicationPortalTitle: string;
	communicationPortalDescription: string;
	performanceAnalyticsTitle: string;
	performanceAnalyticsDescription: string;
	multilingualSupportTitle: string;
	multilingualSupportDescription: string;
	upcomingEvents: string;
	nationalScienceFairTitle: string;
	nationalScienceFairDate: string;
	nationalScienceFairDescription: string;
	parentTeacherConferenceTitle: string;
	parentTeacherConferenceDate: string;
	parentTeacherConferenceDescription: string;
	ethiopianHeritageDayTitle: string;
	ethiopianHeritageDayDate: string;
	ethiopianHeritageDayDescription: string;
	ourDedicatedTeachers: string;
	teacher1Name: string;
	teacher1Subject: string;
	teacher1Description: string;
	teacher2Name: string;
	teacher2Subject: string;
	teacher2Description: string;
	teacher3Name: string;
	teacher3Subject: string;
	teacher3Description: string;
	featuredClasses: string;
	class1Title: string;
	class1Description: string;
	class1Schedule: string;
	class2Title: string;
	class2Description: string;
	class2Schedule: string;
	class3Title: string;
	class3Description: string;
	class3Schedule: string;
	monthlyPricingPlans: string;
	basicPlanTitle: string;
	basicPlanPrice: string;
	basicPlanDescription: string;
	basicPlanFeatures: string[];
	proPlanTitle: string;
	proPlanPrice: string;
	proPlanDescription: string;
	proPlanFeatures: string[];
	enterprisePlanTitle: string;
	enterprisePlanPrice: string;
	enterprisePlanDescription: string;
	enterprisePlanFeatures: string[];
	readyToGetStarted: string;
	contactUs: string;
	requestDemo: string;
	contactSales: string;
	termsOfService: string;
	privacy: string;
	choosePlan: string;
	testimonials: string;
	testimonial1Quote: string;
	testimonial1Author: string;
	testimonial1Role: string;
	testimonial2Quote: string;
	testimonial2Author: string;
	testimonial2Role: string;
	testimonial3Quote: string;
	testimonial3Author: string;
	testimonial3Role: string;
	keyFeaturesDescription?: string;
	upcomingEventsDescription?: string;
	ourDedicatedTeachersDescription?: string;
	featuredClassesDescription?: string;
	pricingDescription?: string;
	footerDescription?: string;
	quickLinks?: string;
	contactInfo?: string;
	newsletter?: string;
	subscribeText?: string;
	emailPlaceholder?: string;
	cookies?: string;
	heroTitle?: string;
	heroDescription?: string;
	heroCardTitle?: string;
	heroCardDescription?: string;
	scrollToExplore?: string;
	stat1Value?: string;
	stat1Label?: string;
	stat2Value?: string;
	stat2Label?: string;
	stat3Value?: string;
	stat3Label?: string;
};

export const translations: Record<Language, TranslationKeys> = {
	en: {
		title: "Creating Strong Citizens",
		subtitle: "Streamline administration, and improve student outcomes",
		getStarted: "Get Started",
		learnMore: "Learn More",
		features: "Features",
		ourWorks: "Our Works",
		events: "Events",
		teachers: "Teachers",
		classes: "Classes",
		pricing: "Pricing",
		contact: "Contact",
		keyFeatures: "Key Features",
		studentInformationSystemTitle: "Student Information System",
		studentInformationSystemDescription:
			"Manage student data, attendance, and academic records effortlessly.",
		curriculumManagementTitle: "Curriculum Management",
		curriculumManagementDescription:
			"Plan and track curriculum implementation across all grade levels.",
		schedulingTimetablesTitle: "Scheduling & Timetables",
		schedulingTimetablesDescription:
			"Create and manage schedules for classes, teachers, and resources.",
		communicationPortalTitle: "Communication Portal",
		communicationPortalDescription:
			"Foster seamless communication between staff, students, and parents.",
		performanceAnalyticsTitle: "Performance Analytics",
		performanceAnalyticsDescription:
			"Gain insights into student and school performance with advanced analytics.",
		multilingualSupportTitle: "Multilingual Support",
		multilingualSupportDescription:
			"Full support for Amharic, Oromo, and other Ethiopian languages.",
		upcomingEvents: "Upcoming Events",
		nationalScienceFairTitle: "National Science Fair",
		nationalScienceFairDate: "Yekatit 23, 2016 E.C. (March 2, 2024)",
		nationalScienceFairDescription:
			"Showcase innovative projects from Ethiopia's brightest young scientists.",
		parentTeacherConferenceTitle: "Parent-Teacher Conference",
		parentTeacherConferenceDate: "Megabit 15-16, 2016 E.C. (March 24-25, 2024)",
		parentTeacherConferenceDescription:
			"Discuss student progress and collaborate on educational goals.",
		ethiopianHeritageDayTitle: "Ethiopian Heritage Day",
		ethiopianHeritageDayDate: "Sene 20, 2016 E.C. (June 27, 2024)",
		ethiopianHeritageDayDescription:
			"Celebrate Ethiopian culture and history through educational activities.",
		ourDedicatedTeachers: "Our Dedicated Teachers",
		teacher1Name: "Dr. Abebe Bekele",
		teacher1Subject: "Biology",
		teacher1Description:
			"Ph.D. in Molecular Biology with 10 years of teaching experience at Addis Ababa University.",
		teacher2Name: "Prof. Tigist Mengesha",
		teacher2Subject: "Mathematics",
		teacher2Description:
			"Award-winning educator specializing in advanced calculus and Ethiopian mathematical traditions.",
		teacher3Name: "Ato Dawit Haile",
		teacher3Subject: "Ethiopian Literature",
		teacher3Description:
			"Published author and passionate advocate for Amharic and Ge'ez literature.",
		featuredClasses: "Featured Classes",
		class1Title: "Advanced Ethiopian History",
		class1Description:
			"In-depth study of Ethiopian history from ancient times to the modern era.",
		class1Schedule: "Monday, Wednesday, Friday 10:00 AM - 11:30 AM",
		class2Title: "Amharic Language and Literature",
		class2Description:
			"Develop your Amharic language skills and explore classic Ethiopian literature.",
		class2Schedule: "Tuesdays 2:00 PM - 4:00 PM",
		class3Title: "Ethiopian Agriculture and Sustainability",
		class3Description:
			"Learn about traditional and modern agricultural practices in Ethiopia.",
		class3Schedule: "Thursdays 3:00 PM - 5:00 PM",
		monthlyPricingPlans: "Monthly Pricing Plans",
		basicPlanTitle: "Basic",
		basicPlanPrice: "1,500 ETB",
		basicPlanDescription: "Perfect for small schools",
		basicPlanFeatures: [
			"Up to 500 students",
			"Basic reporting",
			"Email support",
			"10GB storage",
		],
		proPlanTitle: "Pro",
		proPlanPrice: "3,000 ETB",
		proPlanDescription: "Ideal for growing institutions",
		proPlanFeatures: [
			"Up to 2000 students",
			"Advanced analytics",
			"Priority support",
			"50GB storage",
			"API access",
		],
		enterprisePlanTitle: "Enterprise",
		enterprisePlanPrice: "Custom",
		enterprisePlanDescription: "For large educational networks",
		enterprisePlanFeatures: [
			"Unlimited students",
			"Custom integrations",
			"24/7 dedicated support",
			"Unlimited storage",
			"On-premise option",
		],
		readyToGetStarted: "Ready to Get Started?",
		contactUs:
			"Transform your school management today. Contact us for a demo or to discuss your specific needs.",
		requestDemo: "Request a Demo",
		contactSales: "Contact Sales",
		termsOfService: "Terms of Service",
		privacy: "Privacy",
		choosePlan: "Choose Plan",
		testimonials: "What Our Users Say",
		testimonial1Quote:
			"EduEthiopia has transformed how we manage our school. It's user-friendly and incredibly efficient.",
		testimonial1Author: "Alemayehu Tadesse",
		testimonial1Role: "Principal, Addis Ababa Secondary School",
		testimonial2Quote:
			"The multilingual support has made communication with parents so much easier. It's a game-changer!",
		testimonial2Author: "Tigist Bekele",
		testimonial2Role: "Teacher, Mekelle Elementary School",
		testimonial3Quote:
			"As a parent, I love how easy it is to track my child's progress and communicate with teachers.",
		testimonial3Author: "Yohannes Gebremariam",
		testimonial3Role: "Parent",
		keyFeaturesDescription:
			"Discover what makes our school management system stand out from the rest.",
		upcomingEventsDescription:
			"Join us for these exciting events happening at our school.",
		ourDedicatedTeachersDescription:
			"Meet our exceptional educators who inspire and guide our students.",
		featuredClassesDescription:
			"Explore our diverse range of classes designed to nurture talent and inspire learning.",
		pricingDescription:
			"Choose the perfect plan for your school's needs with our flexible pricing options.",
		footerDescription:
			"Providing quality education and nurturing future leaders since 1995.",
		quickLinks: "Quick Links",
		contactInfo: "Contact Info",
		newsletter: "Newsletter",
		subscribeText: "Subscribe to our newsletter for updates",
		emailPlaceholder: "Your email",
		cookies: "Cookies",
		heroTitle: "Empowering Education in Ethiopia",
		heroDescription:
			"Revolutionize your school's management with our comprehensive, culturally-tailored system.",
		heroCardTitle: "Transforming Education",
		heroCardDescription:
			"Join 500+ schools already benefiting from our platform",
		scrollToExplore: "Scroll to explore",
		stat1Value: "10,000+",
		stat1Label: "Students Impacted",
		stat2Value: "98%",
		stat2Label: "Satisfaction Rate",
		stat3Value: "500+",
		stat3Label: "Partner Schools",
	},
	am: {
		// Amharic translations (unchanged)
		title: "የኢትዮጵያ ትምህርት አስተዳደርን አብዮታዊ ያድርጉ",
		subtitle:
			"ለኢትዮጵያ ትምህርት ቤቶች የተ맞መ የሆነ ሁለንተናዊ የትምህርት ቤት አስተዳደር ስርዓት በመጠቀም አስተዳደርን ያቀላጥፉ፣ ግንኙነትን ያሻሽሉ እና የተማሪዎችን ውጤት ያሻሽሉ።",
		getStarted: "ጀምር",
		learnMore: "ተጨማሪ እወቅ",
		features: "ባህሪያት",
		events: "ዝግጅቶች",
		ourWorks: "የእኛ ስራዎች",
		teachers: "መምህራን",
		classes: "ክፍሎች",
		pricing: "ዋጋ",
		contact: "አግኙን",
		keyFeatures: "ዋና ዋና ባህሪያት",
		studentInformationSystemTitle: "የተማሪ መረጃ ስርዓት",
		studentInformationSystemDescription:
			"የተማሪ መረጃ፣ የመገኘት መዝገብ እና የትምህርት መዛግብትን በቀላሉ ያስተዳድሩ።",
		curriculumManagementTitle: "የሥርዓተ ትምህርት አስተዳደር",
		curriculumManagementDescription:
			"በሁሉም የክፍል ደረጃዎች የሥርዓተ ትምህርት አፈጻጸምን ያቅዱ እና ይከታተሉ።",
		schedulingTimetablesTitle: "የጊዜ ሰሌዳ እና የጊዜ ሰሌዳዎች",
		schedulingTimetablesDescription:
			"ለክፍሎች፣ ለመምህራን እና ለሀብቶች የጊዜ ሰሌዳዎችን ይፍጠሩ እና ያስተዳድሩ።",
		communicationPortalTitle: "የመገናኛ ፖርታል",
		communicationPortalDescription:
			"በሰራተኞች፣ በተማሪዎች እና በወላጆች መካከል ቀልጣፋ ግንኙነትን ያዳብሩ።",
		performanceAnalyticsTitle: "የአፈጻጸም ትንተና",
		performanceAnalyticsDescription:
			"በላቀ ትንተና የተማሪዎችን እና የትምህርት ቤቱን አፈጻጸም ይረዱ።",
		multilingualSupportTitle: "የብዙ ቋንቋ ድጋፍ",
		multilingualSupportDescription: "ለአማርኛ፣ ለኦሮምኛ እና ለሌሎች የኢትዮጵያ ቋንቋዎች ሙሉ ድጋፍ።",
		upcomingEvents: "የሚመጡ ዝግጅቶች",
		nationalScienceFairTitle: "ብሔራዊ የሳይንስ ኤግዚቢሽን",
		nationalScienceFairDate: "የካቲት 23፣ 2016 ዓ.ም. (ማርች 2፣ 2024)",
		nationalScienceFairDescription: "ከኢትዮጵያ ብሩህ ወጣት ሳይንቲስቶች የአዳዲስ ፕሮጀክቶችን ያሳዩ።",
		parentTeacherConferenceTitle: "የወላጅ-መምህር ጉባኤ",
		parentTeacherConferenceDate: "መጋቢት 15-16፣ 2016 ዓ.ም. (ማርች 24-25፣ 2024)",
		parentTeacherConferenceDescription:
			"የተማሪዎችን እድገት ይወያዩ እና በትምህርት ግቦች ላይ ይተባበሩ።",
		ethiopianHeritageDayTitle: "የኢትዮጵያ ቅርስ ቀን",
		ethiopianHeritageDayDate: "ሰኔ 20፣ 2016 ዓ.ም. (ጁን 27፣ 2024)",
		ethiopianHeritageDayDescription:
			"የኢትዮጵያን ባህል እና ታሪክ በትምህርታዊ እንቅስቃሴዎች አማካኝነት ያክብሩ።",
		ourDedicatedTeachers: "የእኛ ታማኝ መምህራን",
		teacher1Name: "ዶ/ር አበበ በቀለ",
		teacher1Subject: "ባዮሎጂ",
		teacher1Description:
			"በሞለኪዩላር ባዮሎጂ የዶክትሬት ዲግሪ ያለው እና በአዲስ አበባ ዩኒቨርሲቲ 10 ዓመታት የማስተማር ልምድ ያለው።",
		teacher2Name: "ፕሮፌሰር ትግስት መንገሻ",
		teacher2Subject: "ሂሳብ",
		teacher2Description:
			"በላቀ ካልኩለስ እና በኢትዮጵያ የሂሳብ ባህሎች የሚያተኩር የሽልማት አሸናፊ አስተማሪ።",
		teacher3Name: "አቶ ዳዊት ኃይሌ",
		teacher3Subject: "የኢትዮጵያ ሥነ ጽሑፍ",
		teacher3Description: "የታተመ ደራሲ እና ለአማርኛ እና ግዕዝ ሥነ ጽሑፍ ታማኝ ደጋፊ።",
		featuredClasses: "ተለይተው የቀረቡ ክፍሎች",
		class1Title: "የላቀ የኢትዮጵያ ታሪክ",
		class1Description: "ከጥንት እስከ ዘመናዊ ዘመን ድረስ ያለውን የኢትዮጵያ ታሪክ ጥልቅ ጥናት።",
		class1Schedule: "ሰኞ፣ ረቡዕ፣ አርብ ከ10:00 AM - 11:30 AM",
		class2Title: "የአማርኛ ቋንቋ እና ሥነ ጽሑፍ",
		class2Description: "የአማርኛ ቋንቋ ክህሎትዎን ያዳብሩ እና የኢትዮጵያን ክላሲክ ሥነ ጽሑፍ ያስሱ።",
		class2Schedule: "ማክሰኞ ከ2:00 PM - 4:00 PM",
		class3Title: "የኢትዮጵያ እርሻ እና ዘላቂነት",
		class3Description: "በኢትዮጵያ ውስጥ ስላሉ ባህላዊ እና ዘመናዊ የእርሻ ልምዶች ይማሩ።",
		class3Schedule: "ሐሙስ ከ3:00 PM - 5:00 PM",
		monthlyPricingPlans: "ወርሃዊ የዋጋ እቅዶች",
		basicPlanTitle: "መሰረታዊ",
		basicPlanPrice: "1,500 ብር",
		basicPlanDescription: "ለአነስተኛ ትምህርት ቤቶች ተስማሚ",
		basicPlanFeatures: [
			"እስከ 500 ተማሪዎች",
			"መሰረታዊ ሪፖርት አደራረግ",
			"በኢሜይል የሚደረግ ድጋፍ",
			"10ጊባ ማከማቻ",
		],
		proPlanTitle: "ፕሮ",
		proPlanPrice: "3,000 ብር",
		proPlanDescription: "ለሚያድጉ ተቋማት 理想的",
		proPlanFeatures: [
			"እስከ 2000 ተማሪዎች",
			"የላቀ ትንተና",
			"ቅድሚያ የሚሰጠው ድጋፍ",
			"50ጊባ ማከማቻ",
			"API መዳረሻ",
		],
		enterprisePlanTitle: "ኢንተርፕራይዝ",
		enterprisePlanPrice: "ብጁ",
		enterprisePlanDescription: "ለትላልቅ የትምህርት አውታረ መረቦች",
		enterprisePlanFeatures: [
			"ያልተገደበ ተማሪዎች",
			"ብጁ ውህደቶች",
			"24/7 የተприсвоено ድጋፍ",
			"ያልተገደበ ማከማቻ",
			"በቦታው የመጫን አማራጭ",
		],
		readyToGetStarted: "ለመጀመር ዝግጁ ነዎት?",
		contactUs:
			"የትምህርት ቤትዎን አስተዳደር ዛሬ ይለውጡ። ለማሳያ ወይም ስለ የእርስዎ ልዩ ፍላጎቶች ለመወያየት ያግኙን።",
		requestDemo: "ማሳያ ይጠይቁ",
		contactSales: "ሽያጭን ያግኙ",
		termsOfService: "የአገልግሎት ውሎች",
		privacy: "ግላዊነት",
		choosePlan: "እቅድ ይምረጡ",
		testimonials: "ተጠቃሚዎቻችን የሚሉት",
		testimonial1Quote:
			"EduEthiopia ትምህርት ቤታችንን እንዴት እንደምናስተዳድር ቀይሯል። ለአጠቃቀም ቀላል እና እጅግ በጣም ውጤታማ ነው።",
		testimonial1Author: "አለማየሁ ታደሰ",
		testimonial1Role: "ርዕሰ መምህር፣ አዲስ አበባ ሁለተኛ ደረጃ ትምህርት ቤት",
		testimonial2Quote: "የብዙ ቋንቋ ድጋፉ ከወላጆች ጋር መግባባትን በጣም አቅልሏል። ትልቅ ለውጥ አምጥቷል!",
		testimonial2Author: "ትግስት በቀለ",
		testimonial2Role: "መምህር፣ መቐለ አንደኛ ደረጃ ትምህርት ቤት",
		testimonial3Quote:
			"እንደ ወላጅ፣ የልጄን እድገት መከታተል እና ከመምህራን ጋር መግባባት እንዴት ቀላል እንደሆነ እወዳለሁ።",
		testimonial3Author: "ዮሐንስ ገብረማርያም",
		testimonial3Role: "ወላጅ",
		keyFeaturesDescription: "የእኛን የትምህርት ቤት አስተዳደር ስርዓት ከሌሎች የሚለየውን ይወቁ።",
		upcomingEventsDescription: "በትምህርት ቤታችን ለሚካሄዱ እነዚህ አስደሳች ዝግጅቶች ይቀላቀሉን።",
		ourDedicatedTeachersDescription: "ተማሪዎቻችንን የሚያነሳሱና የሚመሩ ልዩ አስተማሪዎቻችንን ያግኙ።",
		featuredClassesDescription:
			"ችሎታን ለማዳበርና ትምህርትን ለማነሳሳት የተዘጋጁ የተለያዩ የክፍል ዓይነቶቻችንን ይመልከቱ።",
		pricingDescription:
			"ለትምህርት ቤትዎ ፍላጎቶች ተስማሚ የሆነውን እቅድ ከተለያዩ የዋጋ አማራጮቻችን ይምረጡ።",
		footerDescription: "ከ1995 ጀምሮ ጥራት ያለው ትምህርት በመስጠት የወደፊቱን መሪዎች እያዳበርን ነው።",
		quickLinks: "ፈጣን ማስፈንጠሪያዎች",
		contactInfo: "የመገናኛ መረጃ",
		newsletter: "የዜና መጽሔት",
		subscribeText: "ለዝማኔዎች ለዜና መጽሔታችን ይመዝገቡ",
		emailPlaceholder: "ኢሜይልዎ",
		cookies: "ኩኪዎች",
		heroTitle: "በኢትዮጵያ ትምህርትን ማብቃት",
		heroDescription:
			"በሁለንተናዊ፣ ለባህል ተስማሚ በሆነ ስርዓታችን የትምህርት ቤትዎን አስተዳደር አብዮታዊ ይቀይሩ።",
		heroCardTitle: "ትምህርትን መለወጥ",
		heroCardDescription: "አሁን ከስርዓታችን ጥቅም እያገኙ ካሉት 500+ ትምህርት ቤቶች ጋር ይቀላቀሉ",
		scrollToExplore: "ለማሰስ ይሸብልሉ",
		stat1Value: "10,000+",
		stat1Label: "የተጎዱ ተማሪዎች",
		stat2Value: "98%",
		stat2Label: "የእርካታ መጠን",
		stat3Value: "500+",
		stat3Label: "አጋር ትምህርት ቤቶች",
	},
	fr: {
		// French translations (unchanged)
		title: "Révolutionnez la gestion de l'éducation éthiopienne",
		subtitle:
			"Rationalisez l'administration, améliorez la communication et les résultats des élèves grâce à notre système complet de gestion scolaire adapté aux écoles éthiopiennes.",
		getStarted: "Commencer",
		learnMore: "En savoir plus",
		features: "Fonctionnalités",
		ourWorks: "Nos travaux",
		events: "Événements",
		teachers: "Enseignants",
		classes: "Classes",
		pricing: "Tarification",
		contact: "Contact",
		keyFeatures: "Fonctionnalités clés",
		studentInformationSystemTitle: "Système d'information des étudiants",
		studentInformationSystemDescription:
			"Gérez sans effort les données des étudiants, la présence et les dossiers académiques.",
		curriculumManagementTitle: "Gestion du programme",
		curriculumManagementDescription:
			"Planifiez et suivez la mise en œuvre du programme à tous les niveaux scolaires.",
		schedulingTimetablesTitle: "Planification et emplois du temps",
		schedulingTimetablesDescription:
			"Créez et gérez les horaires des cours, des enseignants et des ressources.",
		communicationPortalTitle: "Portail de communication",
		communicationPortalDescription:
			"Favorisez une communication fluide entre le personnel, les étudiants et les parents.",
		performanceAnalyticsTitle: "Analyse des performances",
		performanceAnalyticsDescription:
			"Obtenez des insights sur les performances des étudiants et de l'école grâce à des analyses avancées.",
		multilingualSupportTitle: "Support multilingue",
		multilingualSupportDescription:
			"Prise en charge complète de l'amharique, de l'oromo et d'autres langues éthiopiennes.",
		upcomingEvents: "Événements à venir",
		nationalScienceFairTitle: "Foire nationale des sciences",
		nationalScienceFairDate: "23 Yekatit 2016 C.E. (2 mars 2024)",
		nationalScienceFairDescription:
			"Présentez des projets innovants des jeunes scientifiques les plus brillants d'Éthiopie.",
		parentTeacherConferenceTitle: "Conférence parents-enseignants",
		parentTeacherConferenceDate: "15-16 Megabit 2016 C.E. (24-25 mars 2024)",
		parentTeacherConferenceDescription:
			"Discutez des progrès des élèves et collaborez sur les objectifs éducatifs.",
		ethiopianHeritageDayTitle: "Journée du patrimoine éthiopien",
		ethiopianHeritageDayDate: "20 Sene 2016 C.E. (27 juin 2024)",
		ethiopianHeritageDayDescription:
			"Célébrez la culture et l'histoire éthiopiennes à travers des activités éducatives.",
		ourDedicatedTeachers: "Nos enseignants dévoués",
		teacher1Name: "Dr Abebe Bekele",
		teacher1Subject: "Biologie",
		teacher1Description:
			"Docteur en biologie moléculaire avec 10 ans d'expérience d'enseignement à l'Université d'Addis-Abeba.",
		teacher2Name: "Prof. Tigist Mengesha",
		teacher2Subject: "Mathématiques",
		teacher2Description:
			"Éducatrice primée spécialisée dans le calcul avancé et les traditions mathématiques éthiopiennes.",
		teacher3Name: "Ato Dawit Haile",
		teacher3Subject: "Littérature éthiopienne",
		teacher3Description:
			"Auteur publié et défenseur passionné de la littérature amharique et guèze.",
		featuredClasses: "Classes en vedette",
		class1Title: "Histoire éthiopienne avancée",
		class1Description:
			"Étude approfondie de l'histoire éthiopienne des temps anciens à l'ère moderne.",
		class1Schedule: "Lundi, mercredi, vendredi 10h00 - 11h30",
		class2Title: "Langue et littérature amharique",
		class2Description:
			"Développez vos compétences en langue amharique et explorez la littérature éthiopienne classique.",
		class2Schedule: "Mardis 14h00 - 16h00",
		class3Title: "Agriculture et durabilité éthiopiennes",
		class3Description:
			"Apprenez les pratiques agricoles traditionnelles et modernes en Éthiopie.",
		class3Schedule: "Jeudis 15h00 - 17h00",
		monthlyPricingPlans: "Plans tarifaires mensuels",
		basicPlanTitle: "Basique",
		basicPlanPrice: "1 500 ETB",
		basicPlanDescription: "Parfait pour les petites écoles",
		basicPlanFeatures: [
			"Jusqu'à 500 étudiants",
			"Rapports de base",
			"Support par e-mail",
			"10 Go de stockage",
		],
		proPlanTitle: "Pro",
		proPlanPrice: "3 000 ETB",
		proPlanDescription: "Idéal pour les institutions en croissance",
		proPlanFeatures: [
			"Jusqu'à 2000 étudiants",
			"Analyses avancées",
			"Support prioritaire",
			"50 Go de stockage",
			"Accès API",
		],
		enterprisePlanTitle: "Entreprise",
		enterprisePlanPrice: "Sur mesure",
		enterprisePlanDescription: "Pour les grands réseaux éducatifs",
		enterprisePlanFeatures: [
			"Étudiants illimités",
			"Intégrations personnalisées",
			"Support dédié 24/7",
			"Stockage illimité",
			"Option sur site",
		],
		readyToGetStarted: "Prêt à commencer ?",
		contactUs:
			"Transformez la gestion de votre école dès aujourd'hui. Contactez-nous pour une démonstration ou pour discuter de vos besoins spécifiques.",
		requestDemo: "Demander une démo",
		contactSales: "Contacter les ventes",
		termsOfService: "Conditions d'utilisation",
		privacy: "Confidentialité",
		choosePlan: "Choisir le plan",
		testimonials: "Ce que disent nos utilisateurs",
		testimonial1Quote:
			"EduEthiopia a transformé notre façon de gérer notre école. C'est convivial et incroyablement efficace.",
		testimonial1Author: "Alemayehu Tadesse",
		testimonial1Role: "Directeur, École secondaire d'Addis-Abeba",
		testimonial2Quote:
			"Le support multilingue a grandement facilité la communication avec les parents. C'est un vrai changement !",
		testimonial2Author: "Tigist Bekele",
		testimonial2Role: "Enseignante, École élémentaire de Mekelle",
		testimonial3Quote:
			"En tant que parent, j'apprécie la facilité avec laquelle je peux suivre les progrès de mon enfant et communiquer avec les enseignants.",
		testimonial3Author: "Yohannes Gebremariam",
		testimonial3Role: "Parent",
		keyFeaturesDescription:
			"Découvrez ce qui distingue notre système de gestion scolaire des autres.",
		upcomingEventsDescription:
			"Rejoignez-nous pour ces événements passionnants qui se déroulent dans notre école.",
		ourDedicatedTeachersDescription:
			"Rencontrez nos éducateurs exceptionnels qui inspirent et guident nos élèves.",
		featuredClassesDescription:
			"Explorez notre gamme diversifiée de cours conçus pour cultiver les talents et inspirer l'apprentissage.",
		pricingDescription:
			"Choisissez le plan parfait pour les besoins de votre école avec nos options de tarification flexibles.",
		footerDescription:
			"Fournir une éducation de qualité et former les futurs leaders depuis 1995.",
		quickLinks: "Liens rapides",
		contactInfo: "Informations de contact",
		newsletter: "Newsletter",
		subscribeText: "Abonnez-vous à notre newsletter pour les mises à jour",
		emailPlaceholder: "Votre email",
		cookies: "Cookies",
		heroTitle: "Autonomiser l'éducation en Éthiopie",
		heroDescription:
			"Révolutionnez la gestion de votre école avec notre système complet et culturellement adapté.",
		heroCardTitle: "Transformer l'éducation",
		heroCardDescription:
			"Rejoignez plus de 500 écoles qui bénéficient déjà de notre plateforme",
		scrollToExplore: "Faites défiler pour explorer",
		stat1Value: "10 000+",
		stat1Label: "Étudiants impactés",
		stat2Value: "98%",
		stat2Label: "Taux de satisfaction",
		stat3Value: "500+",
		stat3Label: "Écoles partenaires",
	},
};

// export type Language = "en" | "am" | "fr";

// export type TranslationKeys = {
// 	title: string;
// 	subtitle: string;
// 	getStarted: string;
// 	ourWorks: any;
// 	learnMore: string;
// 	features: string;
// 	events: string;
// 	teachers: string;
// 	classes: string;
// 	pricing: string;
// 	contact: string;
// 	keyFeatures: string;
// 	studentInformationSystemTitle: string;
// 	studentInformationSystemDescription: string;
// 	curriculumManagementTitle: string;
// 	curriculumManagementDescription: string;
// 	schedulingTimetablesTitle: string;
// 	schedulingTimetablesDescription: string;
// 	communicationPortalTitle: string;
// 	communicationPortalDescription: string;
// 	performanceAnalyticsTitle: string;
// 	performanceAnalyticsDescription: string;
// 	multilingualSupportTitle: string;
// 	multilingualSupportDescription: string;
// 	upcomingEvents: string;
// 	nationalScienceFairTitle: string;
// 	nationalScienceFairDate: string;
// 	nationalScienceFairDescription: string;
// 	parentTeacherConferenceTitle: string;
// 	parentTeacherConferenceDate: string;
// 	parentTeacherConferenceDescription: string;
// 	ethiopianHeritageDayTitle: string;
// 	ethiopianHeritageDayDate: string;
// 	ethiopianHeritageDayDescription: string;
// 	ourDedicatedTeachers: string;
// 	teacher1Name: string;
// 	teacher1Subject: string;
// 	teacher1Description: string;
// 	teacher2Name: string;
// 	teacher2Subject: string;
// 	teacher2Description: string;
// 	teacher3Name: string;
// 	teacher3Subject: string;
// 	teacher3Description: string;
// 	featuredClasses: string;
// 	class1Title: string;
// 	class1Description: string;
// 	class1Schedule: string;
// 	class2Title: string;
// 	class2Description: string;
// 	class2Schedule: string;
// 	class3Title: string;
// 	class3Description: string;
// 	class3Schedule: string;
// 	monthlyPricingPlans: string;
// 	basicPlanTitle: string;
// 	basicPlanPrice: string;
// 	basicPlanDescription: string;
// 	basicPlanFeatures: string[];
// 	proPlanTitle: string;
// 	proPlanPrice: string;
// 	proPlanDescription: string;
// 	proPlanFeatures: string[];
// 	enterprisePlanTitle: string;
// 	enterprisePlanPrice: string;
// 	enterprisePlanDescription: string;
// 	enterprisePlanFeatures: string[];
// 	readyToGetStarted: string;
// 	contactUs: string;
// 	requestDemo: string;
// 	contactSales: string;
// 	termsOfService: string;
// 	privacy: string;
// 	choosePlan: string;
// 	testimonials: string;
// 	testimonial1Quote: string;
// 	testimonial1Author: string;
// 	testimonial1Role: string;
// 	testimonial2Quote: string;
// 	testimonial2Author: string;
// 	testimonial2Role: string;
// 	testimonial3Quote: string;
// 	testimonial3Author: string;
// 	testimonial3Role: string;
// };

// export const translations: Record<Language, TranslationKeys> = {
// 	en: {
// 		title: "Creating Strong Citizen",
// 		subtitle: "Streamline administration, and improve student outcomes",
// 		getStarted: "Get Started",
// 		learnMore: "Learn More",
// 		features: "Features",
// 		ourWorks: "ourWorks",
// 		events: "Events",
// 		teachers: "Teachers",
// 		classes: "Classes",
// 		pricing: "Pricing",
// 		contact: "Contact",
// 		keyFeatures: "Key Features",
// 		studentInformationSystemTitle: "Student Information System",
// 		studentInformationSystemDescription:
// 			"Manage student data, attendance, and academic records effortlessly.",
// 		curriculumManagementTitle: "Curriculum Management",
// 		curriculumManagementDescription:
// 			"Plan and track curriculum implementation across all grade levels.",
// 		schedulingTimetablesTitle: "Scheduling & Timetables",
// 		schedulingTimetablesDescription:
// 			"Create and manage schedules for classes, teachers, and resources.",
// 		communicationPortalTitle: "Communication Portal",
// 		communicationPortalDescription:
// 			"Foster seamless communication between staff, students, and parents.",
// 		performanceAnalyticsTitle: "Performance Analytics",
// 		performanceAnalyticsDescription:
// 			"Gain insights into student and school performance with advanced analytics.",
// 		multilingualSupportTitle: "Multilingual Support",
// 		multilingualSupportDescription:
// 			"Full support for Amharic, Oromo, and other Ethiopian languages.",
// 		upcomingEvents: "Upcoming Events",
// 		nationalScienceFairTitle: "National Science Fair",
// 		nationalScienceFairDate: "Yekatit 23, 2016 E.C. (March 2, 2024)",
// 		nationalScienceFairDescription:
// 			"Showcase innovative projects from Ethiopia's brightest young scientists.",
// 		parentTeacherConferenceTitle: "Parent-Teacher Conference",
// 		parentTeacherConferenceDate: "Megabit 15-16, 2016 E.C. (March 24-25, 2024)",
// 		parentTeacherConferenceDescription:
// 			"Discuss student progress and collaborate on educational goals.",
// 		ethiopianHeritageDayTitle: "Ethiopian Heritage Day",
// 		ethiopianHeritageDayDate: "Sene 20, 2016 E.C. (June 27, 2024)",
// 		ethiopianHeritageDayDescription:
// 			"Celebrate Ethiopian culture and history through educational activities.",
// 		ourDedicatedTeachers: "Our Dedicated Teachers",
// 		teacher1Name: "Dr. Abebe Bekele",
// 		teacher1Subject: "Biology",
// 		teacher1Description:
// 			"Ph.D. in Molecular Biology with 10 years of teaching experience at Addis Ababa University.",
// 		teacher2Name: "Prof. Tigist Mengesha",
// 		teacher2Subject: "Mathematics",
// 		teacher2Description:
// 			"Award-winning educator specializing in advanced calculus and Ethiopian mathematical traditions.",
// 		teacher3Name: "Ato Dawit Haile",
// 		teacher3Subject: "Ethiopian Literature",
// 		teacher3Description:
// 			"Published author and passionate advocate for Amharic and Ge'ez literature.",
// 		featuredClasses: "Featured Classes",
// 		class1Title: "Advanced Ethiopian History",
// 		class1Description:
// 			"In-depth study of Ethiopian history from ancient times to the modern era.",
// 		class1Schedule: "Monday, Wednesday, Friday 10:00 AM - 11:30 AM",
// 		class2Title: "Amharic Language and Literature",
// 		class2Description:
// 			"Develop your Amharic language skills and explore classic Ethiopian literature.",
// 		class2Schedule: "Tuesdays 2:00 PM - 4:00 PM",
// 		class3Title: "Ethiopian Agriculture and Sustainability",
// 		class3Description:
// 			"Learn about traditional and modern agricultural practices in Ethiopia.",
// 		class3Schedule: "Thursdays 3:00 PM - 5:00 PM",
// 		monthlyPricingPlans: "Monthly Pricing Plans",
// 		basicPlanTitle: "Basic",
// 		basicPlanPrice: "1,500 ETB",
// 		basicPlanDescription: "Perfect for small schools",
// 		basicPlanFeatures: [
// 			"Up to 500 students",
// 			"Basic reporting",
// 			"Email support",
// 			"10GB storage",
// 		],
// 		proPlanTitle: "Pro",
// 		proPlanPrice: "3,000 ETB",
// 		proPlanDescription: "Ideal for growing institutions",
// 		proPlanFeatures: [
// 			"Up to 2000 students",
// 			"Advanced analytics",
// 			"Priority support",
// 			"50GB storage",
// 			"API access",
// 		],
// 		enterprisePlanTitle: "Enterprise",
// 		enterprisePlanPrice: "Custom",
// 		enterprisePlanDescription: "For large educational networks",
// 		enterprisePlanFeatures: [
// 			"Unlimited students",
// 			"Custom integrations",
// 			"24/7 dedicated support",
// 			"Unlimited storage",
// 			"On-premise option",
// 		],
// 		readyToGetStarted: "Ready to Get Started?",
// 		contactUs:
// 			"Transform your school management today. Contact us for a demo or to discuss your specific needs.",
// 		requestDemo: "Request a Demo",
// 		contactSales: "Contact Sales",
// 		termsOfService: "Terms of Service",
// 		privacy: "Privacy",
// 		choosePlan: "Choose Plan",
// 		testimonials: "What Our Users Say",
// 		testimonial1Quote:
// 			"EduEthiopia has transformed how we manage our school. It's user-friendly and incredibly efficient.",
// 		testimonial1Author: "Alemayehu Tadesse",
// 		testimonial1Role: "Principal, Addis Ababa Secondary School",
// 		testimonial2Quote:
// 			"The multilingual support has made communication with parents so much easier. It's a game-changer!",
// 		testimonial2Author: "Tigist Bekele",
// 		testimonial2Role: "Teacher, Mekelle Elementary School",
// 		testimonial3Quote:
// 			"As a parent, I love how easy it is to track my child's progress and communicate with teachers.",
// 		testimonial3Author: "Yohannes Gebremariam",
// 		testimonial3Role: "Parent",
// 	},
// 	am: {
// 		title: "የኢትዮጵያ ትምህርት አስተዳደርን አብዮታዊ ያድርጉ",
// 		subtitle:
// 			"ለኢትዮጵያ ትምህርት ቤቶች የተ맞መ የሆነ ሁለንተናዊ የትምህርት ቤት አስተዳደር ስርዓት በመጠቀም አስተዳደርን ያቀላጥፉ፣ ግንኙነትን ያሻሽሉ እና የተማሪዎችን ውጤት ያሻሽሉ።",
// 		getStarted: "ጀምር",
// 		learnMore: "ተጨማሪ እወቅ",
// 		features: "ባህሪያት",
// 		events: "ዝግጅቶች",
// 		ourWorks: "ourWorks",
// 		teachers: "መምህራን",
// 		classes: "ክፍሎች",
// 		pricing: "ዋጋ",
// 		contact: "አግኙን",
// 		keyFeatures: "ዋና ዋና ባህሪያት",
// 		studentInformationSystemTitle: "የተማሪ መረጃ ስርዓት",
// 		studentInformationSystemDescription:
// 			"የተማሪ መረጃ፣ የመገኘት መዝገብ እና የትምህርት መዛግብትን በቀላሉ ያስተዳድሩ።",
// 		curriculumManagementTitle: "የሥርዓተ ትምህርት አስተዳደር",
// 		curriculumManagementDescription:
// 			"በሁሉም የክፍል ደረጃዎች የሥርዓተ ትምህርት አፈጻጸምን ያቅዱ እና ይከታተሉ።",
// 		schedulingTimetablesTitle: "የጊዜ ሰሌዳ እና የጊዜ ሰሌዳዎች",
// 		schedulingTimetablesDescription:
// 			"ለክፍሎች፣ ለመምህራን እና ለሀብቶች የጊዜ ሰሌዳዎችን ይፍጠሩ እና ያስተዳድሩ።",
// 		communicationPortalTitle: "የመገናኛ ፖርታል",
// 		communicationPortalDescription:
// 			"በሰራተኞች፣ በተማሪዎች እና በወላጆች መካከል ቀልጣፋ ግንኙነትን ያዳብሩ።",
// 		performanceAnalyticsTitle: "የአፈጻጸም ትንተና",
// 		performanceAnalyticsDescription:
// 			"በላቀ ትንተና የተማሪዎችን እና የትምህርት ቤቱን አፈጻጸም ይረዱ።",
// 		multilingualSupportTitle: "የብዙ ቋንቋ ድጋፍ",
// 		multilingualSupportDescription: "ለአማርኛ፣ ለኦሮምኛ እና ለሌሎች የኢትዮጵያ ቋንቋዎች ሙሉ ድጋፍ።",
// 		upcomingEvents: "የሚመጡ ዝግጅቶች",
// 		nationalScienceFairTitle: "ብሔራዊ የሳይንስ ኤግዚቢሽን",
// 		nationalScienceFairDate: "የካቲት 23፣ 2016 ዓ.ም. (ማርች 2፣ 2024)",
// 		nationalScienceFairDescription: "ከኢትዮጵያ ብሩህ ወጣት ሳይንቲስቶች የአዳዲስ ፕሮጀክቶችን ያሳዩ።",
// 		parentTeacherConferenceTitle: "የወላጅ-መምህር ጉባኤ",
// 		parentTeacherConferenceDate: "መጋቢት 15-16፣ 2016 ዓ.ም. (ማርች 24-25፣ 2024)",
// 		parentTeacherConferenceDescription:
// 			"የተማሪዎችን እድገት ይወያዩ እና በትምህርት ግቦች ላይ ይተባበሩ።",
// 		ethiopianHeritageDayTitle: "የኢትዮጵያ ቅርስ ቀን",
// 		ethiopianHeritageDayDate: "ሰኔ 20፣ 2016 ዓ.ም. (ጁን 27፣ 2024)",
// 		ethiopianHeritageDayDescription:
// 			"የኢትዮጵያን ባህል እና ታሪክ በትምህርታዊ እንቅስቃሴዎች አማካኝነት ያክብሩ።",
// 		ourDedicatedTeachers: "የእኛ ታማኝ መምህራን",
// 		teacher1Name: "ዶ/ር አበበ በቀለ",
// 		teacher1Subject: "ባዮሎጂ",
// 		teacher1Description:
// 			"በሞለኪዩላር ባዮሎጂ የዶክትሬት ዲግሪ ያለው እና በአዲስ አበባ ዩኒቨርሲቲ 10 ዓመታት የማስተማር ልምድ ያለው።",
// 		teacher2Name: "ፕሮፌሰር ትግስት መንገሻ",
// 		teacher2Subject: "ሂሳብ",
// 		teacher2Description:
// 			"በላቀ ካልኩለስ እና በኢትዮጵያ የሂሳብ ባህሎች የሚያተኩር የሽልማት አሸናፊ አስተማሪ።",
// 		teacher3Name: "አቶ ዳዊት ኃይሌ",
// 		teacher3Subject: "የኢትዮጵያ ሥነ ጽሑፍ",
// 		teacher3Description: "የታተመ ደራሲ እና ለአማርኛ እና ግዕዝ ሥነ ጽሑፍ ታማኝ ደጋፊ።",
// 		featuredClasses: "ተለይተው የቀረቡ ክፍሎች",
// 		class1Title: "የላቀ የኢትዮጵያ ታሪክ",
// 		class1Description: "ከጥንት እስከ ዘመናዊ ዘመን ድረስ ያለውን የኢትዮጵያ ታሪክ ጥልቅ ጥናት።",
// 		class1Schedule: "ሰኞ፣ ረቡዕ፣ አርብ ከ10:00 AM - 11:30 AM",
// 		class2Title: "የአማርኛ ቋንቋ እና ሥነ ጽሑፍ",
// 		class2Description: "የአማርኛ ቋንቋ ክህሎትዎን ያዳብሩ እና የኢትዮጵያን ክላሲክ ሥነ ጽሑፍ ያስሱ።",
// 		class2Schedule: "ማክሰኞ ከ2:00 PM - 4:00 PM",
// 		class3Title: "የኢትዮጵያ እርሻ እና ዘላቂነት",
// 		class3Description: "በኢትዮጵያ ውስጥ ስላሉ ባህላዊ እና ዘመናዊ የእርሻ ልምዶች ይማሩ።",
// 		class3Schedule: "ሐሙስ ከ3:00 PM - 5:00 PM",
// 		monthlyPricingPlans: "ወርሃዊ የዋጋ እቅዶች",
// 		basicPlanTitle: "መሰረታዊ",
// 		basicPlanPrice: "1,500 ብር",
// 		basicPlanDescription: "ለአነስተኛ ትምህርት ቤቶች ተስማሚ",
// 		basicPlanFeatures: [
// 			"እስከ 500 ተማሪዎች",
// 			"መሰረታዊ ሪፖርት አደራረግ",
// 			"በኢሜይል የሚደረግ ድጋፍ",
// 			"10ጊባ ማከማቻ",
// 		],
// 		proPlanTitle: "ፕሮ",
// 		proPlanPrice: "3,000 ብር",
// 		proPlanDescription: "ለሚያድጉ ተቋማት 理想的",
// 		proPlanFeatures: [
// 			"እስከ 2000 ተማሪዎች",
// 			"የላቀ ትንተና",
// 			"ቅድሚያ የሚሰጠው ድጋፍ",
// 			"50ጊባ ማከማቻ",
// 			"API መዳረሻ",
// 		],
// 		enterprisePlanTitle: "ኢንተርፕራይዝ",
// 		enterprisePlanPrice: "ብጁ",
// 		enterprisePlanDescription: "ለትላልቅ የትምህርት አውታረ መረቦች",
// 		enterprisePlanFeatures: [
// 			"ያልተገደበ ተማሪዎች",
// 			"ብጁ ውህደቶች",
// 			"24/7 የተприсвоено ድጋፍ",
// 			"ያልተገደበ ማከማቻ",
// 			"በቦታው የመጫን አማራጭ",
// 		],
// 		readyToGetStarted: "ለመጀመር ዝግጁ ነዎት?",
// 		contactUs:
// 			"የትምህርት ቤትዎን አስተዳደር ዛሬ ይለውጡ። ለማሳያ ወይም ስለ የእርስዎ ልዩ ፍላጎቶች ለመወያየት ያግኙን።",
// 		requestDemo: "ማሳያ ይጠይቁ",
// 		contactSales: "ሽያጭን ያግኙ",
// 		termsOfService: "የአገልግሎት ውሎች",
// 		privacy: "ግላዊነት",
// 		choosePlan: "እቅድ ይምረጡ",
// 		testimonials: "ተጠቃሚዎቻችን የሚሉት",
// 		testimonial1Quote:
// 			"EduEthiopia ትምህርት ቤታችንን እንዴት እንደምናስተዳድር ቀይሯል። ለአጠቃቀም ቀላል እና እጅግ በጣም ውጤታማ ነው።",
// 		testimonial1Author: "አለማየሁ ታደሰ",
// 		testimonial1Role: "ርዕሰ መምህር፣ አዲስ አበባ ሁለተኛ ደረጃ ትምህርት ቤት",
// 		testimonial2Quote: "የብዙ ቋንቋ ድጋፉ ከወላጆች ጋር መግባባትን በጣም አቅልሏል። ትልቅ ለውጥ አምጥቷል!",
// 		testimonial2Author: "ትግስት በቀለ",
// 		testimonial2Role: "መምህር፣ መቐለ አንደኛ ደረጃ ትምህርት ቤት",
// 		testimonial3Quote:
// 			"እንደ ወላጅ፣ የልጄን እድገት መከታተል እና ከመምህራን ጋር መግባባት እንዴት ቀላል እንደሆነ እወዳለሁ።",
// 		testimonial3Author: "ዮሐንስ ገብረማርያም",
// 		testimonial3Role: "ወላጅ",
// 	},
// 	fr: {
// 		title: "Révolutionnez la gestion de l'éducation éthiopienne",
// 		subtitle:
// 			"Rationalisez l'administration, améliorez la communication et les résultats des élèves grâce à notre système complet de gestion scolaire adapté aux écoles éthiopiennes.",
// 		getStarted: "Commencer",
// 		learnMore: "En savoir plus",
// 		features: "Fonctionnalités",
// 		ourWorks: "ourWorks",
// 		events: "Événements",
// 		teachers: "Enseignants",
// 		classes: "Classes",
// 		pricing: "Tarification",
// 		contact: "Contact",
// 		keyFeatures: "Fonctionnalités clés",
// 		studentInformationSystemTitle: "Système d'information des étudiants",
// 		studentInformationSystemDescription:
// 			"Gérez sans effort les données des étudiants, la présence et les dossiers académiques.",
// 		curriculumManagementTitle: "Gestion du programme",
// 		curriculumManagementDescription:
// 			"Planifiez et suivez la mise en œuvre du programme à tous les niveaux scolaires.",
// 		schedulingTimetablesTitle: "Planification et emplois du temps",
// 		schedulingTimetablesDescription:
// 			"Créez et gérez les horaires des cours, des enseignants et des ressources.",
// 		communicationPortalTitle: "Portail de communication",
// 		communicationPortalDescription:
// 			"Favorisez une communication fluide entre le personnel, les étudiants et les parents.",
// 		performanceAnalyticsTitle: "Analyse des performances",
// 		performanceAnalyticsDescription:
// 			"Obtenez des insights sur les performances des étudiants et de l'école grâce à des analyses avancées.",
// 		multilingualSupportTitle: "Support multilingue",
// 		multilingualSupportDescription:
// 			"Prise en charge complète de l'amharique, de l'oromo et d'autres langues éthiopiennes.",
// 		upcomingEvents: "Événements à venir",
// 		nationalScienceFairTitle: "Foire nationale des sciences",
// 		nationalScienceFairDate: "23 Yekatit 2016 C.E. (2 mars 2024)",
// 		nationalScienceFairDescription:
// 			"Présentez des projets innovants des jeunes scientifiques les plus brillants d'Éthiopie.",
// 		parentTeacherConferenceTitle: "Conférence parents-enseignants",
// 		parentTeacherConferenceDate: "15-16 Megabit 2016 C.E. (24-25 mars 2024)",
// 		parentTeacherConferenceDescription:
// 			"Discutez des progrès des élèves et collaborez sur les objectifs éducatifs.",
// 		ethiopianHeritageDayTitle: "Journée du patrimoine éthiopien",
// 		ethiopianHeritageDayDate: "20 Sene 2016 C.E. (27 juin 2024)",
// 		ethiopianHeritageDayDescription:
// 			"Célébrez la culture et l'histoire éthiopiennes à travers des activités éducatives.",
// 		ourDedicatedTeachers: "Nos enseignants dévoués",
// 		teacher1Name: "Dr Abebe Bekele",
// 		teacher1Subject: "Biologie",
// 		teacher1Description:
// 			"Docteur en biologie moléculaire avec 10 ans d'expérience d'enseignement à l'Université d'Addis-Abeba.",
// 		teacher2Name: "Prof. Tigist Mengesha",
// 		teacher2Subject: "Mathématiques",
// 		teacher2Description:
// 			"Éducatrice primée spécialisée dans le calcul avancé et les traditions mathématiques éthiopiennes.",
// 		teacher3Name: "Ato Dawit Haile",
// 		teacher3Subject: "Littérature éthiopienne",
// 		teacher3Description:
// 			"Auteur publié et défenseur passionné de la littérature amharique et guèze.",
// 		featuredClasses: "Classes en vedette",
// 		class1Title: "Histoire éthiopienne avancée",
// 		class1Description:
// 			"Étude approfondie de l'histoire éthiopienne des temps anciens à l'ère moderne.",
// 		class1Schedule: "Lundi, mercredi, vendredi 10h00 - 11h30",
// 		class2Title: "Langue et littérature amharique",
// 		class2Description:
// 			"Développez vos compétences en langue amharique et explorez la littérature éthiopienne classique.",
// 		class2Schedule: "Mardis 14h00 - 16h00",
// 		class3Title: "Agriculture et durabilité éthiopiennes",
// 		class3Description:
// 			"Apprenez les pratiques agricoles traditionnelles et modernes en Éthiopie.",
// 		class3Schedule: "Jeudis 15h00 - 17h00",
// 		monthlyPricingPlans: "Plans tarifaires mensuels",
// 		basicPlanTitle: "Basique",
// 		basicPlanPrice: "1 500 ETB",
// 		basicPlanDescription: "Parfait pour les petites écoles",
// 		basicPlanFeatures: [
// 			"Jusqu'à 500 étudiants",
// 			"Rapports de base",
// 			"Support par e-mail",
// 			"10 Go de stockage",
// 		],
// 		proPlanTitle: "Pro",
// 		proPlanPrice: "3 000 ETB",
// 		proPlanDescription: "Idéal pour les institutions en croissance",
// 		proPlanFeatures: [
// 			"Jusqu'à 2000 étudiants",
// 			"Analyses avancées",
// 			"Support prioritaire",
// 			"50 Go de stockage",
// 			"Accès API",
// 		],
// 		enterprisePlanTitle: "Entreprise",
// 		enterprisePlanPrice: "Sur mesure",
// 		enterprisePlanDescription: "Pour les grands réseaux éducatifs",
// 		enterprisePlanFeatures: [
// 			"Étudiants illimités",
// 			"Intégrations personnalisées",
// 			"Support dédié 24/7",
// 			"Stockage illimité",
// 			"Option sur site",
// 		],
// 		readyToGetStarted: "Prêt à commencer ?",
// 		contactUs:
// 			"Transformez la gestion de votre école dès aujourd'hui. Contactez-nous pour une démonstration ou pour discuter de vos besoins spécifiques.",
// 		requestDemo: "Demander une démo",
// 		contactSales: "Contacter les ventes",
// 		termsOfService: "Conditions d'utilisation",
// 		privacy: "Confidentialité",
// 		choosePlan: "Choisir le plan",
// 		testimonials: "Ce que disent nos utilisateurs",
// 		testimonial1Quote:
// 			"EduEthiopia a transformé notre façon de gérer notre école. C'est convivial et incroyablement efficace.",
// 		testimonial1Author: "Alemayehu Tadesse",
// 		testimonial1Role: "Directeur, École secondaire d'Addis-Abeba",
// 		testimonial2Quote:
// 			"Le support multilingue a grandement facilité la communication avec les parents. C'est un vrai changement !",
// 		testimonial2Author: "Tigist Bekele",
// 		testimonial2Role: "Enseignante, École élémentaire de Mekelle",
// 		testimonial3Quote:
// 			"En tant que parent, j'apprécie la facilité avec laquelle je peux suivre les progrès de mon enfant et communiquer avec les enseignants.",
// 		testimonial3Author: "Yohannes Gebremariam",
// 		testimonial3Role: "Parent",
// 	},
// };
