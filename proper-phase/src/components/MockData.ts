import type { CaseCard } from "./InfiniteCanvas";

export const demoCards: CaseCard[] = Array.from({ length: 24 }).map((_, i) => ({
  id: `demo-${i + 1}`,
  title: `Project ${i + 1}`,
  imageUrl: `https://images.unsplash.com/photo-150${(i + 10)
    .toString()
    .padStart(3, "0")}-1043-1${(i % 9) + 1}b?auto=format&fit=crop&w=1200&q=60`,
  tags: ["Web", i % 2 ? "Design" : "Dev", i % 3 ? "Ecom" : "Brand"],
}));


