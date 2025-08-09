import { useEffect, useRef, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import type { Swiper as SwiperCore } from "swiper/types";
import "swiper/css";

export type SuperFlowCard = {
  key: string;
  slug: string;
  title: string;
  imageUrl: string;
  tags: string[];
};

type Props = {
  cards: SuperFlowCard[];
};

// A lightweight approximation of "Super Flow" from UI Initiative
// Reference: https://uiinitiative.com/catalog/super-flow
// This fragments each slide image into triangles that scale/translate by slide progress for depth.
export default function HeroSuperFlow({ cards }: Props) {
  const swiperRef = useRef<SwiperCore | null>(null);

  const updateFragments = useCallback((swiper: SwiperCore) => {
    swiper.slides.forEach((slideEl) => {
      // @ts-expect-error Swiper sets progress on HTMLElement
      const progress: number = slideEl.progress ?? 0;
      const fragments = slideEl.querySelectorAll<HTMLElement>("[data-frag]");
      fragments.forEach((frag) => {
        const depth = Number(frag.dataset.depth || "1");
        const dir = frag.dataset.dir === "-1" ? -1 : 1;
        const translateX = progress * 80 * depth * dir; // px
        const translateY = progress * 14 * depth; // px
        const scale = 1 + Math.min(Math.abs(progress) * 0.35 * depth, 0.6);
        frag.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`;
      });
    });
  }, []);

  useEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper) return;
    const onSetTranslate = () => updateFragments(swiper);
    const onProgress = () => updateFragments(swiper);
    swiper.on("setTranslate", onSetTranslate);
    swiper.on("progress", onProgress);
    updateFragments(swiper);
    return () => {
      swiper.off("setTranslate", onSetTranslate);
      swiper.off("progress", onProgress);
    };
  }, [updateFragments]);

  const onInit = (swiper: SwiperCore) => {
    swiperRef.current = swiper;
    updateFragments(swiper);
  };

  const onClick = (slug: string) => (window.location.href = `/case-studies/${slug}`);

  return (
    <div className="h-full w-full">
      <Swiper
        modules={[Autoplay]}
        onInit={onInit}
        slidesPerView={1}
        centeredSlides
        loop
        speed={900}
        autoplay={{ delay: 3500, disableOnInteraction: false }}
        grabCursor
        className="h-full"
      >
        {cards.map((c) => (
          <SwiperSlide key={c.key} className="flex items-center justify-center">
            <button
              type="button"
              className="group relative h-[60vh] w-[85%] max-w-[1100px] overflow-hidden rounded-[26px] border border-black/10 bg-black/5 shadow-[0_18px_50px_rgba(0,0,0,0.18)]"
              onClick={() => onClick(c.slug)}
            >
              {/* Base image as a backdrop */}
              <img src={c.imageUrl} alt={c.title} className="absolute inset-0 h-full w-full object-cover opacity-90" loading="lazy" />
              {/* Six triangle fragments layered above for depth */}
              <Frag img={c.imageUrl} depth={1} dir={1} points="0% 0%, 50% 0%, 0% 50%" />
              <Frag img={c.imageUrl} depth={1} dir={-1} points="50% 0%, 100% 0%, 100% 50%" />
              <Frag img={c.imageUrl} depth={1.4} dir={1} points="0% 50%, 50% 0%, 50% 100%" />
              <Frag img={c.imageUrl} depth={1.4} dir={-1} points="50% 100%, 50% 0%, 100% 50%" />
              <Frag img={c.imageUrl} depth={1.8} dir={1} points="0% 50%, 0% 100%, 50% 100%" />
              <Frag img={c.imageUrl} depth={1.8} dir={-1} points="50% 100%, 100% 50%, 100% 100%" />

              <div className="pointer-events-none absolute inset-x-0 bottom-0 border-t border-black/10 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-6">
                <div className="text-xl font-semibold text-white drop-shadow-sm">{c.title}</div>
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
    </div>
  );
}

type FragProps = { img: string; depth: number; dir: 1 | -1; points: string };
function Frag({ img, depth, dir, points }: FragProps) {
  const style: React.CSSProperties = {
    clipPath: `polygon(${points})`,
    backgroundImage: `url(${img})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };
  return (
    <div
      data-frag
      data-depth={depth}
      data-dir={dir}
      className="absolute inset-0 will-change-transform"
      style={style}
    />
  );
}


