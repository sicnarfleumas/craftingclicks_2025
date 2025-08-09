export type CaseStudyMeta = {
  slug: string;
  title: string;
  client: string;
  description: string;
  tags: string[];
  coverImage: string; // resolved URL
};

// Import covers from the existing content asset folders
// Vite will resolve these to URL strings
import bibiliciousCoverUrl from "../assets/case-studies/bibilicious/homepage-bento.png";
import quintAllyCoverUrl from "../assets/case-studies/quint-ally/quintally-hero.png";
import bigbMmaCoverUrl from "../assets/case-studies/bigb-mma/mobile-lightmode.png";

export const caseStudies: CaseStudyMeta[] = [
  {
    slug: "bibilicious",
    title: "Bridging Languages and Cultures Through Elegant Translation",
    client: "Bibilicious",
    description:
      "Multilingual translation service site with Japanese-inspired design and perfect performance scores.",
    tags: [
      "Multilingual Website",
      "Japanese-Inspired Design",
      "Performance Optimization",
      "Content Management",
      "i18n",
    ],
    coverImage: (bibiliciousCoverUrl as unknown as string),
  },
  {
    slug: "quint-ally",
    title: "Personalized Digital Experience for High-Net-Worth Clients",
    client: "Quint Ally",
    description:
      "Conversion-focused site tailored for premium vendors, allies, and gold members.",
    tags: ["Multi-Persona Design", "Premium Platform", "Hyper-Personalization", "High-Performance"],
    coverImage: (quintAllyCoverUrl as unknown as string),
  },
  {
    slug: "bigb-mma",
    title: "Building a High-Performance Website for an MMA Gym",
    client: "BigB MMA",
    description:
      "Mobile-first design, near-perfect PageSpeed scores, and simple content management.",
    tags: [
      "Mobile-First Design",
      "Performance Optimization",
      "Content Management",
      "Dark/Light Mode",
      "Structured Data",
    ],
    coverImage: (bigbMmaCoverUrl as unknown as string),
  },
];


