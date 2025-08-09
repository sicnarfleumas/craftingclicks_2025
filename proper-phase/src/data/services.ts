export type ServiceItem = {
  id: string;
  title: string;
  description: string;
  href?: string;
};

export const services: ServiceItem[] = [
  {
    id: "strategy",
    title: "Strategy & Consulting",
    description:
      "Clarity-first roadmaps, positioning, and conversion-focused plans that align product, brand, and growth.",
    href: "#contact",
  },
  {
    id: "design",
    title: "Website & eCommerce Design",
    description:
      "Expressive UI, bold typography, and accessible design systems that convert and scale across screens.",
    href: "#contact",
  },
  {
    id: "development",
    title: "Web Development",
    description:
      "Astro + React builds with performance at the core. Islands architecture, clean code, and best practices.",
    href: "#contact",
  },
  {
    id: "branding",
    title: "Branding & Identity",
    description:
      "Distinctive brand systems, logo marks, and visual languages that feel modern, warm, and memorable.",
    href: "#contact",
  },
  {
    id: "growth",
    title: "Growth Marketing",
    description:
      "SEO, content, CRO, and analytics to compound results. Measure, iterate, and improve continuously.",
    href: "#contact",
  },
];


