import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

type Props = {
  brands: string[];
};

export default function TrustedByMarquee({ brands }: Props) {
  // Duplicate the list to make the loop feel continuous
  const items = [...brands, ...brands, ...brands];

  return (
    <div className="relative mx-auto max-w-7xl px-6">
      <Swiper
        modules={[Autoplay]}
        slidesPerView="auto"
        spaceBetween={56}
        loop
        loopAdditionalSlides={brands.length}
        speed={18000}
        autoplay={{ delay: 0, disableOnInteraction: false, pauseOnMouseEnter: true }}
        allowTouchMove={false}
        grabCursor={false}
        className="!py-2"
      >
        {items.map((name, idx) => (
          <SwiperSlide key={`${name}-${idx}`} style={{ width: "auto" }}>
            <span className="text-neutral-800/90 text-lg sm:text-xl md:text-2xl font-semibold tracking-wide whitespace-nowrap">
              {name}
            </span>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}


