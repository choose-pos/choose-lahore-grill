"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface PromoImageItem {
  desktop: string;
  mobile?: string | null;
}

interface PromoImageSectionProps {
  PromoImageSection: PromoImageItem[];
}

export default function ImageSection({
  PromoImageSection,
}: PromoImageSectionProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto-slide effect for multiple images
  useEffect(() => {
    if (PromoImageSection.length > 1) {
      const intervalId = setInterval(() => {
        setCurrentImageIndex(
          (prevIndex) => (prevIndex + 1) % PromoImageSection.length
        );
      }, 5000); // Change image every 3 seconds

      return () => clearInterval(intervalId);
    }
  }, [PromoImageSection.length]);

  const slideVariants = {
    enter: {
      x: 300,
      opacity: 0,
    },
    center: {
      x: 0,
      opacity: 1,
    },
    exit: {
      x: -300,
      opacity: 0,
    },
  };

  // If only one image, render it statically
  if (PromoImageSection.length === 1) {
    const image = PromoImageSection[0];
    return (
      <section
        id="promoimages"
        className="lg:px-24 xsm:px-12 px-6 flex flex-col items-center max-w-8xl mx-auto justify-center"
      >
        <div className="w-full justify-center flex">
          <Image
            src={image.desktop}
            alt="Promo"
            width={1240}
            height={800}
            className="md:rounded-[70px] max-h-screen min-h-[300px] hidden md:block rounded-[10px] object-cover"
          />

          {image.mobile ? (
            <Image
              src={image.mobile}
              alt="Promo Mobile"
              width={1240}
              height={800}
              className="md:rounded-[70px] max-h-[400px] md:hidden block rounded-[10px] object-cover"
            />
          ) : (
            <Image
              src={image.desktop}
              alt="Promo"
              width={1240}
              height={800}
              className="md:rounded-[70px] max-h-[400px] md:hidden block rounded-[10px] object-cover"
            />
          )}
        </div>
      </section>
    );
  }

  // Multiple images - render with sliding effect
  return (
    <section
      id="promoimages"
      className="lg:px-24 xsm:px-12 px-6 flex flex-col items-center max-w-8xl mx-auto justify-center"
    >
      <div className="w-full justify-center flex relative overflow-hidden">
        {/* Desktop sliding images */}
        <div className="relative w-full max-w-[1240px] h-screen max-h-screen min-h-[300px] hidden md:block overflow-hidden rounded-[70px]">
          <AnimatePresence initial={false}>
            <motion.div
              key={`desktop-${currentImageIndex}`}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.6 },
              }}
              className="absolute w-full h-full"
            >
              <Image
                src={PromoImageSection[currentImageIndex].desktop}
                alt={`Promo ${currentImageIndex + 1}`}
                fill
                className="object-cover rounded-[70px]"
                priority
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mobile sliding images */}
        <div className="relative w-full max-w-[1240px] h-[400px] md:hidden block overflow-hidden rounded-[10px]">
          <AnimatePresence initial={false}>
            <motion.div
              key={`mobile-${currentImageIndex}`}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.6 },
              }}
              className="absolute w-full h-full"
            >
              <Image
                src={
                  PromoImageSection[currentImageIndex].mobile ||
                  PromoImageSection[currentImageIndex].desktop
                }
                alt={`Promo ${currentImageIndex + 1} Mobile`}
                fill
                className="object-cover rounded-[10px]"
                priority
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
