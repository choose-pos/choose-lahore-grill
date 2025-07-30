"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { fadeIn } from "@/utils/motion";
import arrowup from "../../assets/arrow-up.png";
import { blurHashToDataURL } from "@/utils/blurhash";
import { RichText } from "@graphcms/rich-text-react-renderer";

interface IGallery {
  Img1?: {
    url: string;
  };
  Img2?: {
    url: string;
  };
  Img3?: {
    url: string;
  };
  ImgBH1?: string;
  ImgBH2?: string;
  ImgBH3?: string;

  sectionTitle: string;
  sectionContent: {
    text: string;
    raw: any;
  };
}

const PartyContent: React.FC<IGallery> = ({
  Img1,
  Img2,
  Img3,
  ImgBH1,
  ImgBH2,
  ImgBH3,
  sectionContent,
  sectionTitle,
}) => {
  // Filter undefined images and hashes
  const images = [Img1?.url, Img2?.url, Img3?.url].filter(
    (url): url is string => !!url
  );
  const hash = [ImgBH1, ImgBH2, ImgBH3].filter((bh): bh is string => !!bh);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 for right, -1 for left

  useEffect(() => {
    if (images.length > 1) {
      const intervalId = setInterval(() => {
        setDirection(1);
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 3000);

      return () => clearInterval(intervalId);
    }
  }, [images.length]);

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

  return (
    <div className="lg:px-24 xsm:px-12 mt-24 px-6 py-10 bg-white relative flex flex-col custom-lg:flex-row items-center z-10 overflow-hidden">
      {images.length > 0 && (
        <motion.div
          variants={fadeIn("right", "tween", 0.2, 0.5)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="custom-lg:mr-10 custom-lg:mb-0 mb-5 custom-lg:w-1/2 w-full flex items-center justify-center"
        >
          <div className="relative xsm:w-[450px] xsm:h-[500px] w-[400px] h-[350px] overflow-hidden">
            <AnimatePresence initial={false}>
              <motion.div
                key={currentImageIndex}
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
                  src={images[currentImageIndex]}
                  placeholder="blur"
                  blurDataURL={blurHashToDataURL(hash[currentImageIndex])}
                  alt={`gallery-image-${currentImageIndex + 1}`}
                  className="rounded-[20px] md:rounded-[40px] object-cover"
                  fill
                  priority
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      <motion.div
        className="flex flex-col custom-lg:items-start custom-lg:w-1/2 w-full"
        variants={fadeIn("left", "tween", 0.2, 0.5)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        <h1 className="md:text-[60px] md:leading-[55px] text-3xl font-secondary xsm:mb-5 mb-2 text-bg1">
          {sectionTitle}
        </h1>
        <RichText
          content={sectionContent.raw}
          renderers={{
            p: ({ children }) => <h5 className="text-xl mb-4">{children}</h5>,
            // h3: ({ children }) => <h3 className="text-2xl ">{children}</h3>,
          }}
        />
        {/* <Link href="/our-story">
          <p className="flex items-center font-secondary xsm:text-3xl text-xl text-bg1 font-bold cursor-pointer group">
            <span className="transition-all duration-300 ease-in-out">
              READ MORE
            </span>
            <Image
              src={arrowup}
              alt="arrow-up"
              className="xsm:w-[45px] w-[35px] xsm:h-[45px] h-[35px] group-hover:rotate-45 transition-all duration-300 ease-in-out"
            />
          </p>
        </Link> */}
      </motion.div>
    </div>
  );
};

export default PartyContent;
