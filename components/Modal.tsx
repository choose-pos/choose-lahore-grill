"use client";

import {
  AddressInfoInput,
  OrderType,
  StateDataInput,
  LoyaltyRedeemType,
} from "@/generated/graphql";
import { useCartStore } from "@/store/cart";
import { OrderTypeData } from "@/store/orderType";
import RestaurantStore from "@/store/restaurant";
import ToastStore from "@/store/toast";
import {
  extractErrorMessage,
  extractFreeDiscountItemDetails,
} from "@/utils/UtilFncs";
// import { convertToUTC } from "@/utils/formattedTime";
import {
  convertNowToUtc,
  convertToUtcForTimeSlots,
  getTimeSlots,
  isAsapAvailable,
} from "@/utils/formattedTime";
import { getDistance } from "@/utils/getDistance";
import { fetchWithAuth, sdk } from "@/utils/graphqlClient";
import { refreshCartDetails } from "@/utils/refreshCartDetails";
import { Address, Availability } from "@/utils/types";
import debounce from "lodash.debounce";
// import moment from "moment";
import { Env } from "@/env";
import { isContrastOkay } from "@/utils/isContrastOkay";
import { fadeIn } from "@/utils/motion";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { FiCalendar, FiCheck, FiChevronLeft, FiClock } from "react-icons/fi";
import { IoArrowForward, IoClose } from "react-icons/io5";
import AsyncSelect from "react-select/async";
import { useModalStore } from "../store/global";
import { getOrCreateUserHash } from "@/utils/analytics";
import { sendAnalyticsEvent } from "@/hooks/useAnalytics";
import { refreshCartCount } from "@/utils/getCartCountData";
import { DateTime } from "luxon";
import { useRouter } from "next/navigation";
import { LuMoveLeft, LuMoveRight } from "react-icons/lu";
import { FaArrowRightArrowLeft } from "react-icons/fa6";

type PlaceType = {
  label: string;
  value: string;
};

// type TimeOption = {
//   label: string;
//   value: string;
// };

