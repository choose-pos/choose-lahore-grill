import { fadeIn } from "@/utils/motion";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import arrowup from "@/assets/mingcute_arrow-up-line.png";
import { blurHashToDataURL } from "@/utils/blurhash";
import { RichText } from "@graphcms/rich-text-react-renderer";

interface ICatering {
  sectionTitle: string;
  sectionImage: {
    url: string;
  };
  sectionImageBlurHash: string;
  sectionContent: {
    raw: any;
    text: string;
  };
  Img2?: {
    url: string;
  };
  Img3?: {
    url: string;
  };
  Img4?: {
    url: string;
  };
  ImgBH2?: string;
  ImgBH3?: string;
  ImgBH4?: string;
}

const Catering: React.FC<ICatering> = ({
  sectionImage,
  sectionImageBlurHash,
  sectionTitle,
  sectionContent,
  Img2,
  Img3,
  ImgBH2,
  ImgBH3,
  Img4,
  ImgBH4,
}) => {
  const images = [sectionImage?.url, Img2?.url, Img3?.url, Img4?.url].filter(
    (url): url is string => !!url
  );
  const hash = [sectionImageBlurHash, ImgBH2, ImgBH3, ImgBH4].filter(
    (bh): bh is string => !!bh
  );

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
    <div className="lg:px-24 xsm:px-12 mt-28 px-6 py-10 bg-white relative flex custom-lg:flex-row flex-col items-center z-10 overflow-hidden">
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
        className="flex flex-col custom-lg:items-start custom-lg:w-1/2 w-full custom-lg2:mt-0"
        variants={fadeIn("left", "tween", 0.2, 0.5)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        <h1 className="md:text-[60px] md:leading-[55px] text-4xl font-secondary mb-2 md:mb-5 text-bg1">
          {sectionTitle}
        </h1>
        <p className="text-base md:text-xl font-primary custom-lg:max-w-[680px] max-w-sreen text-bg1 md:mb-3 mb-2">
          <RichText
            content={sectionContent.raw}
            renderers={{
              p: ({ children }) => <h5 className="text-xl mb-4">{children}</h5>,
              // h3: ({ children }) => <h3 className="text-2xl ">{children}</h3>,
            }}
          />
        </p>
        {/* <Link
          href="/catering-menu.pdf"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open Catering Menu PDF"
        >
          <button
            aria-label="Order Now"
            className={`md:px-6 flex items-center px-3 py-1.5 md:py-1 md:h-12 font-primary text-base md:text-lg bg-primaryColor font-medium  border rounded-[10px] text-white transition-opacity duration-500 group mt-2 md:mt-4`}
          >
            <p>Catering Menu</p>
            <Image
              src={arrowup}
              alt="arrow-up"
              className="md:w-[35px] md:h-[35px] w-[30px] h-[30px] group-hover:rotate-45 transition-all duration-300 ease-in-out"
            />
          </button>
        </Link> */}
        {/* <Link href="/catering">
          <p className="flex items-center font-secondary xsm:text-3xl text-xl text-bg1 font-bold cursor-pointer group">
            <span className="transition-all duration-300 ease-in-out">
              READ MORE
            </span>

          </p>
        </Link> */}
      </motion.div>
    </div>
  );
};

export default Catering;
