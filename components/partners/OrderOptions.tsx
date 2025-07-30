import { OrderType } from "@/generated/graphql";
import { useCartStore } from "@/store/cart";
import { OrderTypeData } from "@/store/orderType";
import RestaurantStore from "@/store/restaurant";
import { convertToRestoTimezone } from "@/utils/formattedTime";
import { FetchCartDetails } from "@/utils/types";
import { ChevronDown } from "lucide-react";
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
  const { setTempOrderType } = OrderTypeData();
  const { cartDetails, setCartDetails } = useCartStore();
  const { restaurantData } = RestaurantStore();

  useEffect(() => {
    if (RestaurantInfo) {
      setCartDetails(RestaurantInfo);
    }
  }, [RestaurantInfo, setCartDetails]);

  const handleDeliveryClick = () => {
    if (isDelivery) {
      setTempOrderType(OrderType.Delivery);
      setShowMenu(false);
    }
  };

  const handlePickupClick = () => {
    if (isPickUp) {
      setTempOrderType(OrderType.Pickup);
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
    <div className="border-[1px] border-gray-200 rounded-full font-online-ordering">
      {/* Desktop Layout */}

      <div className="space-y-4">
        {cartDetails.orderType === OrderType.Pickup && (
          <div
            onClick={handlePickupClick}
            className={`flex flex-col py-2 px-4 rounded-full w-full cursor-pointer ${pickupStatus?.className}`}
          >
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                {/* <FaBoxArchive size={14} /> */}
                <p className="font-semibold text-base md:text-lg font-online-ordering">
                  Pickup
                </p>
                <div> | </div>
                <div className=" text-sm">
                  {!isPickUp ? (
                    <p className="text-red-500 text-sm md:text-lg">
                      {pickupStatus?.message}
                    </p>
                  ) : (
                    <p className="text-sm md:text-lg">
                      {pickupStatus?.message}
                    </p>
                  )}
                </div>
              </div>

              {!isCart && <ChevronDown className="h-5 w-5 ml-2" />}
            </div>
          </div>
        )}

        {cartDetails.orderType === OrderType.Delivery && (
          <div
            onClick={handleDeliveryClick}
            className={`flex flex-col py-2 px-4 rounded-full w-full cursor-pointer ${deliveryStatus?.className}`}
          >
            <div className="flex items-center ">
              <div className="flex items-center space-x-2 font-online-ordering">
                {/* <CiDeliveryTruck size={24} /> */}
                <p className="font-semibold text-base md:text-lg">Delivery</p>
                <div> | </div>
                <div className="text-sm">
                  {!isDelivery ? (
                    <p className="text-red-500">{deliveryStatus?.message}</p>
                  ) : (
                    <p className="text-sm md:text-lg">
                      {deliveryStatus?.message}
                    </p>
                  )}
                </div>
              </div>
              {!isCart && <ChevronDown className="h-5 w-5 ml-2" />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderOptions;
