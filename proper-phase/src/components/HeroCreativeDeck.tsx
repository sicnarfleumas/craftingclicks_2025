import { useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCreative, FreeMode, Mousewheel } from "swiper/modules";
import type { SwiperOptions } from "swiper/types";
import "swiper/css";
import "swiper/css/effect-creative";

export type DeckCard = {
  key: string;
  slug: string;
  title: string;
  imageUrl: string;
  tags: string[];
};

type Props = {
  cards: DeckCard[];
};

export default function HeroCreativeDeck({ cards }: Props) {
  const go = useCallback((slug: string) => {
    window.location.href = `/case-studies/${slug}`;
  }, []);

  return (
    <div className="h-full w-full">
      <Swiper
        modules={[EffectCreative, FreeMode, Mousewheel]}
        effect="creative"
        slidesPerView={"auto"}
        centeredSlides
        loop
        freeMode={{ enabled: true, momentum: true } as SwiperOptions["freeMode"]}
        mousewheel={{ forceToAxis: true }}
        grabCursor
        creativeEffect={{
          // Stack to the right like cascading folders
          prev: {
            translate: ["-40%", 0, -200],
            rotate: [0, 25, 0],
            origin: "left center",
            shadow: true,
          },
          next: {
            translate: ["22%", 0, -80],
            rotate: [0, -10, 0],
            origin: "right center",
            shadow: true,
          },
          limitProgress: 3,
          perspective: true,
        }}
        className="h-full"
      >
        {cards.map((c) => (
          <SwiperSlide
            key={c.key}
            style={{ width: "clamp(320px, 85vw, 1100px)", height: "100%" }}
          >
            <button
              type="button"
              onClick={() => go(c.slug)}
              className="group relative h-full w-full overflow-hidden rounded-[22px] border border-black/10 bg-white/90 shadow-[0_18px_50px_rgba(0,0,0,0.18)] transition-transform duration-300 will-change-transform"
            >
              <img src={c.imageUrl} alt={c.title} className="h-full w-full object-cover" loading="lazy" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 border-t border-black/5 bg-gradient-to-t from-black/65 via-black/20 to-transparent p-4">
                <div className="text-lg font-semibold text-white drop-shadow-sm line-clamp-2">{c.title}</div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-white/90">
                  {c.tags.map((t) => (
                    <span key={t} className="rounded-full bg-white/85 px-2 py-0.5 text-neutral-800 shadow">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          </SwiperSlide>
        ))}
      </Swiper>
      <style>{`
        .swiper-slide-active > button { transform: translateY(-8px) scale(1.02); }
        .swiper-slide-next > button { transform: translateY(-4px) scale(1.01); }
      `}</style>
    </div>
  );
}


