"use client";

import { getCartId } from "@/app/actions/cookies";
import { OrderById } from "@/components/account/TabBar";
import LoadingDots from "@/components/common/LoadingDots";
import { cookieKeys } from "@/constants";
import { Env } from "@/env";
import { getCookie } from "@/utils/UtilFncs";
import { getOrCreateUserHash } from "@/utils/analytics";
import { fetchWithAuth, sdk } from "@/utils/graphqlClient";
import { isContrastOkay } from "@/utils/isContrastOkay";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaExclamationCircle, FaSpinner } from "react-icons/fa";
import { IoMdArrowBack } from "react-icons/io";

// Types
interface ItemFeedback {
  itemName: string;
  rating: number;
  remarks?: string;
}

interface OrderFeedbackData {
  overallRating: number;
  overallRemarks?: string;
  foodQuality?: number;
  deliveryTime?: number;
  packagingQuality?: number;
  valueForMoney?: number;
  itemFeedbacks?: ItemFeedback[];
  images?: string[];
  wouldRecommend: boolean;
}

// Star Rating Component
const StarRating = ({
  rating,
  hoveredRating,
  onRate,
  onHover,
  onHoverLeave,
  size = "w-8 h-8",
}: {
  rating: number;
  hoveredRating: number;
  onRate: (rating: number) => void;
  onHover: (rating: number) => void;
  onHoverLeave: () => void;
  size?: string;
}) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => onRate(star)}
        onMouseEnter={() => onHover(star)}
        onMouseLeave={onHoverLeave}
        className="transition-transform hover:scale-110 focus:outline-none"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className={`${size} transition-colors ${
            star <= (hoveredRating || rating)
              ? "fill-yellow-400 stroke-yellow-400"
              : "fill-none stroke-gray-300"
          }`}
          strokeWidth="1.5"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </button>
    ))}
  </div>
);

