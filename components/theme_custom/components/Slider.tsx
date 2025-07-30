"use client";

import { fadeIn } from "@/utils/motion";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import React, { useRef } from "react";
import arrowup from "../../../assets/arrow-up.png";

interface IOfferSection {
  offerSectionTitle: string;
  offerSectionContent: string;
  offerSectionSubContent: string;
  offerSectionImage: {
    url: string;
  };
}

const LunchSection: React.FC<IOfferSection> = ({
  offerSectionContent,
  offerSectionImage,
  offerSectionSubContent,
  offerSectionTitle,
}) => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end center"], // Adjust the end value to 'center' or a similar point
  });

  // Transform scroll position to vertical movement
  const yTransform = useTransform(scrollYProgress, [0, 1], ["0%", "-100%"]); // Adjust the end value as needed

  return (
    <div className="lg:px-24 xsm:px-12 px-6 py-10 bg-white lg:rounded-[60px] relative flex custom-lg:flex-row flex-col items-center z-10 overflow-hidden">
      <motion.div
        variants={fadeIn("right", "tween", 0.2, 0.5)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="custom-lg:mr-10 custom-lg:mb-0 mb-5 custom-lg:w-1/2 w-full flex items-center justify-center"
      >
        <div className="relative xsm:w-[450px] xsm:h-[500px] w-[400px] h-[380px] overflow-hidden">
          <div>
            <Image
              src={offerSectionImage.url}
              alt={`gallery-image`}
              className="rounded-[20px] md:rounded-[40px] object-cover"
              fill
              priority
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        className="flex flex-col custom-lg:items-start custom-lg:w-1/2 w-full custom-lg2:mt-0"
        variants={fadeIn("left", "tween", 0.2, 0.5)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        <h1 className="md:text-[60px] md:leading-[55px] text-4xl font-secondary mb-2 md:mb-5 text-bg1">
          {offerSectionTitle}
        </h1>
        <p className="text-base md:text-xl font-primary custom-lg:max-w-[680px] max-w-sreen text-bg1 md:mb-3 mb-2">
          {offerSectionContent}
        </p>
        <Link href="/parties">
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
        </Link>
      </motion.div>
    </div>
  );
};

export default LunchSection;
