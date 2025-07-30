import { LoyaltyRedeemType, OrderDiscountType } from "@/generated/graphql";
import LoyaltyStore from "@/store/loyalty";
import ToastStore from "@/store/toast";
import { fetchWithAuth, sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/UtilFncs";
import { Check, Loader2 } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "../ui/carousel";

interface RedemptionItem {
  _id: string;
  name: string;
}

interface ItemRedemption {
  _id: string;
  item: RedemptionItem;
  pointsThreshold: number;
}

type DiscountType = "FixedAmount" | "Percentage";

interface PointsRedemption {
  _id: string;
  pointsThreshold: number;
  discountType: DiscountType;
  discountValue: number;
  uptoAmount?: number | null;
}

interface OffersScreenProps {
  pointsRedemptions: PointsRedemption[];
  itemRedemptions: ItemRedemption[];
  customerBalance: number;
}

const LoyaltyOffer: React.FC<OffersScreenProps> = ({
  pointsRedemptions,
  itemRedemptions,
  customerBalance,
}) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const { setRedeemState, setOfferSelected } = LoyaltyStore();
  const { setToastData } = ToastStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null);
  const [loadingOfferId, setLoadingOfferId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout>();

  const allOffers = [...itemRedemptions, ...pointsRedemptions].filter(
    (offer) => offer.pointsThreshold <= customerBalance
  );

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
    if (scrollContainerRef.current && allOffers.length > 1 && !loadingOfferId) {
      autoScrollIntervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => {
          const nextSlide = (prev + 1) % allOffers.length;
          scrollToSlide(nextSlide);
          return nextSlide;
        });
      }, 8000);
    }
  }, [allOffers.length, scrollToSlide, loadingOfferId]);

  const stopAutoScroll = useCallback(() => {
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
    }
  }, []);

  // Mouse/Touch event handlers for drag scrolling
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (loadingOfferId) return; // Prevent dragging during loading
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current!.offsetLeft);
    setScrollLeft(scrollContainerRef.current!.scrollLeft);
    stopAutoScroll();
  };

  useEffect(() => {
    startAutoScroll();
    return () => stopAutoScroll();
  }, [startAutoScroll, stopAutoScroll]);

  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current && !isDragging) {
      const scrollContainer = scrollContainerRef.current;
      const cardWidth =
        scrollContainer.querySelector("div[data-promo-card]")?.clientWidth ??
        300;
      const gap = 24;
      const scrollPosition = scrollContainer.scrollLeft;
      const newIndex = Math.round(scrollPosition / (cardWidth + gap));
      setCurrentSlide(newIndex);
    }
  }, [isDragging]);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      return () => scrollContainer.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  const handleApplyOffer = async (
    offerId: string,
    offerType: LoyaltyRedeemType,
    name: string,
    pointsRequired: number,
    discountType?: DiscountType,
    uptoAmount?: number | null,
    discountValue?: number
  ) => {
    stopAutoScroll();
    setLoadingOfferId(offerId);

    try {
      const res = await fetchWithAuth(() =>
        sdk.validateLoyaltyRedemptionOnCart({
          input: {
            loyaltyPointsRedeemed: pointsRequired,
            redeemType: offerType,
          },
        })
      );
      setRedeemState({
        discountType: OrderDiscountType.Loyalty,
        loyaltyInput: {
          loyaltyPointsRedeemed: pointsRequired,
          redeemType: offerType,
        },
        promoCode: null,
      });
      setOfferSelected({
        type: offerType,
        pointsRequired: pointsRequired,
        discountType,
        discountValue,
        uptoAmount,
        name,
      });
      setSelectedOffer(offerId);
    } catch (error) {
      setToastData({
        message: extractErrorMessage(error),
        type: "error",
      });
      startAutoScroll();
    } finally {
      setLoadingOfferId(null);
    }
  };

  const getDiscountText = (redemption: ItemRedemption | PointsRedemption) => {
    if ("item" in redemption) {
      return `Free ${redemption.item.name}`;
    } else {
      return redemption.discountType === "FixedAmount"
        ? `$${redemption.discountValue} off${
            redemption.uptoAmount ? ` up to $${redemption.uptoAmount}` : ""
          }`
        : `${redemption.discountValue}% off${
            redemption.uptoAmount ? ` up to $${redemption.uptoAmount}` : ""
          }`;
    }
  };

  // const resetInterval = useCallback(() => {
  //   if (intervalRef.current) {
  //     clearInterval(intervalRef.current);
  //   }

  //   intervalRef.current = setInterval(() => {
  //     if (api) {
  //       api.scrollNext();
  //     }
  //   }, 8000);
  // }, [api]);

  // useEffect(() => {
  //   if (!api) {
  //     return;
  //   }

  //   api.on("select", () => {
  //     setCurrent(api.selectedScrollSnap());
  //   });
  // }, [api]);

  // useEffect(() => {
  //   resetInterval();
  //   return () => {
  //     if (intervalRef.current) {
  //       clearInterval(intervalRef.current);
  //     }
  //   };
  // }, [api, resetInterval]);

  useEffect(() => {
    if (!api) {
      return;
    }

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // Update your dot click handler
  const handleDotClick = (index: number) => {
    api?.scrollTo(index);
    setCurrent(index); // Add this line to update the current state
  };

  if (allOffers.length === 0) return null;

  return (
    <div className="w-full">
      <Carousel
        setApi={setApi}
        opts={{
          align: "center",
          loop: false,
          skipSnaps: false,
          dragFree: false,
          containScroll: "keepSnaps",
        }}
        className="w-full overflow-hidden"
      >
        <CarouselContent className="transition-transform duration-300 ease-out">
          {allOffers.map((offer, index) => (
            <CarouselItem key={offer._id}>
              <div
                key={index}
                data-promo-card
                className="border bg-gray-200 md:border-none transition-all duration-300 w-full md:h-32 shrink-0 rounded-[20px]"
                // style={{ scrollSnapAlign: "start" }}
              >
                <div className="p-3 md:p-4 h-full flex flex-col justify-center">
                  <div className="flex items-start justify-between">
                    <div className="flex-grow pr-2">
                      <p className="sm:text-lg text-base font-bold text-gray-900 mb-1 line-clamp-1 font-online-ordering">
                        {getDiscountText(offer)}
                      </p>
                      <p className="text-xs text-gray-600 line-clamp-1 font-online-ordering">
                        {offer.pointsThreshold.toLocaleString()} points required
                      </p>
                      <div className="flex items-center justify-end mt-2">
                        <button
                          onClick={() =>
                            handleApplyOffer(
                              offer._id,
                              "item" in offer
                                ? LoyaltyRedeemType.Item
                                : LoyaltyRedeemType.Discount,
                              "item" in offer ? offer.item.name : "Discount",
                              offer.pointsThreshold,
                              "discountType" in offer
                                ? offer.discountType
                                : undefined,
                              "uptoAmount" in offer
                                ? offer.uptoAmount
                                : undefined,
                              "discountValue" in offer
                                ? offer.discountValue
                                : undefined
                            )
                          }
                          disabled={loadingOfferId === offer._id}
                          className={`inline-flex items-center px-3 py-1.5 text-sm font-medium transition-colors rounded-full ${
                            selectedOffer === offer._id
                              ? "bg-green-100 text-green-700"
                              : "bg-primary text-white hover:bg-primary-600 disabled:opacity-50"
                          }`}
                        >
                          {loadingOfferId === offer._id ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                              Applying...
                            </>
                          ) : selectedOffer === offer._id ? (
                            <>
                              <Check className="w-4 h-4 mr-1" />
                              Applied
                            </>
                          ) : (
                            "Apply Now"
                          )}
                        </button>
                      </div>
                    </div>
                    {/* <div>
                      <div className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0  flex items-center justify-center">
                        <Image
                          src={discountImg2}
                          alt="discount Img"
                          className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0"
                        />
                      </div>
                    </div> */}
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <div className="flex gap-4 mt-4 justify-center">
          {allOffers.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                current === index ? "bg-primary w-4" : "bg-gray-400 w-2"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </Carousel>
      {/* <div
        ref={scrollContainerRef}
        className="overflow-x-hidden relative cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleDragEnd}
        style={{
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          scrollBehavior: isDragging ? "auto" : "smooth"
        }}
      >
        <div className="flex gap-4 pb-4">
          {allOffers.map((offer, index) => (
            <div
              key={index}
              data-promo-card
              className="bg-white shadow-lg transition-all duration-300 w-72 md:w-80 md:h-32 shrink-0 rounded-[20px] scroll-snap-align-start"
              style={{ scrollSnapAlign: "start" }}
            >
              <div className="p-3 md:p-4 h-full flex flex-col justify-center">
                <div className="flex items-start justify-between">
                  <div className="flex-grow pr-2">
                    <p className="sm:text-lg text-base font-bold text-gray-900 mb-1 line-clamp-1 font-online-ordering">
                      {getDiscountText(offer)}
                    </p>
                    <p className="text-xs text-gray-600 line-clamp-1 font-online-ordering">
                      {offer.pointsThreshold.toLocaleString()} points required
                    </p>
                    <div className="flex items-center justify-start mt-2">
                      <button
                        onClick={() =>
                          handleApplyOffer(
                            offer._id,
                            "item" in offer
                              ? LoyaltyRedeemType.Item
                              : LoyaltyRedeemType.Discount,
                            "item" in offer ? offer.item.name : "Discount",
                            offer.pointsThreshold,
                            "discountType" in offer
                              ? offer.discountType
                              : undefined,
                            "uptoAmount" in offer ? offer.uptoAmount : undefined,
                            "discountValue" in offer
                              ? offer.discountValue
                              : undefined
                          )
                        }
                        disabled={loadingOfferId === offer._id}
                        className={`inline-flex items-center px-3 py-1.5 text-sm font-medium transition-colors rounded-full ${
                          selectedOffer === offer._id
                            ? "bg-green-100 text-green-700"
                            : "bg-primary text-white hover:bg-primary-600 disabled:opacity-50"
                        }`}
                      >
                        {loadingOfferId === offer._id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            Applying...
                          </>
                        ) : selectedOffer === offer._id ? (
                          <>
                            <Check className="w-4 h-4 mr-1" />
                            Applied
                          </>
                        ) : (
                          "Apply Now"
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <div className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0  flex items-center justify-center">
         
                      <Image
                        src={discountImg2}
                        alt="discount Img"
                        className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0"
                      />
              
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center gap-2 mt-4">
        {allOffers.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              currentSlide === index ? "bg-primary w-4" : "bg-gray-400 w-2"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div> */}
    </div>
  );
};

export default LoyaltyOffer;
