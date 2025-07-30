"use client";
import ArrowLeft from "@/assets/arrowleft.png";
import ArrowRight from "@/assets/arrowright.png";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
// import Item1 from "../assets/fried-meat-with-smashed-potato 1.png";
import { motion } from "framer-motion";
import Link from "next/link";
import React from "react";
import { fadeIn } from "../../../utils/motion";
import Button from "./common/Button";
import texture from "@/assets/Texture.png";

interface ISliderItem {
  image: string;
  title: string;
  description: string;
  id: string;
}

interface ISliderSectionProps {
  id: string;
  sectionTitle: string;
  items: ISliderItem[];
}

const MenuSection: React.FC<ISliderSectionProps> = ({
  id,
  sectionTitle,
  items,
}) => {
  console.log(id);
  return (
    <div id={id} className="bg-primaryColor w-full h-full relative">
      <Image
        src={texture}
        alt="Texture Frame"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none mix-blend-multiply z-50 rounded-lg"
      />

      <motion.div
        variants={fadeIn("right", "tween", 0.2, 1)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        // id={id}
        className="relative w-full flex flex-col items-center justify-center px-4 md:px-6 py-8 max-w-8xl mx-auto"
      >
        <h2 className="text-3xl md:text-6xl font-secondary text-white text-center">
          {sectionTitle}
        </h2>
        <div className="w-full pt-5 md:pt-10 relative px-4 xl:px-24">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {items.map((item, index) => (
                <CarouselItem
                  key={index}
                  className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                >
                  <Link href={`/menu?itemId=${item.id}`} passHref>
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="w-full h-[250px] relative max-w-[290px] ">
                        <Image
                          src={item.image}
                          alt={item.title}
                          className="rounded-lg object-cover"
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          priority={index === 0}
                        />
                      </div>
                      <p className="font-secondary text-2xl md:text-3xl font-normal text-white">
                        {item.title}
                      </p>
                      {/* <p className="font-primary text-base md:text-xl leading-7 md:leading-8 text-center font-normal text-textColor text-opacity-80">
                      {item.description}
                      </p> */}
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute -left-4 lg:-left-12 text-bg1 hover:text-bg1 bg-white hover:bg-white/80"></CarouselPrevious>
            <CarouselNext className="absolute -right-4 lg:-right-12 text-bg1 hover:text-bg1 bg-white hover:bg-white/80"></CarouselNext>
          </Carousel>
        </div>
        <div className="mt-3">
          <Link aria-label="Order Link" href={`/menu`}>
            <button
              aria-label="Order Now"
              className="mt-4 px-8 py-3 tracking-wide text-sm xsm:text-lg md:text-xl font-medium font-primary border-2 border-bg1 text-b1 bg-white rounded-[15px] shadow-xl"
            >
              View full menu
            </button>
          </Link>
          {/* <Link
            href="/bar-menu.pdf
            "
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open Bar Menu PDF"
          >
            <button
              aria-label="Order Now"
              className="mt-4 px-8 py-3 tracking-wide text-sm xsm:text-lg md:text-xl font-medium font-primary border-2 bg-bg1 text-b1 text-white rounded-[15px] shadow-xl"
            >
              Bar Menu
            </button>
          </Link> */}
          {/* <Button text="View full menu" url="/menu" boundary={true} /> */}
        </div>
        {/* <div className="absolute bottom-[25%] left-0 z-10 hidden lg:block">
        <Image src={bgImage} width={300} height={300} alt="Image top" />
        </div> */}
      </motion.div>
    </div>
  );
};

export default MenuSection;
