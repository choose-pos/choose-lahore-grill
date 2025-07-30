import { OrderType } from "@/generated/graphql";
import { useCartStore } from "@/store/cart";
import { OrderTypeData } from "@/store/orderType";
import RestaurantStore from "@/store/restaurant";
import { convertToRestoTimezone } from "@/utils/formattedTime";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

interface OrderOptionsProps {
  isDelivery?: boolean | null;
  isPickUp?: boolean | null;
  setShowMenu: (show: boolean) => void;
}

interface StatusResult {
  message: string;
  className: string;
}

const NavOrderInfo: React.FC<OrderOptionsProps> = ({
  isDelivery,
  isPickUp,
  setShowMenu,
}) => {
  const [pickupStatus, setPickupStatus] = useState<StatusResult | null>(null);
  const [deliveryStatus, setDeliveryStatus] = useState<StatusResult | null>(
    null
  );

  const { setTempOrderType } = OrderTypeData();
  const { cartDetails } = useCartStore();
  const { restaurantData } = RestaurantStore();

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
              ? "border-gray-200"
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
              ? "border-gray-200"
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

  return (
    <div className="border-[1px] border-primary rounded-full">
      {/* Desktop Layout */}

      <div className="space-y-4">
        {(!cartDetails?.orderType ||
          cartDetails.orderType === OrderType.Pickup) && (
          <div
            onClick={handlePickupClick}
            className={`flex flex-col py-2 px-4 rounded-full w-full cursor-pointer ${pickupStatus?.className}`}
          >
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                {/* <FaBoxArchive size={14} /> */}
                <p className="font-semibold text-lg font-online-ordering">
                  Pickup
                </p>
                <div> | </div>
                <div className=" text-sm">
                  {!isPickUp ? (
                    <p className="text-red-500">{pickupStatus?.message}</p>
                  ) : (
                    <p>{pickupStatus?.message}</p>
                  )}
                </div>
              </div>
              <ChevronDown className="h-5 w-5 ml-2" />
            </div>
          </div>
        )}

        {(!cartDetails?.orderType ||
          cartDetails.orderType === OrderType.Delivery) && (
          <div
            onClick={handleDeliveryClick}
            className={`flex flex-col p-4 rounded-lg w-full border-b-2 cursor-pointer ${deliveryStatus?.className}`}
          >
            <div className="flex items-center ">
              <div className="flex items-center space-x-2">
                {/* <CiDeliveryTruck size={24} /> */}
                <p className="font-semibold text-lg">Delivery</p>
                <div className="text-sm">
                  {!isDelivery ? (
                    <p className="text-red-500">{deliveryStatus?.message}</p>
                  ) : (
                    <p>{deliveryStatus?.message}</p>
                  )}
                </div>
              </div>
              <ChevronDown className="h-5 w-5 ml-2" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NavOrderInfo;
