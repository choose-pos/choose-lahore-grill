"use client";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Env } from "@/env";
import { isContrastOkay } from "@/utils/isContrastOkay";
import { motion } from "framer-motion";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { fadeIn } from "../../../utils/motion";
import Image from "next/image";
import texture from "@/assets/Texture.png";

interface IReviewItem {
  _id: string;
  content: string;
  name: string;
}

interface IReviewSectionProps {
  id: string;
  reviews: IReviewItem[];
}

const Testimonials: React.FC<IReviewSectionProps> = ({ id, reviews }) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout>();

  const resetInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      if (api) {
        api.scrollNext();
      }
    }, 8000);
  }, [api]);

  useEffect(() => {
    if (!api) {
      return;
    }

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  useEffect(() => {
    resetInterval();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [api, resetInterval]);

  const handleDotClick = (index: number) => {
    api?.scrollTo(index);
    resetInterval();
  };

  console.log(id);

  return (
    <div
      id={id}
      className="relative w-full flex flex-col items-center justify-center px-4 sm:px-6 md:px-12 lg:px-16 xl:px-24 py-12 text-center overflow-hidden bg-primaryColor"
    >
      <Image
        src={texture}
        alt="Texture Frame"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none mix-blend-multiply z-50 rounded-lg"
      />

      <Carousel
        setApi={setApi}
        opts={{
          align: "center",
          loop: true,
          skipSnaps: false,
          dragFree: false,
          containScroll: "trimSnaps",
        }}
        className="w-full overflow-hidden max-w-8xl mx-auto"
      >
        <CarouselContent className="transition-transform duration-300 ease-out">
          {reviews.map((review, index) => (
            <CarouselItem
              key={index}
              className="basis-full transform transition-opacity duration-300"
            >
              <motion.div
                variants={fadeIn("right", "tween", 0.2, 1)}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="p-1"
              >
                <Card className="border-none bg-transparent shadow-none">
                  <CardContent
                    className="flex flex-col items-center p-0 sm:p-6"
                    style={{
                      color: isContrastOkay(
                        Env.NEXT_PUBLIC_PRIMARY_COLOR,
                        Env.NEXT_PUBLIC_BACKGROUND_COLOR
                      )
                        ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
                        : Env.NEXT_PUBLIC_TEXT_COLOR,
                    }}
                  >
                    <h2 className="font-secondary text-3xl sm:text-4xl md:text-5xl text-center capitalize">
                      {"Reviews"}
                    </h2>
                    <p className="font-primary text-base sm:text-xl leading-relaxed pt-4 sm:pt-6 md:pt-8 lg:pt-10 font-normal text-opacity-80">
                      {`"${review.content}"`}
                    </p>
                    {review.name ? (
                      <p className="font-primary text-xl opacity-90 text-center capitalize pt-10">
                        - {review.name}
                      </p>
                    ) : null}
                  </CardContent>
                </Card>
              </motion.div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <div className="flex gap-4 mt-8 justify-center">
          {reviews.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-200`}
              style={{
                borderColor: isContrastOkay(
                  Env.NEXT_PUBLIC_PRIMARY_COLOR,
                  Env.NEXT_PUBLIC_BACKGROUND_COLOR
                )
                  ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
                  : Env.NEXT_PUBLIC_TEXT_COLOR,
                backgroundColor:
                  current === index
                    ? isContrastOkay(
                        Env.NEXT_PUBLIC_PRIMARY_COLOR,
                        Env.NEXT_PUBLIC_BACKGROUND_COLOR
                      )
                      ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
                      : Env.NEXT_PUBLIC_TEXT_COLOR
                    : (isContrastOkay(
                        Env.NEXT_PUBLIC_PRIMARY_COLOR,
                        Env.NEXT_PUBLIC_BACKGROUND_COLOR
                      )
                        ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
                        : Env.NEXT_PUBLIC_TEXT_COLOR) + "00",
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </Carousel>
    </div>
  );
};

export default Testimonials;
