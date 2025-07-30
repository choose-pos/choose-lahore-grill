import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Env } from "@/env";
import { LoyaltyRedeemType } from "@/generated/graphql";
import { useCartStore } from "@/store/cart";
import meCustomerStore from "@/store/meCustomer";
import { useSidebarStore } from "@/store/sidebar";
import ToastStore from "@/store/toast";
import { fetchWithAuth, sdk } from "@/utils/graphqlClient";
import { isContrastOkay } from "@/utils/isContrastOkay";
import { refreshCartDetails } from "@/utils/refreshCartDetails";
import { RestaurantRedeemOffers, TAmounts } from "@/utils/types";
import { extractErrorMessage, isRewardApplied } from "@/utils/UtilFncs";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ICartOffersProps {
  loyaltyRule: { value: number; name: string; signUpValue: number } | null;
  loyaltyOffers: RestaurantRedeemOffers | null;
}

const LoyaltyOffers = ({ loyaltyRule, loyaltyOffers }: ICartOffersProps) => {
  // Stores
  const { setToastData } = ToastStore();
  const { cartDetails, setCartDetails } = useCartStore();
  const router = useRouter();
  const { meCustomerData } = meCustomerStore();
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [loyaltyRewards, setLoyaltyRewards] = useState<
    {
      name: string;
      points: number;
      type: LoyaltyRedeemType;
      image?: string | null;
    }[]
  >([]);
  const [loadingOffers, setLoadingOffers] = useState<Record<number, boolean>>(
    {}
  );
  const [loyaltyError, setLoyaltyError] = useState<string>();
  const [itemsPerSlide, setItemsPerSlide] = useState(1);

  // Determine items per slide based on screen size
  useEffect(() => {
    const handleResize = () => {
      setItemsPerSlide(window.innerWidth < 768 ? 1 : 3);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Group offers into slides
  const slides = Array.from(
    { length: Math.ceil(loyaltyRewards.length / itemsPerSlide) },
    (_, i) => loyaltyRewards.slice(i * itemsPerSlide, (i + 1) * itemsPerSlide)
  );

  // Determine if nav dots should be visible
  const showNavDots = () => {
    // Hide dots on desktop (768px and above) if total items <= 3
    // Hide dots on mobile (below 768px) if total items <= 1
    if (itemsPerSlide === 3) {
      return loyaltyRewards.length > 3;
    } else {
      return loyaltyRewards.length > 1;
    }
  };

  // Track current slide
  useEffect(() => {
    if (!carouselApi) return;
    setCurrent(carouselApi.selectedScrollSnap());
    carouselApi.on("select", () => {
      setCurrent(carouselApi.selectedScrollSnap());
    });
  }, [carouselApi]);

  useEffect(() => {
    if (loyaltyOffers) {
      const arr: {
        name: string;
        points: number;
        type: LoyaltyRedeemType;
        image?: string | null;
      }[] = [];

      loyaltyOffers.itemRedemptions.forEach((i) => {
        arr.push({
          name: `Free ${i.item.name}`,
          points: i.pointsThreshold,
          type: LoyaltyRedeemType.Item,
          image: i.item.image ?? null,
        });
      });

      loyaltyOffers.pointsRedemptions.forEach((i) => {
        arr.push({
          name:
            i.discountType === "FixedAmount"
              ? `$${i.discountValue} off`
              : `${i.discountValue}% off${
                  (i.uptoAmount ?? 0) > 0 ? ` upto $${i.uptoAmount}` : ""
                }`,
          points: i.pointsThreshold,
          type: LoyaltyRedeemType.Discount,
        });
      });

      const sortedRewards = arr.sort((a, b) => a.points - b.points);
      setLoyaltyRewards(sortedRewards);
    }
  }, [loyaltyOffers]);

  const handleApplyLoyalty = async (
    points: number,
    type: LoyaltyRedeemType
  ) => {
    setLoyaltyError(undefined);
    setLoadingOffers((prev) => ({ ...prev, [points]: true }));

    try {
      const res = await sdk.validateLoyaltyRedemptionOnCart({
        input: { loyaltyPointsRedeemed: points, redeemType: type },
      });

      if (res.validateLoyaltyRedemptionOnCart) {
        // Refresh cart details after applying loyalty
        const updatedCart = await refreshCartDetails();
        if (updatedCart?.CartDetails) {
          setCartDetails(updatedCart.CartDetails);
        }
        router.push(`/menu/cart`);
      }
    } catch (error) {
      setLoyaltyError(extractErrorMessage(error));
      setToastData({
        type: "error",
        message: extractErrorMessage(error),
      });
    } finally {
      setLoadingOffers((prev) => ({ ...prev, [points]: false }));
    }
  };

  if (!meCustomerData) {
    return null;
  }

  return (
    <div className="font-online-ordering z-40">
      {loyaltyOffers && loyaltyRewards.length > 0 && (
        <>
          <h2 className="text-xl sm:text-3xl font-bold mb-4 font-online-ordering">
            Loyalty Offers
          </h2>
          <div className="my-2">
            <Carousel
              setApi={setCarouselApi}
              opts={{
                align: "start",
                loop: false,
                skipSnaps: false,
                dragFree: false,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {slides.map((slide, slideIndex) => (
                  <CarouselItem key={slideIndex} className="pl-4 basis-full">
                    <div className="flex gap-4 h-full">
                      {slide.map((offer, index) => (
                        <div
                          key={index}
                          className={`w-full ${
                            itemsPerSlide === 3 ? "md:w-1/3" : ""
                          }`}
                        >
                          <div className="bg-white border transition-all duration-300 w-full h-28 md:h-32 shrink-0 rounded-[20px]">
                            <div className="p-3 md:p-4 h-full flex flex-col justify-center">
                              <div className="flex items-start justify-between">
                                <div className="flex-grow pr-2">
                                  <div className="flex items-center gap-2 mb-1">
                                    {offer?.image && (
                                      <div className="w-14 h-14 relative self-start flex-shrink-0">
                                        <Image
                                          src={offer.image}
                                          alt={offer.name}
                                          fill
                                          className={`object-cover object-center w-full h-full rounded-lg`}
                                        />
                                      </div>
                                    )}
                                    <div className="flex-1">
                                      <p className="sm:text-lg text-base font-bold text-gray-900 line-clamp-1 font-online-ordering">
                                        {offer.name}
                                      </p>
                                      <p className="text-xs text-gray-600 line-clamp-1 font-online-ordering">
                                        {offer.points}{" "}
                                        {loyaltyRule?.name ?? "points"} required
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-end mt-2">
                                    {(meCustomerData?.loyaltyWallet?.balance ??
                                      0) >= offer.points ? (
                                      <button
                                        onClick={() => {
                                          handleApplyLoyalty(
                                            offer.points,
                                            offer.type
                                          );
                                        }}
                                        disabled={loadingOffers[offer.points]}
                                        className={`inline-flex items-center px-3 py-1.5 text-sm font-medium transition-colors rounded-full bg-white text-primary border border-primary disabled:opacity-50 disabled:bg-gray-300`}
                                      >
                                        {loadingOffers[offer.points] ? (
                                          <div className="text-black flex items-center">
                                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                            {isRewardApplied(
                                              offer.points,
                                              offer.type,
                                              cartDetails
                                            ) ? (
                                              <p>Loading...</p>
                                            ) : (
                                              <p>Applying...</p>
                                            )}
                                          </div>
                                        ) : isRewardApplied(
                                            offer.points,
                                            offer.type,
                                            cartDetails
                                          ) ? (
                                          <Link href={"/menu/cart"}>
                                            <p className="text-black">
                                              View cart
                                            </p>
                                          </Link>
                                        ) : (
                                          <p className="text-black">Redeem</p>
                                        )}
                                      </button>
                                    ) : (
                                      <p className="text-xs sm:text-sm px-2 py-1 text-gray-600">
                                        Not enough points
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>

              {/* Only show navigation dots if there are enough items to warrant multiple slides */}
              {showNavDots() && (
                <div className="flex gap-4 mt-4 justify-center">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        carouselApi?.scrollTo(index);
                      }}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        current === index ? "bg-primary w-4" : "bg-gray-400 w-2"
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </Carousel>
          </div>
        </>
      )}
    </div>
  );
};

export default LoyaltyOffers;
