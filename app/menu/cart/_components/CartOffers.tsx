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
import { RestaurantRedeemOffers, TAmounts } from "@/utils/types";
import { extractErrorMessage } from "@/utils/UtilFncs";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FiX } from "react-icons/fi";

interface ICartOffersProps {
  loyaltyRule: { value: number; name: string; signUpValue: number } | null;
  loyaltyOffers: RestaurantRedeemOffers | null;
  amounts: TAmounts | null;
  refreshData: () => void;
}

const CartOffers = ({
  loyaltyRule,
  loyaltyOffers,
  amounts,
  refreshData,
}: ICartOffersProps) => {
  // Stores
  const { setToastData } = ToastStore();
  const { cartDetails } = useCartStore();
  const { meCustomerData } = meCustomerStore();
  const { setSignInOpen, setIsSignUpOpen, setCartOpen } = useSidebarStore();

  // States
  const [addPromoLoading, setAddPromoLoading] = useState(false);
  const [promoCodeInput, setPromoCodeInput] = useState<string>("");
  const [promoError, setPromoError] = useState<string>();

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
  const [applyLoyaltyLoading, setApplyLoyaltyLoading] = useState(false);
  const [loyaltyError, setLoyaltyError] = useState<string>();

  // UseEffects
  useEffect(() => {
    if (loyaltyOffers) {
      const arr: {
        name: string;
        points: number;
        type: LoyaltyRedeemType;
        image?: string | null;
      }[] = [];
      loyaltyOffers.itemRedemptions.forEach((i) => {
        console.log("loyaltyOffers", i.item.image);
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

  useEffect(() => {
    if (!carouselApi) {
      return;
    }

    setCurrent(carouselApi.selectedScrollSnap());

    carouselApi.on("select", () => {
      setCurrent(carouselApi.selectedScrollSnap());
    });
  }, [carouselApi]);

  // Handlers / Functions
  const handleRemoveOffer = async () => {
    try {
      const res = await sdk.updateCartDetails({
        input: { amounts: { discountAmount: 0 }, discountString: null },
      });

      if (res.updateCartDetails) {
        setPromoError(undefined);

        // Trigger refetch of cart data
        refreshData();
      }
    } catch (error) {
      setToastData({ message: extractErrorMessage(error), type: "error" });
    }
  };

  const handleApplyOffer = async (e: React.FormEvent) => {
    // Stopping default form behaviour
    e.preventDefault();

    if (promoCodeInput.trim().length === 0) {
      setToastData({ message: "Please enter a promo code", type: "error" });
      return;
    }

    setAddPromoLoading(true);
    try {
      const res = await fetchWithAuth(() =>
        sdk.ValidatePromoCode({ code: promoCodeInput.trim() })
      );

      if (res.validatePromoCode) {
        refreshData();

        // Reset local state to default
        setPromoError(undefined);
        setPromoCodeInput("");
      }
    } catch (error) {
      setPromoError(extractErrorMessage(error));
    } finally {
      setAddPromoLoading(false);
    }
  };

  const handleApplyLoyalty = async (
    points: number,
    type: LoyaltyRedeemType
  ) => {
    setLoyaltyError(undefined);
    setApplyLoyaltyLoading(true);
    try {
      const res = await fetchWithAuth(() =>
        sdk.validateLoyaltyRedemptionOnCart({
          input: { loyaltyPointsRedeemed: points, redeemType: type },
        })
      );

      if (res.validateLoyaltyRedemptionOnCart) {
        // Trigger refetch of cart data
        refreshData();
      }
    } catch (error) {
      setLoyaltyError(extractErrorMessage(error));
    } finally {
      setApplyLoyaltyLoading(false);
    }
  };

  if (amounts === null) {
    return null;
  }

  return (
    <>
      <div className="px-6 font-online-ordering z-40">
        {loyaltyRule && !meCustomerData ? (
          <>
            <p className="text-sm text-gray-600 mb-2">
              <span className="hidden md:inline-block">
                Already a member?&nbsp;
              </span>
              <span
                className="font-semibold cursor-pointer underline"
                onClick={() => {
                  setSignInOpen(true);
                }}
              >
                Sign In
              </span>{" "}
              {`and earn`}{" "}
              <span className="font-semibold">
                {Math.round(amounts.netAmt) * 10} {loyaltyRule?.name}
              </span>{" "}
              {`on this order.`}
            </p>
            {loyaltyRule.signUpValue > 0 ? (
              <p className="text-sm text-gray-600 mb-2">
                <span className="hidden md:inline-block">
                  Not a member?&nbsp;
                </span>
                <span
                  className="font-semibold cursor-pointer underline"
                  onClick={() => {
                    setCartOpen(false);
                    setSignInOpen(true);
                    setIsSignUpOpen(true);
                  }}
                >
                  Sign Up
                </span>{" "}
                {`and earn`}{" "}
                <span className="font-semibold">
                  {loyaltyRule.signUpValue} {loyaltyRule?.name}
                </span>
              </p>
            ) : null}

            <div className="my-2 pt-4 relative">
              <div className="grid grid-cols-12 gap-4">
                <input
                  type="text"
                  value={promoCodeInput}
                  placeholder="Enter your promo code"
                  className="w-full p-2 border border-gray-300 rounded-md col-span-8 outline-none"
                  disabled
                />
                <button
                  disabled={true}
                  className="w-full bg-primary text-white px-4 rounded-full h-auto transition duration-200 flex items-center justify-center col-span-4 disabled:bg-primary/60"
                  style={{
                    color: isContrastOkay(
                      Env.NEXT_PUBLIC_PRIMARY_COLOR,
                      Env.NEXT_PUBLIC_BACKGROUND_COLOR
                    )
                      ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
                      : Env.NEXT_PUBLIC_TEXT_COLOR,
                  }}
                >
                  Apply
                </button>
              </div>
              <p className="text-xs font-thin text-gray-400 mb-4 mt-1">
                Sign Up / Sign In to apply promocode
              </p>
              <Carousel
                setApi={setCarouselApi}
                opts={{
                  align: "center",
                  loop: false,
                  skipSnaps: false,
                  dragFree: false,
                  containScroll: "keepSnaps",
                }}
                className="w-full overflow-hidden z-0"
              >
                <CarouselContent className="transition-transform duration-300 ease-out">
                  {loyaltyRewards.map((offer, index) => (
                    <CarouselItem key={index}>
                      <div
                        key={index}
                        data-promo-card
                        className="bg-white border transition-all duration-300 w-full md:h-32 rounded-[20px] -z-10"
                      >
                        <div className="p-3 md:p-4 h-full flex flex-col justify-center">
                          <div className="flex items-start justify-between">
                            <div className="flex-grow pr-2">
                              {/* <p className="sm:text-lg text-base font-bold text-gray-900 mb-1 line-clamp-1 font-online-ordering">
                                {offer.name}
                              </p>
                              <p className="text-xs text-gray-600 line-clamp-1 font-online-ordering">
                                {offer.points} {loyaltyRule?.name ?? "points"}{" "}
                                required
                              </p> */}
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
                                <p className="text-xs sm:text-sm px-2 py-1 text-gray-600">
                                  Sign Up / Sign In to redeem
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>

                <div className="flex gap-4 mt-4 justify-center">
                  {loyaltyRewards.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrent(index);
                        carouselApi?.scrollTo(index);
                      }}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        current === index ? "bg-primary w-4" : "bg-gray-400 w-2"
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </Carousel>
            </div>
          </>
        ) : null}

        {cartDetails?.discountString ? (
          <div className="bg-green-50 py-3 px-3 rounded-md shadow-sm flex items-center justify-between font-online-ordering">
            <div className="flex items-center">
              <div className="text-green-700 font-medium mr-6">
                <p>Offer applied!</p>
                {cartDetails.discountString}
              </div>
            </div>
            <button
              onClick={handleRemoveOffer}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        ) : null}

        {meCustomerData && !cartDetails?.discountString ? (
          <>
            <form
              onSubmit={handleApplyOffer}
              className="grid grid-cols-12 gap-4 w-full"
            >
              <input
                type="text"
                value={promoCodeInput}
                onChange={(e) => {
                  let input = e.target.value.toUpperCase();
                  if (input.length > 12) {
                    input = input.slice(0, 12);
                  }
                  setPromoCodeInput(input);
                }}
                placeholder="Enter your promo code"
                className="w-full p-2 border border-gray-300 rounded-md col-span-8 outline-none"
              />
              <button
                type="submit"
                disabled={addPromoLoading || promoCodeInput.length === 0}
                className="w-full bg-primary text-white px-4 rounded-full h-auto transition duration-200 flex items-center justify-center col-span-4 disabled:bg-primary/60"
                style={{
                  color: isContrastOkay(
                    Env.NEXT_PUBLIC_PRIMARY_COLOR,
                    Env.NEXT_PUBLIC_BACKGROUND_COLOR
                  )
                    ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
                    : Env.NEXT_PUBLIC_TEXT_COLOR,
                }}
              >
                {addPromoLoading ? (
                  <>
                    <AiOutlineLoading3Quarters className="animate-spin mr-2" />
                    Loading...
                  </>
                ) : (
                  "Apply"
                )}
              </button>
            </form>
            {promoError ? (
              <p className="text-red-500 text-sm mt-2 col-span-12">
                {promoError}
              </p>
            ) : null}

            {/* Loyalty */}
            <div className="my-2 pt-4">
              <p className="text-sm text-gray-600 mb-2">
                {`Your loyalty balance is`}{" "}
                <span className="font-semibold">
                  {meCustomerData?.loyaltyWallet?.balance} {loyaltyRule?.name}
                </span>
              </p>

              {loyaltyError ? (
                <p className="text-red-500 text-sm mt-2 col-span-12">
                  {loyaltyError}
                </p>
              ) : null}

              <Carousel
                setApi={setCarouselApi}
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
                  {loyaltyRewards.map((offer, index) => (
                    <CarouselItem key={index}>
                      <div
                        key={index}
                        data-promo-card
                        className="bg-white border transition-all duration-300 w-full h-28 md:h-32 shrink-0 rounded-[20px]"
                      >
                        <div className="p-3 md:p-4 h-full flex flex-col justify-center">
                          <div className="flex items-start justify-between">
                            <div className="flex-grow pr-2">
                              {/* <p className="sm:text-lg text-base font-bold text-gray-900 mb-1 line-clamp-1 font-online-ordering">
                                {offer.name}
                              </p>
                              <p className="text-xs text-gray-600 line-clamp-1 font-online-ordering">
                                {offer.points} {loyaltyRule?.name ?? "points"}{" "}
                                required
                              </p> */}
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
                                    disabled={applyLoyaltyLoading}
                                    className={`inline-flex items-center px-3 py-1.5 text-sm font-medium transition-colors rounded-full bg-white text-primary border border-primary disabled:opacity-50 disabled:bg-gray-300`}
                                  >
                                    {applyLoyaltyLoading ? (
                                      <div className="text-black flex items-center">
                                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                        <p>Applying...</p>
                                      </div>
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
                    </CarouselItem>
                  ))}
                </CarouselContent>

                <div className="flex gap-4 mt-4 justify-center">
                  {loyaltyRewards.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrent(index);
                        carouselApi?.scrollTo(index);
                      }}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        current === index ? "bg-primary w-4" : "bg-gray-400 w-2"
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </Carousel>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
};

export default CartOffers;