const OrderFeedbackComponent = () => {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderById | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [overallRating, setOverallRating] = useState<number>(0);
  const [hoveredOverallRating, setHoveredOverallRating] = useState<number>(0);
  const [overallRemarks, setOverallRemarks] = useState<string>("");

  const [foodQuality, setFoodQuality] = useState<number>(0);
  const [hoveredFoodQuality, setHoveredFoodQuality] = useState<number>(0);

  const [deliveryTime, setDeliveryTime] = useState<number>(0);
  const [hoveredDeliveryTime, setHoveredDeliveryTime] = useState<number>(0);

  const [packagingQuality, setPackagingQuality] = useState<number>(0);
  const [hoveredPackagingQuality, setHoveredPackagingQuality] =
    useState<number>(0);

  const [valueForMoney, setValueForMoney] = useState<number>(0);
  const [hoveredValueForMoney, setHoveredValueForMoney] = useState<number>(0);

  const [wouldRecommend, setWouldRecommend] = useState<boolean>(false);

  const [itemFeedbacks, setItemFeedbacks] = useState<ItemFeedback[]>([]);

  const [hoveredItemRatings, setHoveredItemRatings] = useState<{
    [key: string]: number;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Collapsible sections state
  const [isSpecificAspectsOpen, setIsSpecificAspectsOpen] = useState(false);
  const [isItemFeedbackOpen, setIsItemFeedbackOpen] = useState(false);

  // Fetch order details
  useEffect(() => {
    if (!orderId) {
      setError("Order ID is missing.");
      setIsLoading(false);
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        setIsLoading(true);
        const data = await fetchWithAuth(() =>
          sdk.fetchOrderById({
            id: orderId,
          })
        );

        if (!data.fetchCustomerOrderById) {
          setError("Order not found. Please check your order ID.");
          return;
        }

        setSelectedOrder(data.fetchCustomerOrderById);

        const itemNames = new Set(
          data.fetchCustomerOrderById.items.map((item) => item.itemName)
        );
        const initialItemFeedbacks = Array.from(itemNames).map((itemName) => ({
          itemName: itemName,
          rating: 0,
          remarks: "",
        }));
        const loyaltyRedeemItem =
          data.fetchCustomerOrderById.appliedDiscount?.loyaltyData?.redeemItem;
        if (loyaltyRedeemItem) {
          initialItemFeedbacks.push({
            itemName: loyaltyRedeemItem.itemName,
            rating: 0,
            remarks: "",
          });
        }

        const FreeReedeemItem =
          data.fetchCustomerOrderById.appliedDiscount?.promoData
            ?.discountItemName;
        if (FreeReedeemItem) {
          initialItemFeedbacks.push({
            itemName: FreeReedeemItem ?? "",
            rating: 0,
            remarks: "",
          });
        }
        setItemFeedbacks(initialItemFeedbacks);
        initialItemFeedbacks.map((e) => {
          setHoveredItemRatings((prev) => {
            prev[e.itemName] = e.rating;
            return prev;
          });
        });
      } catch (error) {
        console.error("Error fetching order:", error);
        setError("Failed to fetch order details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  // Helper functions
  const getRatingMessage = (rating: number): string => {
    const messages = [
      "Please rate your experience",
      "Poor",
      "Fair",
      "Good",
      "Great",
      "Excellent",
    ];
    return messages[rating];
  };

  const updateItemFeedback = (
    itemName: string,
    field: keyof ItemFeedback,
    value: any
  ) => {
    setItemFeedbacks((prev) =>
      prev.map((item) =>
        item.itemName === itemName ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSubmit = async () => {
    if (overallRating === 0) {
      alert("Please provide an overall rating");
      return;
    }

    setIsSubmitting(true);
    const restaurantId = getCookie(cookieKeys.restaurantCookie);
    const cartId = await getCartId();
    const visitorHash = getOrCreateUserHash();
    const feedbackData = {
      orderId: orderId!,
      overallRating,
      overallRemarks: overallRemarks || undefined,
      foodQuality: foodQuality || undefined,
      deliveryTime: deliveryTime || undefined,
      packagingQuality: packagingQuality || undefined,
      valueForMoney: valueForMoney || undefined,
      itemFeedbacks: (() => {
        const filtered = itemFeedbacks.filter(
          (item) =>
            (item.rating ?? 0) > 0 ||
            (item.remarks && item.remarks.trim() !== "")
        );

        return filtered.length > 0
          ? filtered.map((item) => ({
              itemName: item.itemName,
              rating: (item.rating ?? 0) > 0 ? item.rating : null,
              remarks: item.remarks,
            }))
          : undefined;
      })(),
      wouldRecommend,
      meta: { visitorHash, cartId, restaurantId },
    };

    try {
      const response = await fetchWithAuth(() =>
        sdk.submitRestaurantFeedback({
          input: feedbackData,
        })
      );

      if (response.submitRestaurantFeedback?._id) {
        setSubmitted(true);
      } else {
        setError("Failed to submit feedback. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setError("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center font-primary">
        <span className="mb-2 text-gray-600">Loading order details...</span>
        <LoadingDots />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center h-64 font-primary">
        <div className="text-center text-red-600">
          <FaExclamationCircle className="mx-auto text-3xl mb-2" />
          <p className="text-sm">{error}</p>
          <Link
            href="/menu"
            className="mt-4 inline-block text-gray-600 hover:text-gray-900 transition-colors"
          >
            Back to Menu
          </Link>
        </div>
      </div>
    );
  }

  // Success state
  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-161px)]  flex items-center justify-center p-4 font-primary bg-gray-50">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="mb-4">
            <svg
              className="w-16 h-16 mx-auto text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-secondary font-bold mb-2">Thank You!</h2>
          <p className="text-gray-600 mb-6">
            Your feedback has been submitted successfully. We appreciate your
            input!
          </p>
          <Link
            href="/menu"
            className={`flex gap-1 items-center justify-center text-sm sm:text-base font-medium font-primary `}
          >
            <ArrowLeft className="text-sm w-4 h-4 " />
            Back to Menu
          </Link>
        </div>
      </div>
    );
  }

  if (!selectedOrder) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center font-primary">
        <p className="text-red-500">Order not found.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-8 px-4 font-primary">
      <div className="max-w-3xl mx-auto">
        <div className=" bg-white rounded-2xl shadow-lg p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center mb-6">
            <Link href="/menu">
              <div className="flex items-center text-gray-500 hover:text-gray-900 cursor-pointer transition-colors">
                <IoMdArrowBack size={20} />
                <span className="ml-2 text-base">Back To Menu</span>
              </div>
            </Link>
          </div>

          <h1 className="text-3xl md:text-4xl font-semibold mb-2">
            Share Your Feedback
          </h1>
          <p className="text-gray-600 mb-8">Help us improve your experience</p>

          {/* Order Details */}
          <div className="bg-gray-50 p-4 rounded-xl mb-8">
            <h3 className="font-semibold mb-2 text-gray-900">Order Details</h3>
            <div className="text-sm space-y-1">
              <p className="text-gray-600">Order ID: {selectedOrder.orderId}</p>
              <p className="text-gray-600">
                Items: {selectedOrder.items.length} item(s)
              </p>
            </div>
          </div>

          {/* Overall Rating - Required */}
          <div className="mb-8">
            <label className="block font-semibold mb-4 text-lg text-gray-900">
              Overall Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-col items-center bg-gray-50 rounded-xl py-8">
              <StarRating
                rating={overallRating}
                hoveredRating={hoveredOverallRating}
                onRate={setOverallRating}
                onHover={setHoveredOverallRating}
                onHoverLeave={() => setHoveredOverallRating(0)}
                size="w-12 h-12 md:w-14 md:h-14"
              />
              <p className="text-sm text-gray-600 mt-4 min-h-[20px]">
                {getRatingMessage(hoveredOverallRating || overallRating)}
              </p>
            </div>
          </div>

          {/* Overall Remarks */}
          <div className="mb-8">
            <label
              htmlFor="overall-remarks"
              className="block font-semibold mb-3 text-gray-900"
            >
              Tell us more about your experience
            </label>
            <textarea
              id="overall-remarks"
              value={overallRemarks}
              onChange={(e) => setOverallRemarks(e.target.value)}
              maxLength={500}
              placeholder="Share your thoughts..."
              className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent resize-none h-32"
            />
            <p className="text-sm text-gray-500 mt-2 text-right">
              {overallRemarks.length}/500 characters
            </p>
          </div>

          {/* Would Recommend */}
          <div className="mb-8">
            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={wouldRecommend}
                onChange={(e) => setWouldRecommend(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-gray-400"
              />
              <span className="ml-3 text-gray-700 group-hover:text-gray-900 transition-colors">
                I would recommend this restaurant to others
              </span>
            </label>
          </div>

          {/* Collapsible: Detailed Ratings */}
          <div className="border-t border-gray-200 pt-6 mb-6">
            <button
              onClick={() => setIsSpecificAspectsOpen(!isSpecificAspectsOpen)}
              className="w-full flex items-center justify-between text-left group"
            >
              <h3 className="font-semibold text-lg text-gray-900 group-hover:text-gray-700 transition-colors">
                Rate Specific Aspects{" "}
                <span className="text-gray-400 text-sm font-normal">
                  (Optional)
                </span>
              </h3>
              {isSpecificAspectsOpen ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>

            {isSpecificAspectsOpen && (
              <div className="mt-6 space-y-5">
                {/* Food Quality */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4">
                  <label className="text-gray-700">Food Quality</label>
                  <StarRating
                    rating={foodQuality}
                    hoveredRating={hoveredFoodQuality}
                    onRate={setFoodQuality}
                    onHover={setHoveredFoodQuality}
                    onHoverLeave={() => setHoveredFoodQuality(0)}
                  />
                </div>

                {/* Delivery Time */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4">
                  <label className="text-gray-700">Delivery/Pickup Time</label>
                  <StarRating
                    rating={deliveryTime}
                    hoveredRating={hoveredDeliveryTime}
                    onRate={setDeliveryTime}
                    onHover={setHoveredDeliveryTime}
                    onHoverLeave={() => setHoveredDeliveryTime(0)}
                  />
                </div>

                {/* Packaging Quality */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4">
                  <label className="text-gray-700">Packaging Quality</label>
                  <StarRating
                    rating={packagingQuality}
                    hoveredRating={hoveredPackagingQuality}
                    onRate={setPackagingQuality}
                    onHover={setHoveredPackagingQuality}
                    onHoverLeave={() => setHoveredPackagingQuality(0)}
                  />
                </div>

                {/* Value for Money */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <label className="text-gray-700">Value for Money</label>
                  <StarRating
                    rating={valueForMoney}
                    hoveredRating={hoveredValueForMoney}
                    onRate={setValueForMoney}
                    onHover={setHoveredValueForMoney}
                    onHoverLeave={() => setHoveredValueForMoney(0)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Collapsible: Item-Specific Feedback */}
          <div className="border-t border-gray-200 pt-6 mb-8">
            <button
              onClick={() => setIsItemFeedbackOpen(!isItemFeedbackOpen)}
              className="w-full flex items-center justify-between text-left group"
            >
              <h3 className="font-semibold text-lg text-gray-900 group-hover:text-gray-700 transition-colors">
                Rate Individual Items{" "}
                <span className="text-gray-400 text-sm font-normal">
                  (Optional)
                </span>
              </h3>
              {isItemFeedbackOpen ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>

            {isItemFeedbackOpen && (
              <div className="mt-6 space-y-4">
                {itemFeedbacks.map((item) => {
                  return (
                    <div
                      key={item.itemName}
                      className="bg-gray-50 p-4 rounded-xl"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">
                            {item.itemName}
                          </span>
                        </div>
                        <StarRating
                          rating={item.rating}
                          hoveredRating={hoveredItemRatings[item.itemName] ?? 0}
                          onRate={(rating) =>
                            updateItemFeedback(item.itemName, "rating", rating)
                          }
                          onHover={(rating) => {
                            setHoveredItemRatings((prev) => {
                              const obj = { ...prev };
                              obj[item.itemName] = rating;
                              return obj;
                            });
                          }}
                          onHoverLeave={() => {
                            setHoveredItemRatings((prev) => {
                              const obj = { ...prev };
                              obj[item.itemName] = 0;
                              return obj;
                            });
                          }}
                          size="w-7 h-7"
                        />
                      </div>
                      <textarea
                        value={item.remarks || ""}
                        onChange={(e) =>
                          updateItemFeedback(
                            item.itemName,
                            "remarks",
                            e.target.value
                          )
                        }
                        maxLength={200}
                        placeholder="Any specific feedback for this item?"
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent resize-none text-sm"
                        rows={2}
                      />
                      <p className="text-xs text-gray-500 mt-1 text-right">
                        {(item.remarks || "").length}/200
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={handleSubmit}
              disabled={overallRating === 0 || isSubmitting}
              className={`inline-block px-8 py-2 text-lg sm:text-xl font-medium font-primary rounded-full transition-all duration-200 ${
                overallRating === 0 || isSubmitting
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : isContrastOkay(
                        Env.NEXT_PUBLIC_PRIMARY_COLOR,
                        Env.NEXT_PUBLIC_BACKGROUND_COLOR
                      )
                    ? `bg-primaryColor text-background hover:opacity-90`
                    : `bg-primaryColor text-textColor hover:opacity-90`
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <FaSpinner className="animate-spin" />
                  Submitting...
                </span>
              ) : (
                "Submit Feedback"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderFeedbackComponent;
