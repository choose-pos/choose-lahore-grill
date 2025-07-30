import { PromoDiscountType } from "@/generated/graphql";
import ToastStore from "@/store/toast";
import { sdk } from "@/utils/graphqlClient";
import { PromoData } from "@/utils/types";
import { extractErrorMessage } from "@/utils/UtilFncs";
import { Check, Copy } from "lucide-react";
import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import discountImg2 from "../../assets/OBJECT.png";

const PromoCodes: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [promoCodeData, setPromoCodes] = useState<PromoData[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { setToastData } = ToastStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout>();

  const fetchRestaurantPromoCodes = useCallback(() => {
    const fetchFunc = async () => {
      try {
        const fetchPromo = await sdk.fetchVisiblePromoCodes();
        const promoData: PromoData[] = fetchPromo.fetchVisiblePromoCodes.map(
          (code) => ({
            code: code.code,
            description: code.description,
            discountItem: {
              name: code.discountItem?.name,
              price: code.discountItem?.price,
            },
            discountValue: code.discountValue,
            isActive: code.isActive,
            minCartValue: code.minCartValue,
            promoCodeDiscountType: code.promoCodeDiscountType,
            uptoAmount: code.uptoAmount,
          })
        );
        setPromoCodes(promoData);
      } catch (error) {
        console.log(error);
        setToastData({ message: extractErrorMessage(error), type: "error" });
      }
    };

    fetchFunc();
  }, [setToastData]);

  const scrollToSlide = useCallback((index: number) => {
    if (scrollContainerRef.current) {
      const scrollContainer = scrollContainerRef.current;
      const cardWidth =
        scrollContainer.querySelector("div[data-promo-card]")?.clientWidth ??
        300;
      const gap = 24;
      const scrollAmount = index * (cardWidth + gap);

      scrollContainer.scrollTo({
        left: scrollAmount,
        behavior: "smooth",
      });
      setCurrentSlide(index);
    }
  }, []);

  const startAutoScroll = useCallback(() => {
    if (scrollContainerRef.current && promoCodeData.length > 0) {
      autoScrollIntervalRef.current = setInterval(() => {
        const nextSlide = (currentSlide + 1) % promoCodeData.length;
        scrollToSlide(nextSlide);
      }, 3000);
    }
  }, [promoCodeData.length, currentSlide, scrollToSlide]);

  const stopAutoScroll = useCallback(() => {
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
    }
  }, []);

  useEffect(() => {
    startAutoScroll();
    return () => stopAutoScroll();
  }, [startAutoScroll, stopAutoScroll]);

  const handleMouseEnter = () => stopAutoScroll();
  const handleMouseLeave = () => startAutoScroll();

  useEffect(() => {
    fetchRestaurantPromoCodes();
  }, [fetchRestaurantPromoCodes]);

  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const scrollContainer = scrollContainerRef.current;
      const cardWidth =
        scrollContainer.querySelector("div[data-promo-card]")?.clientWidth ??
        300;
      const gap = 24;
      const scrollPosition = scrollContainer.scrollLeft;
      const newIndex = Math.round(scrollPosition / (cardWidth + gap));
      setCurrentSlide(newIndex);
    }
  }, []);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      return () => scrollContainer.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  if (promoCodeData.length === 0) return null;

  const handleCopy = async (e: React.MouseEvent, code: string) => {
    e.stopPropagation(); // Prevent card click event
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getDiscountText = (code: PromoData) => {
    switch (code.promoCodeDiscountType) {
      case PromoDiscountType.Percentage:
        return `${code.discountValue}% off${
          code.uptoAmount ? ` up to $${code.uptoAmount}` : ""
        }`;
      case PromoDiscountType.FixedAmount:
        return `$${code.discountValue} off`;
      case PromoDiscountType.Item:
        return `Free item with purchase`;
    }
  };

  return (
    <div className="w-full py-4 max-w-8xl mx-auto">
      <h2 className="text-xl sm:text-3xl font-bold mb-4 font-online-ordering">
        Offers and Rewards
      </h2>
      <div className="w-full max-w-full overflow-hidden">
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto scrollbar-hide relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            scrollBehavior: "smooth",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <div className="flex gap-4 sm:gap-6 pb-4 w-max">
            {promoCodeData.map((code, index) => (
              <div
                key={index}
                data-promo-card
                className="bg-white border  transition-all duration-300 w-72 md:w-96 md:h-32 shrink-0 rounded-[20px]"
              >
                <div className="p-3 md:p-4 h-full flex flex-col justify-center">
                  <div className="flex items-start justify-between">
                    <div className="flex-grow pr-2">
                      <p className="sm:text-lg text-base font-bold text-gray-900 mb-1 line-clamp-1 font-online-ordering">
                        {getDiscountText(code)}
                      </p>
                      {code.description && (
                        <p className="text-xs text-gray-600 line-clamp-1 font-online-ordering">
                          {code.description}
                        </p>
                      )}
                      <div className="flex items-center justify-start mt-2">
                        <code className="font-mono text-xs sm:text-sm  font-medium mr-1">
                          {code.code}
                        </code>
                        <button
                          onClick={(e) => handleCopy(e, code.code || "")}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          aria-label={
                            copiedCode === code.code ? "Copied!" : "Copy code"
                          }
                        >
                          {copiedCode === code.code ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-500" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <Image
                        src={discountImg2}
                        alt="discount Img"
                        className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Dots for Mobile */}
        <div className="flex justify-center gap-2 mt-4 md:hidden">
          {promoCodeData.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentSlide === index ? "bg-primary w-4" : "bg-gray-300"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromoCodes;
