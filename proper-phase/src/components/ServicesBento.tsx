import React from "react";
import type { ServiceItem } from "../data/services";

type ServicesBentoProps = {
  items: ServiceItem[];
};

export default function ServicesBento({ items }: ServicesBentoProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item, index) => (
        <a
          key={item.id}
          href={item.href ?? "#"}
          className={[
            "group relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm transition-transform",
            "ring-1 ring-black/5 hover:-translate-y-1 hover:shadow-xl",
            index === 0 ? "sm:col-span-2" : "",
            index === items.length - 1 ? "lg:col-span-2" : "",
          ].join(" ")}
        >
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
            <div className="absolute -inset-24 rounded-[48px] bg-gradient-to-br from-[color:var(--cc-orange-100)]/70 via-transparent to-transparent blur-2xl" />
          </div>
          <div className="relative z-10">
            <h3 className="text-lg font-semibold text-orange-600">
              {item.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
              {item.description}
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-orange-600">
              Learn more
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              >
                <path d="M13.5 4.5a1 1 0 0 1 1.414 0l6.086 6.086a1 1 0 0 1 0 1.414L14.914 18.086a1 1 0 1 1-1.414-1.414L17.172 13H3.5a1 1 0 1 1 0-2h13.672l-3.672-3.672a1 1 0 0 1 0-1.414Z" />
              </svg>
            </span>
          </div>
        </a>
      ))}
    </div>
  );
}


