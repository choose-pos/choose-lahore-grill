import { OrderType } from "@/generated/graphql";
import { useCartStore } from "@/store/cart";
import { OrderTypeData } from "@/store/orderType";
import RestaurantStore from "@/store/restaurant";
import { convertToRestoTimezone } from "@/utils/formattedTime";
import { FetchCartDetails } from "@/utils/types";
import { ChevronDown, Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface OrderOptionsProps {
  isDelivery?: boolean | null;
  isPickUp?: boolean | null;
  setShowMenu: (show: boolean) => void;
  isCart?: boolean;
  RestaurantInfo?: FetchCartDetails;
}

interface StatusResult {
  message: string;
  className: string;
}

const OrderOptions: React.FC<OrderOptionsProps> = ({
  isDelivery,
  isPickUp,
  setShowMenu,
  isCart,
  RestaurantInfo,
}) => {
  const [pickupStatus, setPickupStatus] = useState<StatusResult | null>(null);
  const [deliveryStatus, setDeliveryStatus] = useState<StatusResult | null>(
    null
  );
  const { setTempOrderType, pendingOrderType, setPendingOrderType } =
    OrderTypeData();
  const { cartDetails, setCartDetails } = useCartStore();
  const { restaurantData } = RestaurantStore();

  useEffect(() => {
    if (RestaurantInfo) {
      setCartDetails(RestaurantInfo);
    }
  }, [RestaurantInfo, setCartDetails]);

  const handleDeliveryClick = () => {
    if (isDelivery) {
        if (pendingOrderType) {
        setTempOrderType(pendingOrderType);
        setPendingOrderType(null);
      } else {
        setTempOrderType(OrderType.Delivery);
      }
      setShowMenu(false);
    }
  };

  const handlePickupClick = () => {
    if (isPickUp) {
      if (pendingOrderType) {
        setTempOrderType(pendingOrderType);
        setPendingOrderType(null);
      } else {
        setTempOrderType(OrderType.Pickup);
      }
      setShowMenu(false);
    }
  };

  useEffect(() => {
    if (cartDetails && restaurantData?.timezone?.timezoneName) {
      if (!isPickUp) {
        setPickupStatus({
          message: "Pickup unavailable",
          className: "bg-gray-100 opacity-60 cursor-not-allowed",
        });
      } else {
        setPickupStatus({
          message:
            cartDetails?.orderType === OrderType.Pickup &&
            cartDetails.pickUpDateAndTime
              ? `${convertToRestoTimezone(
                  restaurantData?.timezone?.timezoneName?.split(" ")[0] ?? "",
                  new Date(cartDetails.pickUpDateAndTime)
                )}`
              : "Click to change",
          className:
            cartDetails?.orderType === OrderType.Pickup
              ? " border-primary bg-white"
              : "text-gray-400 hover:text-gray-600 border-transparent hover:bg-gray-50",
        });
      }

      if (!isDelivery) {
        setDeliveryStatus({
          message: "Delivery unavailable",
          className: "bg-gray-100 opacity-60 cursor-not-allowed",
        });
      } else {
        setDeliveryStatus({
          message:
            cartDetails?.orderType === OrderType.Delivery &&
            cartDetails.deliveryDateAndTime
              ? `${convertToRestoTimezone(
                  restaurantData?.timezone?.timezoneName?.split(" ")[0] ?? "",
                  new Date(cartDetails.deliveryDateAndTime)
                )}`
              : "Click to change",
          className:
            cartDetails?.orderType === OrderType.Delivery
              ? "border-primary bg-white"
              : "text-gray-400 hover:text-gray-600 border-transparent hover:bg-gray-50",
        });
      }
    }
  }, [
    cartDetails,
    isDelivery,
    isPickUp,
    restaurantData?.timezone?.timezoneName,
  ]);

  if (!cartDetails?.orderType) return null;

  return (
    <div className="w-full font-online-ordering overflow-x-hidden mt-2 mb-1">
      <div className="flex flex-row items-stretch gap-1 w-full">
        {/* Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-md flex-shrink-0">
          <div
            onClick={handlePickupClick}
            className={`px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${
              cartDetails.orderType === OrderType.Pickup
                ? "bg-white shadow-sm text-black"
                : "text-gray-500 hover:text-gray-700 cursor-pointer"
            } ${!isPickUp ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Pickup
          </div>
          <div
            onClick={handleDeliveryClick}
            className={`px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${
              cartDetails.orderType === OrderType.Delivery
                ? "bg-white shadow-sm text-black"
                : "text-gray-500 hover:text-gray-700 cursor-pointer"
            } ${!isDelivery ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Delivery
          </div>
        </div>

        {/* Time Box */}
        <div className="flex-1 min-w-0">
          {cartDetails.orderType === OrderType.Pickup && (
            <div
              onClick={handlePickupClick}
              className={`flex items-center justify-between border border-gray-200 bg-white rounded-md px-2 sm:px-3 py-2 transition-colors h-full ${
                !isPickUp
                  ? "opacity-60 cursor-not-allowed bg-gray-50"
                  : "cursor-pointer hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center space-x-1 sm:space-x-2 text-black min-w-0">
                <Clock className="h-4 w-4 flex-shrink-0 text-gray-700" />
                <span
                  className={`text-sm font-medium truncate ${
                    !isPickUp ? "text-red-500" : "text-black"
                  }`}
                >
                  {pickupStatus?.message}
                </span>
              </div>
              {!isCart && (
                <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0 ml-1" />
              )}
            </div>
          )}

          {cartDetails.orderType === OrderType.Delivery && (
            <div
              onClick={handleDeliveryClick}
              className={`flex items-center justify-between border border-gray-200 bg-white rounded-md px-2 sm:px-3 py-2 transition-colors h-full ${
                !isDelivery
                  ? "opacity-60 cursor-not-allowed bg-gray-50"
                  : "cursor-pointer hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center space-x-1 sm:space-x-2 text-black min-w-0">
                <Clock className="h-4 w-4 flex-shrink-0 text-gray-700" />
                <span
                  className={`text-sm font-medium truncate ${
                    !isDelivery ? "text-red-500" : "text-black"
                  }`}
                >
                  {deliveryStatus?.message}
                </span>
              </div>
              {!isCart && (
                <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0 ml-1" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderOptions;