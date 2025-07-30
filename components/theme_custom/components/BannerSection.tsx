"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import O from "../../../assets/letters/o-1.png";
import A from "../../../assets/letters/a (5).png";
import R from "../../../assets/letters/r (2).png";
import H from "../../../assets/letters/h (2).png";
import A1 from "../../../assets/letters/outline/a (Outline)-1.png";
import R1 from "../../../assets/letters/outline/r (Outline).png";
import H1 from "../../../assets/letters/outline/h (Outline).png";
import L from "../../../assets/letters/L.png";
import L1 from "../../../assets/letters/outline/L (outline).png";
import E from "../../../assets/letters/E-1.png";
import E1 from "../../../assets/letters/outline/E.png";

const BannerSection = () => {
  const [scrollY, setScrollY] = useState(0);

  const handleScroll = () => {
    setScrollY(window.scrollY);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="hidden w-full h-full max-h-[100vh] px-24 lg:flex items-center justify-center gap-4 overflow-hidden">
      <div
        className="flex flex-col items-center justify-center gap-y-20"
        style={{ transform: `translateY(${scrollY * 0.13}px)` }}
      >
        <Image src={L} alt="B" />
        <Image src={L1} alt="B" />
      </div>
      <div
        className="flex flex-col items-center justify-center gap-y-10"
        style={{ transform: `translateY(${-scrollY * 0.13}px)` }}
      >
        <Image src={A1} alt="A" />
        <Image src={A} alt="A" />
      </div>
      <div
        className="flex flex-col items-center justify-center gap-y-20"
        style={{ transform: `translateY(${scrollY * 0.13}px)` }}
      >
        <Image src={H} alt="W" />
        <Image src={H1} alt="W" />
      </div>
      <div
        className="flex flex-col items-center justify-center gap-y-20"
        style={{ transform: `translateY(${-scrollY * 0.13}px)` }}
      >
        <Image src={O} alt="A" />
        <Image src={O} alt="A" />
      </div>
      <div
        className="flex flex-col items-center justify-center gap-y-20"
        style={{ transform: `translateY(${scrollY * 0.13}px)` }}
      >
        <Image src={R} alt="R" />
        <Image src={R1} alt="R" />
      </div>
      <div
        className="flex flex-col items-center justify-center gap-y-20"
        style={{ transform: `translateY(${-scrollY * 0.13}px)` }}
      >
        <Image src={E1} alt="C" />
        <Image src={E} alt="C" />
      </div>

      {/* <div
        className="flex flex-col items-center justify-center gap-y-10 "
        style={{ transform: `translateY(${-scrollY * 0.12}px)` }}
      >
        <Image src={I1} alt="I" />
        <Image src={I} alt="I" />
      </div> */}
    </div>
  );
};

export default BannerSection;
