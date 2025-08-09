import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import type { PanInfo } from "framer-motion";

export type CaseCard = {
  id: string;
  title: string;
  imageUrl?: string;
  tags: string[];
};

type InfiniteCanvasProps = {
  cards: CaseCard[];
};

export default function InfiniteCanvas({ cards }: InfiniteCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Track horizontal drag/throw for the stacked deck.
  const x = useSpring(0, { stiffness: 120, damping: 20, mass: 0.8 });
  const velocityX = useMotionValue(0);

  const [isDragging, setIsDragging] = useState(false);
  const [overlay, setOverlay] = useState<
    | {
        card: CaseCard;
        rect: { left: number; top: number; width: number; height: number };
      }
    | null
  >(null);

  useEffect(() => {
    const loop = () => {
      x.set(x.get() + velocityX.get());
      // friction
      velocityX.set(velocityX.get() * 0.95);
      requestAnimationFrame(loop);
    };
    const id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [x, velocityX]);

  const onDragStart = () => setIsDragging(true);
  const onDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    velocityX.set(info.velocity.x * 0.3);
  };

  function beginExpansionAndNavigate(card: CaseCard, el: HTMLElement) {
    const rect = el.getBoundingClientRect();
    setOverlay({
      card,
      rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
    });
  }

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden" style={{ perspective: 1400 }}>
      <motion.div
        className="absolute left-[8%] top-1/2 -translate-y-1/2 will-change-transform"
        style={{ x }}
        drag="x"
        dragMomentum={false}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="pointer-events-none absolute -inset-[200vmax] bg-[radial-gradient(60%_50%_at_50%_50%,rgba(255,255,255,0.6),transparent_70%)]" />
        <div className="relative p-8" style={{ transformStyle: "preserve-3d" as const }}>
          {cards.map((card, index) => (
            <motion.button
              key={card.id}
              type="button"
              className="group absolute h-60 w-[30rem] rounded-[22px] border border-black/10 bg-white/90 shadow-[0_18px_50px_rgba(0,0,0,0.18)] backdrop-blur overflow-hidden text-left"
              whileHover={{ y: -14, scale: 1.04, rotateY: -6 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              onClick={(e) => beginExpansionAndNavigate(card, e.currentTarget)}
              aria-label={`${card.title} case study`}
              style={{
                transformStyle: "preserve-3d",
                transform: `translateX(${index * 220}px) translateY(${index * 18}px) translateZ(${-index * 60}px) rotateY(-14deg)`,
              }}
            >
              {card.imageUrl ? (
                <img
                  src={card.imageUrl}
                  alt={card.title}
                  className="h-full w-full object-cover opacity-95 transition-opacity duration-300 group-hover:opacity-100"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-neutral-500">
                  <span className="text-sm">{card.title}</span>
                </div>
              )}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 border-t border-black/5 bg-gradient-to-t from-black/65 via-black/20 to-transparent p-4">
                <div className="font-semibold text-white drop-shadow-sm text-lg leading-tight line-clamp-2">
                  {card.title}
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-white/90">
                  {card.tags.map((t) => (
                    <span key={t} className="rounded-full bg-white/80 text-neutral-800 px-2 py-0.5 shadow">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </motion.button>
          ))}
          {/* Spacer to ensure container has width for stacking */}
          <div style={{ width: cards.length * 220 + 1000, height: 1 }} />
        </div>
      </motion.div>

      <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-black/5" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/60" />
      {/* Edge fades */}
      <div className="pointer-events-none absolute inset-y-2 left-0 w-40 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-2 right-0 w-40 bg-gradient-to-l from-white to-transparent" />

      <AnimatePresence>
        {overlay && (
          <motion.div
            className="fixed z-50 overflow-hidden rounded-2xl bg-white shadow-2xl"
            initial={{
              left: overlay.rect.left,
              top: overlay.rect.top,
              width: overlay.rect.width,
              height: overlay.rect.height,
              position: "fixed" as const,
              borderRadius: 16,
            }}
            animate={{
              left: 0,
              top: 0,
              width: "100%",
              height: "100%",
              borderRadius: 0,
              transition: { duration: 0.35, ease: [0.2, 0.8, 0.2, 1] },
            }}
            exit={{ opacity: 0 }}
            onAnimationComplete={() => {
              const slug = overlay.card.id;
              window.location.href = `/case-studies/${slug}`;
            }}
          >
            {overlay.card.imageUrl ? (
              <div
                className="h-full w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${overlay.card.imageUrl})` }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-neutral-100">
                <span className="text-lg font-semibold text-neutral-700">{overlay.card.title}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


