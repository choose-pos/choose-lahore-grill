"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FaLocationDot } from "react-icons/fa6";

interface IBanner {
  title: string;
  title2?: string;
  title3?: string;
  isVideo: boolean;
  heroBannerDesktop: {
    url: string;
  };
  heroBannerMobile: {
    url: string;
  };
  heroBannerDesktop2?: {
    url: string;
  };
  heroBannerMobile2?: {
    url: string;
  };
  heroBannerDesktop3?: {
    url: string;
  };
  heroBannerMobile3?: {
    url: string;
  };
  onlineOrderLink: string;
  address?: string;
  subtilte: string;
}

const Banner: React.FC<IBanner> = ({
  heroBannerDesktop,
  heroBannerMobile,
  isVideo,
  title,
  heroBannerDesktop2,
  heroBannerMobile2,
  heroBannerDesktop3,
  heroBannerMobile3,
  title2,
  title3,
  onlineOrderLink,
  address,
  subtilte,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    { desktop: heroBannerDesktop, mobile: heroBannerMobile, title },
    heroBannerDesktop2
      ? {
          desktop: heroBannerDesktop2,
          mobile: heroBannerMobile2,
          title: title2,
        }
      : null,
    heroBannerDesktop3
      ? {
          desktop: heroBannerDesktop3,
          mobile: heroBannerMobile3,
          title: title3,
        }
      : null,
  ].filter(Boolean);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const renderBackground = (slide: any) => {
    if (isVideo) {
      return (
        <video
          className="absolute top-0 left-0 w-full h-full object-cover"
          src={heroBannerDesktop.url}
          autoPlay
          loop
          muted
          playsInline
        />
      );
    }

    return (
      <>
        <Image
          src={slide.desktop.url}
          alt="Hero Background"
          fill
          priority
          className={`absolute top-0 left-0 w-full h-full object-cover ${
            slide.mobile ? "hidden md:block" : "block"
          }`}
        />
        {slide.mobile && (
          <Image
            src={slide.mobile.url}
            alt="Hero Background Mobile"
            fill
            priority
            className="absolute top-0 left-0 w-full h-full object-cover md:hidden"
          />
        )}
      </>
    );
  };

  const renderVideoBg = () => {
    if (isVideo) {
      return (
        <video
          className="absolute inset-0 bg-black w-full h-full object-cover"
          src={heroBannerDesktop.url}
          autoPlay
          loop
          muted
          playsInline
        />
      );
    }
  };

  return (
    <div className="relative w-full h-[90vh] md:h-screen overflow-hidden -mt-1">
      {isVideo
        ? renderVideoBg()
        : slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute top-0 left-0 w-full h-full transition-opacity duration-500 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              {renderBackground(slide)}
            </div>
          ))}

      <div className="bg-black bg-opacity-30 absolute z-10 w-full h-full ">
        <div className="absolute bottom-20 left-4 lg:left-16 xl:left-32 z-10 flex items-center justify-center">
          <div className="text-start">
            <h1 className="text-white max-w-[800px] text-4xl md:text-7xl font-secondary">
              {isVideo ? title : slides[currentSlide]?.title}
            </h1>
            <p className="text-white text-base md:text-xl font-primary flex items-center max-w-3xl">
              {/* <FaLocationDot className="text-primaryColor mr-1" /> */}
              {subtilte}
            </p>

            <div className="flex items-start justify-start space-x-2 md:space-x-4">
              <Link
                // target="_blank"
                href={`/menu`}
                aria-label="Kwality Link"
              >
                <button
                  aria-label="Kwality"
                  className="mt-4 px-8 py-3 tracking-wide text-sm xsm:text-lg md:text-xl font-medium font-primary border-2 border-bg1 text-bg1 bg-bg3 rounded-[15px] shadow-xl"
                >
                  Delivery
                </button>
              </Link>
              <Link aria-label="Order Link" href={`/menu`}>
                <button
                  aria-label="Order Now"
                  className="mt-4 px-8 py-3 tracking-wide text-sm xsm:text-lg md:text-xl font-medium font-primary border-2 text-bg3 bg-primaryColor rounded-[15px] shadow-xl"
                >
                  TAKEOUT
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
