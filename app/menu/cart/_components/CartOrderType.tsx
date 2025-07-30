import { OrderType } from "@/generated/graphql";
import { useCartStore } from "@/store/cart";
import RestaurantStore from "@/store/restaurant";
import { convertToRestoTimezone } from "@/utils/formattedTime";

const CartOrderType = () => {
  // Stores
  const { restaurantData } = RestaurantStore();
  const { cartDetails } = useCartStore();

  if (!cartDetails?.orderType) {
    return;
  }

  // Pickup Part
  if (cartDetails.orderType === OrderType.Pickup) {
    return (
      <div className="w-full px-6">
        <p className="font-online-ordering font-semibold text-xl">
          Pickup Details
        </p>

        <div className="mt-4">
          <p className="text-sm md:text-base font-online-ordering mb-2">
            <span className="font-medium">Location:</span>{" "}
            {restaurantData?.address?.addressLine1}
          </p>
          <p className="text-sm md:text-base font-online-ordering">
            <span className="font-medium">Date & Time:</span>{" "}
            {convertToRestoTimezone(
              restaurantData?.timezone?.timezoneName?.split(" ")[0] ?? "",
              new Date(cartDetails.pickUpDateAndTime)
            )}
          </p>
        </div>
      </div>
    );
  }

  // Delivery Part
  if (cartDetails.orderType === OrderType.Delivery) {
    return (
      <div className="w-full px-6">
        <p className="font-online-ordering text-xl">Delivery Details</p>

        <div className="mt-4">
          <p className="text-sm md:text-base font-medium font-online-ordering mb-2">
            Delivery Address: {cartDetails?.delivery?.addressLine1}
          </p>
          <p className="text-sm md:text-base font-online-ordering">
            Date & Time:{" "}
            {convertToRestoTimezone(
              restaurantData?.timezone?.timezoneName?.split(" ")[0] ?? "",
              new Date(cartDetails.deliveryDateAndTime)
            )}
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default CartOrderType;
