import { useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, FreeMode } from "swiper/modules";
import type { SwiperOptions } from "swiper/types";
import "swiper/css";
import "swiper/css/effect-coverflow";

export type HeroCard = {
  key: string; // unique for rendering
  slug: string; // navigation target
  title: string;
  imageUrl: string;
  tags: string[];
};

type Props = {
  cards: HeroCard[];
};

export default function HeroCoverflow({ cards }: Props) {
  const onClickCard = useCallback((slug: string) => {
    window.location.href = `/case-studies/${slug}`;
  }, []);

  return (
    <div className="h-full w-full">
      <Swiper
        modules={[EffectCoverflow, FreeMode]}
        effect="coverflow"
        centeredSlides
        slidesPerView={"auto"}
        freeMode={{ enabled: true, momentum: true } as SwiperOptions["freeMode"]}
        coverflowEffect={{ rotate: 0, stretch: -40, depth: 220, modifier: 1.2, slideShadows: false }}
        grabCursor
        className="h-full"
     >
        {cards.map((c) => (
          <SwiperSlide key={c.key} style={{ width: 520, height: 260 }}>
            <button
              type="button"
              className="group relative h-full w-full overflow-hidden rounded-[22px] border border-black/10 bg-white/90 shadow-[0_18px_50px_rgba(0,0,0,0.18)]"
              onClick={() => onClickCard(c.slug)}
            >
              <img src={c.imageUrl} alt={c.title} className="h-full w-full object-cover" loading="lazy" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 border-t border-black/5 bg-gradient-to-t from-black/65 via-black/20 to-transparent p-4">
                <div className="font-semibold text-white drop-shadow-sm text-lg leading-tight line-clamp-2">{c.title}</div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-white/90">
                  {c.tags.map((t) => (
                    <span key={t} className="rounded-full bg-white/80 text-neutral-800 px-2 py-0.5 shadow">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}


