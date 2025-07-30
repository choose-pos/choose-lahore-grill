import { Env } from "@/env";
import { PriceTypeEnum } from "@/generated/graphql";
import { useCartStore } from "@/store/cart";
import { isContrastOkay } from "@/utils/isContrastOkay";
import { GroupedCartItem } from "@/utils/types";
import Image from "next/image";
import { useState } from "react";
import { FiX } from "react-icons/fi";

const CheckoutOrderSummary = () => {
  // Stores
  const {
    cartData,
    cartCountInfo,
    freeItemInCart,
    specialRemarks,
    freeItemImage,
  } = useCartStore();

  // States
  const [showOrderItems, setShowOrderItems] = useState(false);

  // Handler / Functions
  const calculateItemPrice = (item: GroupedCartItem): string => {
    const modifierPrice =
      item.modifierGroups?.reduce((modAcc, mod) => {
        let groupTotal = 0;

        switch (mod.pricingType) {
          case PriceTypeEnum.SamePrice:
            // Calculate total quantity of all selected modifiers
            const totalQuantity =
              mod.selectedModifiers?.reduce(
                (qtyAcc, selectedMod) => qtyAcc + selectedMod.qty,
                0
              ) ?? 0;
            // Multiply base price by total quantity
            groupTotal = (mod.price ?? 0) * totalQuantity;
            break;
          case PriceTypeEnum.IndividualPrice:
            groupTotal =
              mod.selectedModifiers?.reduce(
                (selectedAcc, selectedMod) =>
                  selectedAcc + selectedMod.mid.price * selectedMod.qty,
                0
              ) ?? 0;
            break;
          case PriceTypeEnum.FreeOfCharge:
          default:
            groupTotal = 0;
        }

        return modAcc + groupTotal;
      }, 0) ?? 0;

    const totalItemPrice = (item.itemPrice + modifierPrice) * item.qty;
    return totalItemPrice.toFixed(2);
  };

  return (
    <>
      <div className="w-full px-6">
        <p className="font-online-ordering text-xl">
          Order Summary ({cartCountInfo})
        </p>

        {specialRemarks.length > 0 ? (
          <p className="text-sm md:text-base font-online-ordering mt-4">
            <span className="font-medium">Special Requests:</span>{" "}
            {specialRemarks}
          </p>
        ) : null}

        <p
          onClick={() => {
            setShowOrderItems(true);
          }}
          className="text-base font-semibold text-primary underline font-online-ordering cursor-pointer mt-4 w-max"
          style={{
            color: isContrastOkay("#ffffff", Env.NEXT_PUBLIC_BACKGROUND_COLOR)
              ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
              : "#000000",
          }}
        >
          View items
        </p>
      </div>

      {/* View Items List */}
      {showOrderItems ? (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-11/12 max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl sm:text-2xl font-online-ordering">
                Order Items ({cartCountInfo})
              </h2>
              <button
                className="text-gray-600 hover:text-gray-900"
                onClick={() => {
                  setShowOrderItems(false);
                }}
              >
                <FiX size={24} />
              </button>
            </div>
            <div className="w-full flex flex-col overflow-y-scroll h-auto max-h-[50vh]">
              {freeItemInCart ? (
                <div className="mb-6 rounded-[20px] bg-white border p-4">
                  <div className="w-full flex justify-between items-start space-x-2">
                    <div className="flex items-start gap-4">
                      {freeItemImage ? (
                        <div className="w-14 h-14 relative self-start flex-shrink-0">
                          <Image
                            src={freeItemImage}
                            alt={freeItemInCart.name}
                            fill
                            className={`object-cover object-center w-full h-full rounded-lg`}
                          />
                        </div>
                      ) : null}
                      <h3 className="font-semibold font-online-ordering text-base md:text-lg lg:text-xl">
                        {freeItemInCart.name}
                      </h3>
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      <div className="flex justify-center items-center space-x-2">
                        <p className="lg:text-lg md:text-base text-base font-semibold font-online-ordering text-green-500">
                          FREE
                        </p>
                        <p className="lg:text-lg md:text-base text-base font-semibold font-online-ordering line-through">
                          ${freeItemInCart.price}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
              {cartData.map((item) => (
                <div
                  key={item._id}
                  className="last:mb-2 mb-6 rounded-[20px] border bg-white p-4"
                >
                  <div className="flex items-center gap-4">
                    {/* Content wrapper */}
                    {item.itemImage ? (
                      <div className="w-14 h-14 relative self-start flex-shrink-0">
                        <Image
                          src={item.itemImage}
                          alt={item.itemName}
                          fill
                          className={`object-cover object-center w-full h-full`}
                        />
                      </div>
                    ) : null}
                    <div className="flex-grow flex flex-col gap-2">
                      {/* Top section with title and buttons */}
                      <div className="flex justify-between items-start">
                        <div className="flex-grow pr-4">
                          <h3 className="font-medium font-online-ordering text-base md:text-lg">
                            {item.itemName} x {item.qty}
                          </h3>
                        </div>
                      </div>

                      {/* Modifier groups */}
                      {item.modifierGroups &&
                        item.modifierGroups.length > 0 && (
                          <div className="font-online-ordering text-sm text-textGrayColor flex flex-wrap">
                            {item.modifierGroups.map((mg, index) => {
                              return (
                                <span key={mg._id} className="inline-block">
                                  {mg.selectedModifiers
                                    ?.map((m) => m.mid.name + " x " + m.qty)
                                    .join(", ")}
                                  {index ===
                                  (item.modifierGroups ?? []).length -
                                    1 ? null : (
                                    <span className="pr-1">,</span>
                                  )}
                                </span>
                              );
                            })}
                          </div>
                        )}

                      {/* Remarks */}
                      {item.remarks && (
                        <p className="lg:mt-1 text-sm font-extralight capitalize font-online-ordering italic">
                          {item.remarks}
                        </p>
                      )}

                      {/* Bottom section with price and quantity controls */}
                      <div className="flex justify-between items-center pt-2">
                        <p className="md:text-lg text-base font-medium font-online-ordering">
                          ${calculateItemPrice(item)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );

  return null;
};

export default CheckoutOrderSummary;
