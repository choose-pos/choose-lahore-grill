"use client";

import { motion, useInView } from "framer-motion";
import Image from "next/image";
import React, { useRef } from "react";
import CountUp from "react-countup";

interface ISliderSectionProps {
  highlightSectionTitle: string;
  highlightSectionContent: string;
  highlightSectionImage: {
    url: string;
  };
  eventsCatered: number;
  biryanisServed: number;
  guestsServed: number;
}

const Slider: React.FC<ISliderSectionProps> = ({
  highlightSectionContent,
  highlightSectionImage,
  highlightSectionTitle,
  biryanisServed,
  eventsCatered,
  guestsServed,
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div className="relative w-full overflow-hidden -z-10">
      {/* Background Image */}
      <div className="absolute top-0 left-0 w-full h-full flex">
        <div className="flex-shrink-0 w-full">
          <Image
            src={highlightSectionImage?.url ?? ""}
            alt="Slide 1"
            className="w-full h-full object-cover"
            width={1000}
            height={1000}
            priority
          />
        </div>
      </div>

      {/* Content Section */}
      <div
        ref={ref}
        className="relative z-10 flex flex-col items-center justify-center w-full bg-black bg-opacity-30 px-4 py-16"
      >
        {/* Scrolling Title */}
        <div className="absolute font-secondary top-6 animate-scroll text-4xl text-white flex w-full whitespace-nowrap">
          <span className="mr-5">{highlightSectionTitle}</span>
          <span className="mr-5">{highlightSectionTitle}</span>
          <span className="mr-5">{highlightSectionTitle}</span>
          <span className="mr-5">{highlightSectionTitle}</span>
          <span className="mr-5">{highlightSectionTitle}</span>
          <span className="mr-5">{highlightSectionTitle}</span>
          <span className="mr-5">{highlightSectionTitle}</span>
          <span className="mr-5">{highlightSectionTitle}</span>
          <span className="mr-5">{highlightSectionTitle}</span>
        </div>

        {/* Counter Section */}
        <div className="text-center gap-10 flex flex-col items-center space-y-8 min-h-[80vh] justify-center">
          <div className="flex flex-wrap justify-between items-center gap-8 md:gap-20 font-secondary w-full md:px-6">
            <motion.div
              className="text-center text-bg2"
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-3xl md:text-7xl font-bold">
                {isInView && (
                  <CountUp
                    start={eventsCatered - 100}
                    end={eventsCatered}
                    duration={2.5}
                  />
                )}
              </h2>
              <p className="text-lg md:text-4xl">Events Catered</p>
            </motion.div>
            <motion.div
              className="text-center text-bg2 md:-mt-20"
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h2 className="text-3xl md:text-7xl font-bold">
                {isInView && (
                  <CountUp
                    start={biryanisServed - 100}
                    end={biryanisServed}
                    duration={2.5}
                  />
                )}
              </h2>
              <p className="text-lg md:text-4xl">Biryanis Served</p>
            </motion.div>
            <motion.div
              className="text-center text-bg2"
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <h2 className="text-3xl md:text-7xl  font-bold">
                {isInView && (
                  <CountUp
                    start={guestsServed - 100}
                    end={guestsServed}
                    duration={2.5}
                  />
                )}
              </h2>
              <p className="text-xl md:text-4xl">Guests Served</p>
            </motion.div>
          </div>

          {/* Highlight Content */}
          <motion.h1
            className="text-bg2 md:text-3xl sm:text-2xl text-xl leading-8 max-w-[963px] sm:leading-10 font-primary px-2 text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            {highlightSectionContent}
          </motion.h1>
        </div>
      </div>
    </div>
  );
};

export default Slider;