const Modal: React.FC<{
  address: Address;
  restaurantName: string;
  availability: Availability[];
}> = ({ address, restaurantName }) => {
  const router = useRouter();
  const {
    setShowMenu,
    daysList,
    isAsap,
    setIsAsap,
    setTimesList,
    timesList,
    clickState,
    setClickState,
    loadingItem,
    setLoadingItem,
    showMenu,
  } = useModalStore();
  const { setTempOrderType, tempOrderType } = OrderTypeData();
  const { setToastData } = ToastStore();
  const { restaurantData, setSelectedItem, selectedCategoryId } =
    RestaurantStore();
  const {
    setCartDetails,
    cartDetails,
    setCartCountInfo,
    fetchTrigger,
    setFetchTrigger,
  } = useCartStore();
  const [showSchedule, setShowSchedule] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showAllDates, setShowAllDates] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [restaurantClose, setRestaurantClose] = useState<boolean>(false);
  const [selectedPickupPlace, setSelectedPickupPlace] =
    useState<PlaceType | null>(null);
  const [selectedDeliveryPlace, setSelectedDeliveryPlace] =
    useState<PlaceType | null>(null);
  // const [tempOrderType, setTempOrderType] = useState<OrderType>(
  //   OrderType.Pickup
  // );
  const [tempUserAddress, setTempUserAddress] =
    useState<AddressInfoInput | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [tempDeliveryDay, setTempDeliveryDay] = useState<string>("");
  const [tempDeliveryTime, setTempDeliveryTime] = useState<string>("");
  const isDelivery = restaurantData?.deliveryConfig.provideDelivery;
  const isPickUp = restaurantData?.restaurantConfigs.pickup;
  const isScheduling = restaurantData?.restaurantConfigs.scheduleOrders;
  const [isDateScrollable, setIsDateScrollable] = useState(false);
  const dateScrollerRef = useRef<HTMLDivElement>(null);
  const [scrollDateDirection, setScrollDateDirection] = useState<
    "right" | "left"
  >("right");




  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const checkScrollable = () => {
    if (dateScrollerRef.current) {
      const { scrollWidth, clientWidth } = dateScrollerRef.current;
      setIsDateScrollable(scrollWidth > clientWidth);
      handleDateScroll();
    }
  };

  useEffect(() => {
    checkScrollable();
    window.addEventListener("resize", checkScrollable);
    return () => window.removeEventListener("resize", checkScrollable);
  }, [daysList, isScheduling, showSchedule]);

  const scrollDates = () => {
    if (dateScrollerRef.current) {
      const scrollAmount = 150;
      if (scrollDateDirection === "right") {
        dateScrollerRef.current.scrollBy({
          left: scrollAmount,
          behavior: "smooth",
        });
      } else {
        dateScrollerRef.current.scrollBy({
          left: -scrollAmount,
          behavior: "smooth",
        });
      }
    }
  };

  const handleDateScroll = () => {
    if (dateScrollerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = dateScrollerRef.current;
      const atEnd = scrollLeft + clientWidth >= scrollWidth - 10;
      const atStart = scrollLeft <= 10;

      if (atEnd) {
        setScrollDateDirection("left");
      } else if (atStart) {
        setScrollDateDirection("right");
      }
    }
  };

  useEffect(() => {
    if (cartDetails?.delivery && cartDetails.delivery.place) {
      setTempUserAddress(cartDetails.delivery as AddressInfoInput);
      setSelectedDeliveryPlace({
        label: cartDetails.delivery.place?.displayName,
        value: cartDetails.delivery.place?.placeId,
      });
    }
  }, [cartDetails]);

  // useEffect(() => {
  //   if (!showMenu) {
  //     document.body.classList.add("overflow-y-hidden");
  //   } else {
  //     document.body.classList.remove("overflow-y-hidden");
  //   }
  //   return () => {
  //     document.body.classList.remove("overflow-y-hidden");
  //   };
  // }, [showMenu]);

  useEffect(() => {
    // Assuming there's only one restaurant, auto-select it when modal opens
    if (!showCalendar) {
      setShowCalendar(true);
    }
  }, [showCalendar]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  // useEffect(()=> {
  //   const updateCartSession = async () => {

  //   }
  //   updateCartSession()

  // }, [orderData])

  const areAllValuesFilled = () => {
    if (cartDetails?.orderType === OrderType.Pickup) {
      if (cartDetails.pickUpDateAndTime) {
        const d = new Date(cartDetails.pickUpDateAndTime);
        if (new Date() > d) {
          return false;
        }
      }

      return !!cartDetails.pickUpDateAndTime;
    } else {
      if (cartDetails?.deliveryDateAndTime) {
        const d = new Date(cartDetails.deliveryDateAndTime);
        if (new Date() > d) {
          return false;
        }
      }

      return !!cartDetails?.delivery && !!cartDetails.deliveryDateAndTime;
    }
  };

  const handleAddToCart = async (itemId: string) => {
    setLoadingItem(itemId);

    try {
      const res = await sdk.AddToCart({
        items: {
          itemId: itemId ?? "",
          qty: 1,
          categoryId: selectedCategoryId,
        },
      });
      if (res.addToCart) {
        // Track event
        const userHash = getOrCreateUserHash(); // Generate or retrieve persistent user hash

        sendAnalyticsEvent({
          restaurant: Env.NEXT_PUBLIC_RESTAURANT_ID,
          pagePath: "/menu",
          pageQuery: null, // Include query only if present
          source: document.referrer || "direct", // Fallback to 'direct' if no referrer
          utm: null, // Extract UTM parameters from the query
          userHash, // Attach the user identifier
          eventType: "add_to_cart",
          metadata: {
            id: itemId,
            // name: category?.name ?? "",
          },
        });

        // setItemData(formattedCartItem);
        try {
          const res = await refreshCartCount();
          const res2 = await refreshCartDetails();
          if (res2?.CartDetails) {
            // Check if we have a free item
            const currentFreeItem = extractFreeDiscountItemDetails(
              res2.CartDetails.discountString ?? "",
            );

            // Set cart count including free item if it exists
            if (res) {
              setCartCountInfo(res + (currentFreeItem ? 1 : 0));
            }

            setCartDetails(res2.CartDetails);
          }
        } catch (error) {
          setToastData({
            message: extractErrorMessage(error),
            type: "error",
          });
        }
        if (!isMobile) {
          setToastData({
            type: "success",
            message: "Item added successfuly!",
          });
        }
      }
    } catch (error) {
      setToastData({ message: extractErrorMessage(error), type: "error" });
      console.error("Failed to add item to cart:", error);
    } finally {
      setLoadingItem(null);
    }
  };

  // useEffect(() => {
  //   if (isPickUp) {
  //     setTempOrderType(OrderType.Pickup);
  //   } else if (isDelivery) {
  //     setTempOrderType(OrderType.Delivery);
  //   }
  // }, []);

  const loadOptions = (
    inputValue: string,
    callback: (options: PlaceType[]) => void,
  ) => {
    sdk.AllPlaces({ input: inputValue }).then((d) => {
      callback(
        d.getPlacesList.map((el: { displayName: string; placeId: string }) => ({
          label: el.displayName,
          value: el.placeId,
        })),
      );
    });
  };

  const debouncedLoadOptions = debounce(loadOptions, 800);

  const handlePickupPlaceSelect = async (option: PlaceType | null) => {
    setSelectedPickupPlace(option);
    if (option) {
      const d = await sdk.PlaceDetails({ placeId: option.value });

      if (d.getPlaceDetails) {
        const { latitude, longitude } = d.getPlaceDetails;
        if (
          address.coordinate?.coordinates[0] &&
          address.coordinate?.coordinates[1]
        ) {
          const distance = getDistance(
            latitude,
            longitude,
            address.coordinate.coordinates[0],
            address.coordinate.coordinates[1],
          );
          setDistance(distance);
        }
      }
    }
  };

  const handleLoyaltyRedeem = async (
    points: number,
    redeemType: LoyaltyRedeemType,
  ) => {
    try {
      const res = await fetchWithAuth(() =>
        sdk.validateLoyaltyRedemptionOnCart({
          input: { loyaltyPointsRedeemed: points, redeemType },
        }),
      );

      if (res.validateLoyaltyRedemptionOnCart) {
        // Refresh cart details after applying loyalty
        const updatedCart = await refreshCartDetails();
        if (updatedCart?.CartDetails) {
          setCartDetails(updatedCart.CartDetails);
        }
        router.push(`/menu/cart`);
      }
    } catch (error) {
      setToastData({
        type: "error",
        message: extractErrorMessage(error),
      });
    }
  };

  const handleDeliveryPlaceSelect = async (option: PlaceType | null) => {
    setSelectedDeliveryPlace(option);

    if (option) {
      const d = await sdk.PlaceDetails({ placeId: option.value });

      if (d.getPlaceDetails) {
        const { latitude, longitude } = d.getPlaceDetails;
        const location = [latitude, longitude];
        let updatedAddress = {
          ...tempUserAddress,
          coordinate: { coordinates: location },
          addressLine1: d.getPlaceDetails.address || "", // Ensure non-undefined values
          city: d.getPlaceDetails.city || "",
          zipcode: d.getPlaceDetails.zipcode
            ? parseFloat(d.getPlaceDetails.zipcode)
            : 0,
          place: { displayName: option.label, placeId: option.value },
        };

        if (d.getPlaceDetails.state) {
          const stateData = await sdk.AllPlaces({
            input: d.getPlaceDetails.state,
          });
          if (stateData.getPlacesList.length > 0) {
            const stateInfo: StateDataInput = {
              stateName: d.getPlaceDetails.state || "",
              stateId: stateData.getPlacesList[0].placeId,
            };

            updatedAddress = {
              ...updatedAddress,
              state: stateInfo,
            };
          }
        }

        setTempUserAddress(updatedAddress as AddressInfoInput);
      }
    }
  };

  const handleScheduleOrder = async (isAsapOrder: boolean = false) => {
    const restaurantTimeZone =
      restaurantData?.timezone.timezoneName?.split(" ")[0] ?? "";
    const prepTime = restaurantData?.fulfillmentConfig?.prepTime ?? 0;

    if (!restaurantTimeZone) {
      return;
    }

    let res1;
    let res2;

    try {
      if (tempOrderType === OrderType.Pickup) {
        try {
          res1 = await sdk.updateCartDetails({
            input: {
              orderType: tempOrderType,
              delivery: null,
              pickUpDateAndTime: isAsapOrder
                ? convertNowToUtc(restaurantTimeZone, prepTime)
                : convertToUtcForTimeSlots(
                    tempDeliveryDay,
                    tempDeliveryTime,
                    restaurantTimeZone,
                  ),
              isAsap: isAsapOrder,
            },
          });
        } catch (error) {
          setToastData({ message: extractErrorMessage(error), type: "error" });
        }
      }

      if (tempOrderType !== OrderType.Pickup && tempUserAddress) {
        try {
          res2 = await sdk.validateDelivery({
            input: {
              // delivery: tempUserAddress,
              delivery: {
                addressLine1: tempUserAddress.addressLine1,
                city: tempUserAddress.city,
                place: tempUserAddress.place,
                state: tempUserAddress.state,
                zipcode: tempUserAddress.zipcode,
                addressLine2: undefined,
                coordinate: {
                  coordinates: [
                    tempUserAddress.coordinate.coordinates[0],
                    tempUserAddress.coordinate.coordinates[1],
                  ],
                },
              },
              deliveryDateAndTime: isAsapOrder
                ? convertNowToUtc(restaurantTimeZone, prepTime)
                : convertToUtcForTimeSlots(
                    tempDeliveryDay,
                    tempDeliveryTime,
                    restaurantTimeZone,
                  ),
              isAsap: isAsapOrder,
            },
          });
        } catch (error) {
          console.log(error);
          setToastData({
            type: "error",
            message: extractErrorMessage(error),
          });
        }
      }
      setFetchTrigger(fetchTrigger + 1);
    } catch (error) {
      setToastData({
        type: "error",
        message: extractErrorMessage(error),
      });
      console.log(error);
    }
    if (res1?.updateCartDetails && res2 === undefined) {
      setShowMenu(true);
      if (clickState) {
        if (clickState.type === "add") {
          handleAddToCart(clickState.id);
        } else if (clickState.type === "loyalty") {
          handleLoyaltyRedeem(clickState.points, clickState.redeemType);
        } else {
          setSelectedItem(clickState.id);
        }
        setClickState(null);
      }
    } else if (!res2?.validateDelivery) {
      setShowMenu(false);
    } else {
      setShowMenu(true);
      if (clickState) {
        if (clickState.type === "add") {
          handleAddToCart(clickState.id);
        } else if (clickState.type === "loyalty") {
          handleLoyaltyRedeem(clickState.points, clickState.redeemType);
        } else {
          setSelectedItem(clickState.id);
        }
        setClickState(null);
      }
    }
    try {
      const res = await refreshCartDetails();
      if (res?.CartDetails) {
        setCartDetails(res.CartDetails);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const timeOptionsRef = useRef(null);

  useEffect(() => {
    if (daysList.length > 0 && tempDeliveryDay === "") {
      setTempDeliveryDay(daysList[0].label);
    }
  }, [daysList, tempDeliveryDay]);

  useEffect(() => {
    if (restaurantData?.fulfillmentConfig) {
      const restaurantTimeZone =
        restaurantData.timezone.timezoneName?.split(" ")[0] ?? "";
      const avl = restaurantData.availability ?? [];

      if (
        !restaurantData.fulfillmentConfig?.prepTime ||
        !restaurantData.fulfillmentConfig?.deliveryTime
      ) {
        return;
      }

      const checkAsap = isAsapAvailable(
        restaurantTimeZone,
        avl,
        tempOrderType === OrderType.Pickup
          ? restaurantData.fulfillmentConfig.prepTime
          : restaurantData.fulfillmentConfig.deliveryTime +
              restaurantData.fulfillmentConfig.prepTime,
        restaurantData.onlineOrderTimingConfig?.startAfterMinutes ?? 0,
        restaurantData.onlineOrderTimingConfig?.endBeforeMinutes ?? 0,
      );

      setIsAsap(checkAsap);
    }
  }, [restaurantData, setIsAsap, tempOrderType]);

  useEffect(() => {
    if (restaurantData?.fulfillmentConfig && tempDeliveryDay) {
      const restaurantTimeZone =
        restaurantData.timezone.timezoneName?.split(" ")[0] ?? "";
      const avl = restaurantData.availability ?? [];

      if (
        !restaurantData.fulfillmentConfig?.prepTime ||
        !restaurantData.fulfillmentConfig?.deliveryTime
      ) {
        return;
      }
      const customerNow = new Date();
      const restaurantNowLuxon = DateTime.fromISO(customerNow.toISOString(), {
        zone: restaurantTimeZone,
      });

      if (!isScheduling) {
        const [dayLabel, , dayDate] = tempDeliveryDay.split(" ");
        const selectedDate = restaurantNowLuxon.set({ day: Number(dayDate) });

        const dayName = selectedDate.weekdayLong ?? "";
        const availability = avl.find(
          (day) => day.day.toLowerCase() === dayName.toLowerCase(),
        );

        if (!availability || !availability.active) {
          setTimesList([]);
          return;
        }

        const isToday = selectedDate.hasSame(restaurantNowLuxon, "day");

        if (isToday && availability.hours && availability.hours.length > 0) {
          const endBeforeMinutes =
            restaurantData.onlineOrderTimingConfig?.endBeforeMinutes ?? 0;
          const lastHour = availability.hours[0];

          const [endHour, endMinute] = lastHour.end.split(":").map(Number);
          const restaurantClosingTime = restaurantNowLuxon.set({
            hour: endHour,
            minute: endMinute,
            second: 0,
            millisecond: 0,
          });

          const lastOrderingTime = restaurantClosingTime.minus({
            minutes: endBeforeMinutes,
          });

          if (restaurantNowLuxon > lastOrderingTime) {
            setTimesList([]);
            setRestaurantClose(true);
            return;
          }
        }
      }

      const slots = getTimeSlots(
        restaurantTimeZone,
        avl,
        // customerTimeZone,
        tempDeliveryDay,
        isAsap,
        tempOrderType === OrderType.Pickup
          ? restaurantData.fulfillmentConfig.prepTime
          : restaurantData.fulfillmentConfig.deliveryTime +
              restaurantData.fulfillmentConfig.prepTime,
        restaurantData.onlineOrderTimingConfig?.startAfterMinutes ?? 0,
        restaurantData.onlineOrderTimingConfig?.endBeforeMinutes ?? 0,
      );

      setTimesList(slots);
    }
  }, [restaurantData, tempDeliveryDay, setTimesList, isAsap, tempOrderType]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-end sm:items-center justify-center !z-50 bg-black bg-opacity-50 bottom-0 "
    >
      <motion.div
        variants={fadeIn("up", "tween", 0, 0.3)}
        initial="hidden"
        animate="show"
        exit="hidden"
        className="bg-white rounded-md w-full h-[75vh] overflow-y-auto sm:overflow-visible sm:h-auto sm:w-11/12 sm:max-w-xl relative"
      >
        {areAllValuesFilled() && (
          <button
            onClick={() => {
              setShowMenu(true);
            }}
            className="absolute top-3 right-3 z-50 p-1 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
          >
            <IoClose size={20} />
          </button>
        )}
        {!showSchedule ? (
          <>
            <div className="pt-10  px-6 sm:px-8 pb-5">
              <div className="flex relative bg-gray-100 rounded-md p-1 items-center shadow-inner">
                <div
                  className="absolute top-1 bottom-1 bg-white transition-transform duration-300 ease-in-out rounded-md shadow-sm"
                  style={{
                    width: "calc(50% - 4px)",
                    transform: `translateX(${
                      tempOrderType === OrderType.Pickup
                        ? "4px"
                        : "calc(100% + 4px)"
                    })`,
                    left: 0,
                  }}
                />
                <button
                  className={`flex-1 py-2 text-center focus:outline-none relative z-10 font-subheading-oo text-[15px] md:text-base transition-colors duration-300 ${
                    tempOrderType === OrderType.Pickup
                      ? "text-gray-900 font-semibold"
                      : "text-gray-500"
                  } ${!isPickUp ? "opacity-40 cursor-not-allowed" : ""}`}
                  onClick={() => isPickUp && setTempOrderType(OrderType.Pickup)}
                  disabled={!isPickUp}
                >
                  {isPickUp ? "Pickup" : "Pickup Unavailable"}
                </button>
                <button
                  className={`flex-1 py-2 text-center focus:outline-none relative z-10 font-subheading-oo text-[15px] md:text-base transition-colors duration-300 ${
                    tempOrderType === OrderType.Delivery
                      ? "text-gray-900 font-semibold"
                      : "text-gray-500"
                  } ${!isDelivery ? "opacity-40 cursor-not-allowed" : ""}`}
                  disabled={!isDelivery}
                  onClick={() => setTempOrderType(OrderType.Delivery)}
                >
                  {isDelivery ? "Delivery by Uber" : "Delivery Unavailable"}
                </button>
              </div>
            </div>
            <div className="pb-6 sm:pb-10 px-6 sm:px-8 pt-6 border-t border-gray-100">
              {tempOrderType === OrderType.Pickup ? (
                <div>
                  <h3 className="sm:text-2xl text-xl font-semibold font-subheading-oo mb-2 sm:mb-4 text-gray-900 ">
                    Pickup Details
                  </h3>
                  {/* <AsyncSelect
                    loadOptions={debouncedLoadOptions}
                    onChange={handlePickupPlaceSelect}
                    value={selectedPickupPlace}
                    placeholder="Find the closest location for your order"
                    className="mb-4"
                  /> */}
                  <div className="rounded-lg sm:mt-4 mt-4 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-900 font-subheading-oo">
                        {restaurantName}
                      </p>
                      <p className="text-gray-800 font-body-oo">
                        {address.addressLine1}
                      </p>
                    </div>
                    <div className="flex">
                      <p className="mr-1">
                        {distance !== null
                          ? distance.toFixed(2) + " miles"
                          : ""}
                      </p>
                      <input
                        type="radio"
                        checked={showCalendar}
                        className="flex items-center justify-center w-6 h-6 rounded-full text-white cursor-pointer accent-primary focus:ring-primary border-gray-300"
                        onChange={(e) => {
                          setShowCalendar(e.target.checked);
                        }}
                      />
                    </div>
                  </div>
                  {isAsap && showCalendar && (
                    <div
                      onClick={async () => {
                        await handleScheduleOrder(true);
                      }}
                      className="flex justify-between items-center border-b border-gray-200 py-5 cursor-pointer mt-4"
                    >
                      <div>
                        <h4 className="text-base font-semibold font-subheading-oo text-gray-900">
                          ASAP Order
                        </h4>
                        <p className="text-sm font-body-oo text-gray-500 mt-0.5">
                          Pickup available in{" "}
                          {restaurantData?.fulfillmentConfig?.prepTime} mins
                        </p>
                      </div>
                      <IoArrowForward size={20} className="text-gray-900" />
                    </div>
                  )}
                  {showCalendar && (
                    <div
                      onClick={() => setShowSchedule(!showSchedule)}
                      className="flex justify-between font-subheading-oo items-center border-b border-gray-200 py-5 cursor-pointer"
                    >
                      <div>
                        <h4 className="text-base font-semibold font-subheading-oo text-gray-900">
                          Schedule Your Order
                        </h4>
                        <p className="text-sm font-body-oo text-gray-500 mt-0.5">
                          Select a date and time for your order.
                        </p>
                      </div>
                      <IoArrowForward size={20} className="text-gray-900" />
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="p-3 pl-0 sm:pl-0 sm:p-4 rounded-r-lg font-body-oo mb-2">
                    <p className="text-xs sm:text-sm text-gray-600 font-body-oo">
                      <span className="font-semibold">Note: </span>
                      Delivery fees are charged by Uber. The restaurant earns
                      nothing from delivery services. Please reach out to Uber
                      support for any issues.
                    </p>
                  </div>
                  <h3 className="sm:text-2xl text-xl  font-semibold mb-4  text-gray-800 font-subheading-oo">
                    Delivery Address
                  </h3>
                  <div className="space-y-4">
                    <AsyncSelect
                      loadOptions={debouncedLoadOptions}
                      onChange={handleDeliveryPlaceSelect}
                      value={selectedDeliveryPlace}
                      placeholder="Street Address"
                      className="mb-4 font-body-oo"
                      isClearable={true}
                    />
                    <input
                      className="w-full py-2 px-3 font-body-oo bg-white rounded-sm focus:outline-none border border-gray-300  focus:ring-1 focus:ring-primary focus:border-primary"
                      placeholder="Apartment / Unit Number"
                      value={tempUserAddress?.addressLine2 || ""}
                      onChange={(e) =>
                        setTempUserAddress(
                          (prev) =>
                            ({
                              ...prev,
                              addressLine2: e.target.value,
                            }) as AddressInfoInput,
                        )
                      }
                    />
                    {isAsap && tempUserAddress?.addressLine1 && (
                      <div
                        onClick={async () => {
                          await handleScheduleOrder(true);
                        }}
                        className="flex justify-between items-center border-b border-gray-200 py-5 cursor-pointer mt-2"
                      >
                        <div>
                          <h4 className="text-base font-semibold font-subheading-oo text-gray-900">
                            ASAP Order
                          </h4>
                          <p className="text-sm font-body-oo text-gray-500 mt-0.5">
                            Delivery in{" "}
                            {(restaurantData?.fulfillmentConfig?.prepTime ??
                              0) +
                              (restaurantData?.fulfillmentConfig
                                ?.deliveryTime ?? 0)}{" "}
                            mins
                          </p>
                        </div>
                        <IoArrowForward size={20} className="text-gray-900" />
                      </div>
                    )}
                  </div>
                  {tempUserAddress?.addressLine1 && (
                    <div
                      onClick={() => setShowSchedule(!showSchedule)}
                      className="flex justify-between items-center border-b border-gray-200 py-5 cursor-pointer"
                    >
                      <div>
                        <h4 className="text-base font-semibold font-subheading-oo text-gray-900">
                          Schedule Your Order
                        </h4>
                        <p className="text-sm font-body-oo text-gray-500 mt-0.5">
                          Select a date and time for your order.
                        </p>
                      </div>
                      <IoArrowForward size={20} className="text-gray-900" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="p-4 sm:p-6 max-w-2xl mx-auto bg-white sm:shadow-lg  sm:rounded-[30px] h-full  sm:h-[90vh] flex flex-col ">
            <button
              className="sm:mb-4 mt-2 sm:mt-0 flex items-center transition-colors duration-200"
              onClick={() => setShowSchedule(false)}
            >
              <FiChevronLeft
                className="sm:mr-2 mr-1 mb-[2px] sm:mb-0"
                size={24}
              />
              <span className="text-base font-subheading-oo sm:text-lg font-medium">
                Back
              </span>
            </button>

            <h3 className="text-lg md:text-xl font-semibold font-subheading-oo text-gray-800">
              Schedule Your Order
            </h3>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm md:text-sm text-gray-600 font-body-oo">
                Select a date and time for your order.
              </p>
            </div>

            <div className="flex-grow flex flex-col overflow-hidden">
              <div className="flex justify-end">
                {isDateScrollable && (
                  <motion.button
                    onClick={scrollDates}
                    className="h-8 w-8 bg-white rounded-md flex items-center justify-center text-gray-700 hover:text-primary transition-colors flex-shrink-0"
                    animate={{
                      rotate: scrollDateDirection === "left" ? 180 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  >
                    <LuMoveRight size={18} />
                  </motion.button>
                )}
              </div>
              <div className="relative flex w-full mb-4">
                <div
                  ref={dateScrollerRef}
                  onScroll={handleDateScroll}
                  className="flex w-full gap-2 sm:gap-4 transition-all duration-300 pr-2 overflow-x-auto pb-2 scrollbar-hide flex-shrink-0 [&::-webkit-scrollbar]:hidden"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {isScheduling
                    ? daysList.map((day) => (
                        <button
                          key={day.label}
                          className={`flex flex-col items-start justify-center p-3 sm:px-4 min-w-[120px] rounded-md text-sm md:text-base font-medium transition-all duration-200 border 
                            ${
                              tempDeliveryDay === day.label
                                ? "bg-primary border-primary shadow-md"
                                : "bg-white border-gray-200 hover:bg-gray-50"
                            }`}
                          style={{
                            color:
                              tempDeliveryDay === day.label
                                ? isContrastOkay(
                                    Env.NEXT_PUBLIC_PRIMARY_COLOR,
                                    Env.NEXT_PUBLIC_BACKGROUND_COLOR,
                                  )
                                  ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
                                  : "#000000"
                                : "#374151",
                          }}
                          onClick={() => setTempDeliveryDay(day.label)}
                        >
                          <span className="block font-body-oo">
                            {day.label.split(" ")[0]}
                          </span>
                          {day.label.split(" ").slice(1).length > 0 && (
                            <span className="block  font-body-oo text-sm font-normal mt-1">
                              {day.label.split(" ").slice(1).join(" ")}
                            </span>
                          )}
                        </button>
                      ))
                    : daysList.slice(0, 1).map((day) => (
                        <button
                          key={day.label}
                          className="flex flex-col items-start justify-center p-3 sm:px-4 min-w-[120px] rounded-md text-sm md:text-base font-medium transition-all duration-200 bg-primary border border-primary text-white shadow-md"
                          onClick={() => setTempDeliveryDay(day.label)}
                          style={{
                            color: isContrastOkay(
                              Env.NEXT_PUBLIC_PRIMARY_COLOR,
                              Env.NEXT_PUBLIC_BACKGROUND_COLOR,
                            )
                              ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
                              : "#000000",
                          }}
                        >
                          <span className="block font-body-oo">
                            {day.label.split(" ")[0]}
                          </span>
                          {day.label.split(" ").slice(1).length > 0 && (
                            <span className="block font-body-oo text-sm font-normal mt-1">
                              {day.label.split(" ").slice(1).join(" ")}
                            </span>
                          )}
                        </button>
                      ))}
                </div>
              </div>

              <div className="flex flex-col mb-6 flex-grow overflow-y-auto pr-2">
                {" "}
                {timesList.length === 0 && restaurantClose ? (
                  <div className="w-full justify-center flex items-center">
                    <p className="text-lg font-subheading-oo md:text-xl mt-10 text-center">
                      Restaurant is closed for today!
                      <br />
                      We&apos;ll back tommorow...
                    </p>
                  </div>
                ) : (
                  timesList.map((time) => (
                    <label
                      key={time}
                      className="flex items-center space-x-4 cursor-pointer py-4 border-b border-gray-200 last:border-b-0 transition-all duration-200 bg-white hover:bg-gray-50"
                    >
                      <div className="relative flex items-center justify-center w-5 h-5 flex-shrink-0 cursor-pointer">
                        <input
                          ref={timeOptionsRef}
                          type="radio"
                          name="time"
                          value={time}
                          checked={tempDeliveryTime === time}
                          onChange={() => {
                            const restaurantTimeZone =
                              restaurantData?.timezone?.timezoneName?.split(
                                " ",
                              )[0] ?? "";
                            convertToUtcForTimeSlots(
                              tempDeliveryDay,
                              time,
                              restaurantTimeZone ?? "",
                            );
                            setTempDeliveryTime(time);
                          }}
                          className="peer absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors duration-200 pointer-events-none ${
                            tempDeliveryTime === time
                              ? "border-primary"
                              : "border-gray-300 peer-hover:border-gray-400"
                          }`}
                          style={{
                            borderWidth: "1.5px",
                            borderColor:
                              tempDeliveryTime === time
                                ? Env.NEXT_PUBLIC_PRIMARY_COLOR
                                : undefined,
                          }}
                        >
                          <div
                            className={`w-2.5 h-2.5 rounded-full transition-transform duration-200 ${
                              tempDeliveryTime === time
                                ? "scale-100"
                                : "scale-0"
                            }`}
                            style={{
                              backgroundColor: Env.NEXT_PUBLIC_PRIMARY_COLOR,
                            }}
                          />
                        </div>
                      </div>
                      <span className="text-sm  font-subheading-oo font-medium text-gray-800 flex-grow text-left">
                        {time}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <button
              className={`w-full p-2 rounded-md text-md mt-2 font-subheading-oo font-semibold transition-all duration-200 ${
                tempDeliveryDay && tempDeliveryTime
                  ? "bg-primary hover:bg-primary-dark shadow-lg"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
              style={{
                color:
                  tempDeliveryDay && tempDeliveryTime
                    ? isContrastOkay(
                        Env.NEXT_PUBLIC_PRIMARY_COLOR,
                        Env.NEXT_PUBLIC_BACKGROUND_COLOR,
                      )
                      ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
                      : "#000000"
                    : "#000000",
              }}
              disabled={!tempDeliveryDay || !tempDeliveryTime}
              onClick={() => handleScheduleOrder()}
            >
              View Menu
              <LuMoveRight className="inline-block ml-2 " />
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Modal;
