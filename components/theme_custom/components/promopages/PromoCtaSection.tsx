"use client";


import texture from "@/assets/Texture.png";
import Image from "next/image";
import Link from "next/link";

interface CtaButton {
  title: string;
  isExternalLink?: boolean;
  link?: string | null;
  textColor?: string | null;
}

interface CtaSection {
  title: string;
  description: string;
  button: CtaButton;
}

interface CasualCtaSectionProps {
  ctaSection: CtaSection;
}

export default function PromoCtaSection({ ctaSection }: CasualCtaSectionProps) {

  return (
    <section
      id="cta"
      className="w-full px-4 sm:px-8 md:px-12 xl:px-16 2xl:px-24 py-16 sm:py-20 lg:py-24 bg-bg2 my-10 relative"
    >
      <Image
        src={texture}
        alt="Texture Frame"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none mix-blend-multiply z-50 rounded-lg"
      />

      <div className="max-w-8xl mx-auto">
        <div className="flx flex-col gap-12 lg:gap-16 items-center justify-center w-full">
          {/* Content Side - Left */}
          <div className="flex flex-col items-center space-y-3">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold font-secondary leading-tight text-bg1">
              {ctaSection.title}
            </h2>

            <p className="text-sm sm:text-xl sm:leading-10 font-normal font-primary text-bg1 text-center">
              {ctaSection.description}
            </p>
          </div>

          {/* CTA Button Side - Right */}
          <div className="flex w-full justify-center items-center mt-5">
           <Link
              href={decodeURI(ctaSection.button.link ?? "")}
              className={`
                md:px-6 px-4 py-1.5 md:py-2 border-2 border-bg1 text-base md:text-lg uppercase bg-bg3 font-primary font-medium rounded-[10px] text-bg1 transition-opacity duration-500`}
              {...(ctaSection.button.link?.startsWith("http")
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {ctaSection.button.title}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
