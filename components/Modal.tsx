"use client";

import {
  AddressInfoInput,
  OrderType,
  StateDataInput,
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
import { sdk } from "@/utils/graphqlClient";
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
  const {
    setShowMenu,
    daysList,
    isAsap,
    setIsAsap,
    setTimesList,
    timesList,
    showMenu,
    clickState,
    loadingItem,
    setClickState,
    setLoadingItem,
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
  const [restaurantClose, setRestaurantClose] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [selectedPickupPlace, setSelectedPickupPlace] =
    useState<PlaceType | null>(null);
  const [selectedDeliveryPlace, setSelectedDeliveryPlace] =
    useState<PlaceType | null>(null);
  // const [tempOrderType, setTempOrderType] = useState<OrderType>(
  //   OrderType.Pickup
  // );
  const [tempUserAddress, setTempUserAddress] =
    useState<AddressInfoInput | null>(null);
  const [tempDeliveryDay, setTempDeliveryDay] = useState<string>("");
  const [tempDeliveryTime, setTempDeliveryTime] = useState<string>("");
  const isDelivery = restaurantData?.deliveryConfig.provideDelivery;
  const isPickUp = restaurantData?.restaurantConfigs.pickup;
  const isScheduling = restaurantData?.restaurantConfigs.scheduleOrders;

  useEffect(() => {
    if (cartDetails?.delivery && cartDetails.delivery.place) {
      setTempUserAddress(cartDetails.delivery as AddressInfoInput);
      setSelectedDeliveryPlace({
        label: cartDetails.delivery.place?.displayName,
        value: cartDetails.delivery.place?.placeId,
      });
    }
  }, [cartDetails]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // useEffect(() => {
  //   if (!showMenu) {
  //     document.body.style.overflow = "hidden";
  //   } else {
  //     document.body.style.overflow = "unset";
  //   }
  //   return () => {
  //     document.body.style.overflow = "unset";
  //   };
  // }, [showMenu]);

    useEffect(() => {
    // Assuming there's only one restaurant, auto-select it when modal opens
    if (!showCalendar) {
      setShowCalendar(true);
    }
  }, [showCalendar]);

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
          itemId: clickState?.id ?? "",
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
              res2.CartDetails.discountString ?? ""
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
    callback: (options: PlaceType[]) => void
  ) => {
    sdk.AllPlaces({ input: inputValue }).then((d) => {
      callback(
        d.getPlacesList.map((el: { displayName: string; placeId: string }) => ({
          label: el.displayName,
          value: el.placeId,
        }))
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
            address.coordinate.coordinates[1]
          );
          setDistance(distance);
        }
      }
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
                    restaurantTimeZone
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
                    restaurantTimeZone
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
        restaurantData.onlineOrderTimingConfig?.endBeforeMinutes ?? 0
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
          (day) => day.day.toLowerCase() === dayName.toLowerCase()
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
        restaurantData.onlineOrderTimingConfig?.endBeforeMinutes ?? 0
      );

      setTimesList(slots);
    }
  }, [restaurantData, tempDeliveryDay, setTimesList, isAsap, tempOrderType]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center !z-50 bg-black bg-opacity-50 bottom-0 font-online-ordering"
    >
      <motion.div
        variants={fadeIn("up", "tween", 0, 0.3)}
        initial="hidden"
        animate="show"
        exit="hidden"
        className="bg-white sm:rounded-[30px] w-full h-full sm:h-auto sm:w-11/12 sm:max-w-xl relative"
      >
        {areAllValuesFilled() && (
          <button
            onClick={() => {
              setShowMenu(true);
            }}
            className="absolute top-4 right-4 z-50 p-2 rounded-full hover:bg-gray-100"
          >
            <IoClose size={24} />
          </button>
        )}
        {!showSchedule ? (
          <>
            <div className="pt-12 px-6">
              <div className="flex relative">
                <div
                  className="absolute top-0 h-full bg-gray-100 transition-all duration-300 ease-in-out rounded-t-lg shadow-md"
                  style={{
                    width: "50%",
                    transform: `translateX(${
                      tempOrderType === OrderType.Pickup ? "0%" : "100%"
                    })`,
                  }}
                />
                <button
                  className={`flex-1 py-3 text-center focus:outline-none relative z-10 font-online-ordering ${
                    tempOrderType === OrderType.Pickup ? "" : "text-gray-500"
                  } ${!isPickUp ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={() => isPickUp && setTempOrderType(OrderType.Pickup)}
                  disabled={!isPickUp}
                >
                  {isPickUp ? "Pickup" : "Pickup Unavailable"}
                </button>
                <button
                  className={`flex-1 py-3 text-center focus:outline-none relative z-10 font-online-ordering ${
                    tempOrderType === OrderType.Delivery ? "" : "text-gray-500"
                  } ${!isDelivery ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={!isDelivery}
                  onClick={() => setTempOrderType(OrderType.Delivery)}
                >
                  {isDelivery ? "Delivery" : "Delivery Unavailable"}
                </button>
              </div>
            </div>
            <div className="pb-12 px-6 pt-6 border-t">
              {tempOrderType === OrderType.Pickup ? (
                <div>
                  <h3 className="sm:text-2xl text-xl font-bold mb-2 sm:mb-4 text-gray-800 font-online-ordering">
                    Pickup Details
                  </h3>
                  {/* <AsyncSelect
                    loadOptions={debouncedLoadOptions}
                    onChange={handlePickupPlaceSelect}
                    value={selectedPickupPlace}
                    placeholder="Find the closest location for your order"
                    className="mb-4"
                    isClearable={true}
                  /> */}
                  <div className="rounded-lg sm:p-4 sm:mt-4 mt-6 flex justify-between items-center">
                    <div>
                      <p className="font-bold font-online-ordering">
                        {restaurantName}
                      </p>
                      <p>{address.addressLine1}</p>
                    </div>
                    <div className="flex">
                      <p className="mr-1">
                        {distance !== null
                          ? distance.toFixed(2) + " miles"
                          : ""}
                      </p>
                      <input
                        type="radio"
                        // defaultChecked={showCalendar}
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
                      className="flex justify-between items-center border border-gray-300 rounded-lg p-4 cursor-pointer mt-4"
                    >
                      <div>
                        <h4 className="text-base font-bold">ASAP Order</h4>
                        <p className="text-sm text-gray-600">
                          Pickup available in{" "}
                          {restaurantData?.fulfillmentConfig?.prepTime} mins
                        </p>
                      </div>
                      <IoArrowForward size={20} className="" />
                    </div>
                  )}
                  {showCalendar && (
                    <div
                      onClick={() => setShowSchedule(!showSchedule)}
                      className="flex justify-between items-center border border-gray-300 rounded-lg p-4 cursor-pointer mt-4"
                    >
                      <div>
                        <h4 className="text-base font-bold">
                          Schedule Your Order
                        </h4>
                        <p className="text-sm text-gray-600">
                          Select a date and time for your order.
                        </p>
                      </div>
                      <IoArrowForward size={20} className="" />
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <h3 className="sm:text-2xl text-xl  font-bold mb-4  text-gray-800 font-online-ordering">
                    Delivery Address
                  </h3>
                  <div className="space-y-4">
                    <AsyncSelect
                      loadOptions={debouncedLoadOptions}
                      onChange={handleDeliveryPlaceSelect}
                      value={selectedDeliveryPlace}
                      placeholder="Street Address"
                      className="mb-4"
                      isClearable={true}
                    />
                    <input
                      className="w-full py-2 px-3 bg-white rounded-sm focus:outline-none border border-gray-300  focus:ring-1 focus:ring-primary focus:border-primary"
                      placeholder="Apartment / Unit Number"
                      value={tempUserAddress?.addressLine2 || ""}
                      onChange={(e) =>
                        setTempUserAddress(
                          (prev) =>
                            ({
                              ...prev,
                              addressLine2: e.target.value,
                            }) as AddressInfoInput
                        )
                      }
                    />
                    {isAsap && tempUserAddress?.addressLine1 && (
                      <div
                        onClick={async () => {
                          await handleScheduleOrder(true);
                        }}
                        className="flex justify-between items-center border border-gray-300 rounded-lg p-4 cursor-pointer mt-4"
                      >
                        <div>
                          <h4 className="text-base font-bold">ASAP Order</h4>
                          <p className="text-sm text-gray-600">
                            Delivery in{" "}
                            {(restaurantData?.fulfillmentConfig?.prepTime ??
                              0) +
                              (restaurantData?.fulfillmentConfig
                                ?.deliveryTime ?? 0)}{" "}
                            mins
                          </p>
                        </div>
                        <IoArrowForward size={20} className="" />
                      </div>
                    )}
                  </div>
                  {tempUserAddress?.addressLine1 && (
                    <div
                      onClick={() => setShowSchedule(!showSchedule)}
                      className="flex justify-between items-center border border-gray-300 rounded-lg p-4 cursor-pointer mt-4"
                    >
                      <div>
                        <h4 className="text-base font-bold">
                          Schedule Your Order
                        </h4>
                        <p className="text-sm text-gray-600">
                          Select a date and time for your order.
                        </p>
                      </div>
                      <IoArrowForward size={20} className="" />
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
              <span className="text-base sm:text-lg font-medium">Back</span>
            </button>

            <h3 className="text-lg md:text-xl font-bold  font-online-ordering text-gray-800">
              Schedule Your Order
            </h3>
            <p className="text-sm md:text-sm mb-4 sm:mb-6 text-gray-600">
              Select a date and time for your order.
            </p>

            <div className="flex-grow overflow-y-auto">
              <div
                className={`grid gap-2 sm:gap-4 mb-2 transition-all duration-300 pr-2 ${
                  isScheduling ? "grid-cols-2" : "grid-cols-1"
                } `}
              >
                {isScheduling
                  ? daysList
                      .slice(0, showAllDates ? daysList.length : 2)
                      .map((day) => (
                        <button
                          key={day.label}
                          className={`p-2 rounded-full text-sm md:text-base font-medium transition-all duration-200 ${
                            tempDeliveryDay === day.label
                              ? "bg-primary shadow-md"
                              : "bg-gray-100 hover:bg-gray-200"
                          }`}
                          style={{
                            color:
                              tempDeliveryDay === day.label
                                ? isContrastOkay(
                                    Env.NEXT_PUBLIC_PRIMARY_COLOR,
                                    Env.NEXT_PUBLIC_BACKGROUND_COLOR
                                  )
                                  ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
                                  : "#ffffff"
                                : isContrastOkay(
                                      "#f3f4f6",
                                      Env.NEXT_PUBLIC_PRIMARY_COLOR
                                    )
                                  ? Env.NEXT_PUBLIC_PRIMARY_COLOR
                                  : "#7d7a7a",
                          }}
                          onClick={() => setTempDeliveryDay(day.label)}
                        >
                          <FiCalendar className="inline-block mr-2 mb-1" />
                          {day.label}
                        </button>
                      ))
                  : daysList.slice(0, 1).map((day) => (
                      <button
                        key={day.label}
                        className="p-2 rounded-full text-sm md:text-base font-medium transition-all duration-200 bg-primary text-white shadow-md"
                        onClick={() => setTempDeliveryDay(day.label)}
                        style={{
                          color: isContrastOkay(
                            Env.NEXT_PUBLIC_PRIMARY_COLOR,
                            Env.NEXT_PUBLIC_BACKGROUND_COLOR
                          )
                            ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
                            : "#ffffff",
                        }}
                      >
                        <FiCalendar className="inline-block mr-2 mb-1" />
                        {day.label}
                      </button>
                    ))}
              </div>

              {isScheduling && daysList.length > 2 && (
                <div className="flex justify-end pr-2 mb-4">
                  <button
                    className="font-semibold transition-colors duration-200 flex items-center gap-2 text-gray-800 hover:text-gray-900"
                    onClick={() => setShowAllDates(!showAllDates)}
                  >
                    {showAllDates ? "Show less days" : "Show more days"}
                    {showAllDates ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 gap-2 sm:gap-3 mb-6 max-h-[33vh]  pr-2 ">
                {timesList.length === 0 && restaurantClose ? (
                  <div className="w-full justify-center flex items-center">
                     <p className="text-lg md:text-xl mt-10 text-center">
                      Restaurant is closed for today! 
                      <br />
                      We&apos;ll back tommorow...
                    </p>
                  </div>
                ) : (
                  timesList.map((time) => (
                    <label
                      key={time}
                      className="flex items-center space-x-3 cursor-pointer"
                    >
                      <input
                        ref={timeOptionsRef}
                        type="radio"
                        name="time"
                        value={time}
                        checked={tempDeliveryTime === time}
                        onChange={() => {
                          const restaurantTimeZone =
                            restaurantData?.timezone?.timezoneName?.split(
                              " "
                            )[0] ?? "";
                          convertToUtcForTimeSlots(
                            tempDeliveryDay,
                            time,
                            restaurantTimeZone ?? ""
                          );
                          setTempDeliveryTime(time);
                        }}
                        className="form-radio text-primary w-4 h-4 accent-primary focus:ring-primary "
                      />
                      <span
                        className={`p-2 rounded-full text-sm md:text-base font-normal flex-grow transition-all duration-200 bg-gray-100 text-gray-800 hover:bg-gray-200 ${
                          tempDeliveryTime === time
                            ? "border-primary  border"
                            : "border border-transparent"
                        }`}
                      >
                        <FiClock className="inline-block mr-2 mb-1" />
                        {time}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <button
              className={`w-full p-2 rounded-full text-lg mt-2 font-bold transition-all duration-200 ${
                tempDeliveryDay && tempDeliveryTime
                  ? "bg-primary hover:bg-primary-dark shadow-lg"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
              style={{
                color:
                  tempDeliveryDay && tempDeliveryTime
                    ? isContrastOkay(
                        Env.NEXT_PUBLIC_PRIMARY_COLOR,
                        Env.NEXT_PUBLIC_BACKGROUND_COLOR
                      )
                      ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
                      : "#ffffff"
                    : "#d1d5db",
              }}
              disabled={!tempDeliveryDay || !tempDeliveryTime}
              onClick={() => handleScheduleOrder()}
            >
              <FiCheck className="inline-block mr-2 mb-1" />
              Schedule Order
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Modal;
