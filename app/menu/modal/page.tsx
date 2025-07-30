/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import RenderContent from "@/components/partners/renderContent";
import { Env } from "@/env";
import {
  CartItemInput,
  CartModifierGroupsInput,
  ItemWithModifiersResponse,
  PriceTypeEnum,
} from "@/generated/graphql";
import { sendAnalyticsEvent } from "@/hooks/useAnalytics";
import { useCartStore } from "@/store/cart";
import RestaurantStore from "@/store/restaurant";
import ToastStore from "@/store/toast";
import { getOrCreateUserHash } from "@/utils/analytics";
import { availabilityCheck } from "@/utils/formattedTime";
import { refreshCartCount } from "@/utils/getCartCountData";
import { sdk } from "@/utils/graphqlClient";
import { fadeIn } from "@/utils/motion";
import { refreshCartDetails } from "@/utils/refreshCartDetails";
import {
  extractErrorMessage,
  extractFreeDiscountItemDetails,
} from "@/utils/UtilFncs";
import { motion } from "framer-motion";
import { DateTime } from "luxon";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IoMdClose } from "react-icons/io";

// New interface for modifier selection with quantity
interface ModifierSelection {
  id: string;
  quantity: number;
}

interface SelectedModifiersState {
  [groupId: string]: ModifierSelection[];
}

const ItemModal = () => {
  // const searchParams = useSearchParams();
  const router = useRouter();
  const [categoryItem, setCategoryItem] =
    useState<ItemWithModifiersResponse | null>(null);
  const [addToCartLoading, setAddToCartLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedModifiers, setSelectedModifiers] =
    useState<SelectedModifiersState>({});
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [specialRequest, setSpecialRequest] = useState<string>("");
  const [totalPrice, setTotalPrice] = useState(0);
  const { setToastData } = ToastStore();
  const { cartDetails, setCartCountInfo, setCartDetails } = useCartStore();
  const modifierGroupRefs = useRef<{ [key: string]: HTMLDivElement | null }>(
    {}
  );
  const validationErrorRef = useRef<HTMLDivElement>(null);
  const {
    restaurantData,
    selectedItem: itemId,
    setSelectedItem,
    selectedCategoryId,
    setSelectedCategoryId,
  } = RestaurantStore();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const checkItemAvailability = () => {
      const restaurantTimeZone =
        restaurantData?.timezone.timezoneName?.split(" ")[0] ?? "";

      const scheduleDateTime =
        cartDetails?.deliveryDateAndTime || cartDetails?.pickUpDateAndTime;

      const scheduleDateTimeLuxon = DateTime.fromISO(scheduleDateTime ?? "", {
        zone: restaurantTimeZone,
      });

      const dayAvailability = categoryItem?.availability?.find(
        (time) => time.day === scheduleDateTimeLuxon.weekdayLong
      );

      if (!dayAvailability || !dayAvailability?.active) {
        setIsAvailable(false);
        return;
      }

      const checkIsAvailable = availabilityCheck(
        restaurantTimeZone,
        categoryItem?.availability ?? [],
        new Date(scheduleDateTime ?? "")
      );

      setIsAvailable(checkIsAvailable);
    };

    if (restaurantData) {
      checkItemAvailability();
    }
  }, [categoryItem, cartDetails, restaurantData]);

  useEffect(() => {
    calculateTotalPrice();
  }, [categoryItem, quantity, selectedModifiers]);

  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        if (!itemId) return;
        setLoading(true);
        const customerItemDetails = await sdk.getCustomerItem({ id: itemId });
        if (customerItemDetails?.getCustomerItem) {
          setCategoryItem(customerItemDetails.getCustomerItem);
          initializeSelectedModifiers(customerItemDetails.getCustomerItem);
        }

        // Track View Event
        const userHash = getOrCreateUserHash(); // Generate or retrieve persistent user hash

        setTimeout(() => {
          sendAnalyticsEvent({
            restaurant: Env.NEXT_PUBLIC_RESTAURANT_ID,
            pagePath: "/menu",
            pageQuery: null, // Include query only if present
            source: document.referrer || "direct", // Fallback to 'direct' if no referrer
            utm: null, // Extract UTM parameters from the query
            userHash, // Attach the user identifier
            eventType: "item_view",
            metadata: {
              id: itemId,
              name: customerItemDetails.getCustomerItem?.name ?? "",
            },
          });
        }, 100);

        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch Item Details", error);
        setError("Failed to fetch item details");
        setToastData({
          message: extractErrorMessage(error),
          type: "error",
        });
        setLoading(false);
      }
    };
    fetchItemDetails();
  }, [itemId]);

  const calculateTotalPrice = () => {
    if (!categoryItem) return;

    let total = categoryItem.price * quantity;

    Object.entries(selectedModifiers).forEach(([groupId, selections]) => {
      const group = categoryItem.modifierGroups?.find((g) => g.id === groupId);
      if (group) {
        selections.forEach((selection) => {
          const modifier = group.modifiers.find((m) => m.id === selection.id);
          if (modifier) {
            if (group.pricingType === PriceTypeEnum.IndividualPrice) {
              total += modifier.price * selection.quantity * quantity;
            } else if (group.pricingType === PriceTypeEnum.SamePrice) {
              total += (group?.price ?? 0) * selection.quantity * quantity;
            } else {
              return;
            }
          }
        });
      }
    });

    setTotalPrice(total);
  };

  const initializeSelectedModifiers = (item: ItemWithModifiersResponse) => {
    const initialModifiers: SelectedModifiersState = {};
    item.modifierGroups?.forEach((group) => {
      let preselectCount = 0;
      group.modifiers.forEach((elem) => {
        if (elem.preSelect) preselectCount++;
      });

      if (
        (preselectCount > 1 && group.maxSelections === 1) ||
        preselectCount !== group.maxSelections
      ) {
      } else {
        initialModifiers[group.id] = group.modifiers
          .filter((m) => m.preSelect)
          .map((m) => ({ id: m.id, quantity: 1 }));
      }
    });
    setSelectedModifiers(initialModifiers);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setSelectedCategoryId(null);
    // router.push("/menu", { scroll: false });
  };

  const handleQuantityChange = (delta: number) => {
    if (quantity >= 100 && delta === 1) return;
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleModifierChange = (
    groupId: string,
    modifierId: string,
    isMultiSelect: boolean
  ) => {
    setSelectedModifiers((prev) => {
      const updated = { ...prev };
      if (isMultiSelect) {
        const currentSelections = updated[groupId] || [];
        const group = categoryItem?.modifierGroups?.find(
          (g) => g.id === groupId
        );

        if (currentSelections.some((s) => s.id === modifierId)) {
          updated[groupId] = currentSelections.filter(
            (s) => s.id !== modifierId
          );
        } else {
          if (
            group &&
            group.maxSelections &&
            currentSelections.length < group.maxSelections
          ) {
            updated[groupId] = [
              ...currentSelections,
              { id: modifierId, quantity: 1 },
            ];
          } else if (!group?.maxSelections) {
            updated[groupId] = [
              ...currentSelections,
              { id: modifierId, quantity: 1 },
            ];
          }
        }
      } else {
        updated[groupId] = [{ id: modifierId, quantity: 1 }];
      }
      return updated;
    });
  };

  const handleModifierQuantityChange = (
    groupId: string,
    modifierId: string,
    delta: number
  ) => {
    setSelectedModifiers((prev) => {
      const updated = { ...prev };
      const selections = updated[groupId] || [];
      const modifierIndex = selections.findIndex((s) => s.id === modifierId);

      if (modifierIndex !== -1) {
        const newQuantity = Math.max(
          1,
          selections[modifierIndex].quantity + delta
        );
        updated[groupId] = selections.map((s, i) =>
          i === modifierIndex ? { ...s, quantity: newQuantity } : s
        );
      }

      return updated;
    });
  };

  const clearModifierSelection = (groupId: string) => {
    setSelectedModifiers((prev) => {
      const updated = { ...prev };
      updated[groupId] = [];
      return updated;
    });
  };

  const validateSelection = () => {
    const errors: string[] = [];
    let firstMissingRequiredGroup: string | null = null;

    categoryItem?.modifierGroups?.forEach((group) => {
      const selections = selectedModifiers[group.id] || [];

      if (!group.optional && selections.length < (group.minSelections || 1)) {
        const errorMessage = `Please select at least ${
          group.minSelections || 1
        } option(s) for ${group.name}`;
        errors.push(errorMessage);

        // Store the first missing required group for scrolling
        if (!firstMissingRequiredGroup) {
          firstMissingRequiredGroup = group.id;
        }
      }

      if (group.maxSelections && selections.length > group.maxSelections) {
        errors.push(
          `You can only select up to ${group.maxSelections} option(s) for ${group.name}`
        );
      }
    });

    setValidationErrors(errors);

    // Scroll to the error message div if there are errors
    if (errors.length > 0 && validationErrorRef.current) {
      validationErrorRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      window.scrollBy(0, -50);
    }

    // Scroll to the first missing required group as a fallback
    if (firstMissingRequiredGroup) {
      const groupElement = modifierGroupRefs.current[firstMissingRequiredGroup];
      if (groupElement) {
        groupElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        window.scrollBy(0, 100);
      }
    }

    return errors.length === 0;
  };

  const formatCartItem = (): CartItemInput[] => {
    const formattedModifiers: CartModifierGroupsInput[] = Object.entries(
      selectedModifiers
    )
      .map(([groupId, selections]) => {
        const group = categoryItem?.modifierGroups?.find(
          (g) => g.id === groupId
        );
        if (!group) return null;

        const selectedModifiersInput = selections.map((selection) => ({
          mid: selection.id,
          qty: selection.quantity,
        }));

        return {
          mgId: group.id,
          selectedModifiers: selectedModifiersInput,
        };
      })
      .filter(Boolean) as CartModifierGroupsInput[];

    return [
      {
        itemId: itemId || "",
        qty: quantity,
        remarks: specialRequest,
        modifierGroups: formattedModifiers,
        categoryId: selectedCategoryId,
      },
    ];
  };

  const handleAddToCart = async () => {
    if (validateSelection()) {
      const formattedCartItem = formatCartItem();
      setAddToCartLoading(true);
      try {
        const res = await sdk.AddToCart({ items: formattedCartItem });
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
              name: categoryItem?.name ?? "",
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
          closeModal();
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
        setAddToCartLoading(false);
      }
    }
  };

  const getModifierQuantity = (groupId: string, modifierId: string): number => {
    const selections = selectedModifiers[groupId] || [];
    const selection = selections.find((s) => s.id === modifierId);
    return selection?.quantity || 0;
  };

  // if (loading)
  //   return (
  //     <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
  //       <div className="bg-white rounded-[20px] shadow-xl w-full max-w-3xl p-6 min-h-[40vh] space-y-20">
  //         <div className="animate-pulse">
  //           <div className="h-40 bg-gray-300 rounded mb-4"></div>
  //           <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
  //           <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
  //           <div className="h-4 bg-gray-300 rounded w-full"></div>
  //         </div>
  //       </div>
  //     </div>
  //   );

  if (error)
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 min-h-[30vh]">
        <div
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded"
          role="alert"
        >
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );

  // if (isMobile) {
  //   return (
  //     <Sheet open={!!itemId} onOpenChange={() => closeModal()}>
  //       <VisuallyHidden.Root>
  //         <SheetTitle>Item Details</SheetTitle>
  //       </VisuallyHidden.Root>
  //       <SheetContent
  //         side="bottom"
  //         className={`p-0 overflow-auto scrollbar-hide rounded-t-[30px] ${
  //           categoryItem.modifierGroups.length > 0 || categoryItem.image
  //             ? "h-[80vh]"
  //             : "max-h-[80vh]"
  //         }`}
  //         hideClose
  //       >
  //         <button
  //           onClick={closeModal}
  //           className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition-all duration-300 z-40"
  //         >
  //           <IoMdClose size={18} />
  //         </button>
  //         <div className="flex flex-col h-full overflow-y-scroll scrollbar-hide">
  //           <RenderContent
  //             categoryItem={categoryItem}
  //             clearModifierSelection={clearModifierSelection}
  //             handleModifierChange={handleModifierChange}
  //             handleModifierQuantityChange={handleModifierQuantityChange}
  //             getModifierQuantity={getModifierQuantity}
  //             quantity={quantity}
  //             handleQuantityChange={handleQuantityChange}
  //             validationErrors={validationErrors}
  //             validationErrorRef={validationErrorRef}
  //             specialRequest={specialRequest}
  //             setSpecialRequest={setSpecialRequest}
  //             totalPrice={totalPrice}
  //             handleAddToCart={handleAddToCart}
  //             isAvailable={isAvailable}
  //             isMobile={isMobile}
  //             selectedModifiers={selectedModifiers}
  //           />
  //         </div>
  //       </SheetContent>
  //     </Sheet>
  //   );
  // }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-end md:items-center z-40 p-4"
    >
      <motion.div
        variants={fadeIn("up", "tween", 0, 0.3)}
        initial="hidden"
        animate="show"
        exit="hidden"
        className="relative bg-bgGray rounded-[30px] shadow-xl w-full max-w-3xl overflow-auto scrollbar-hide flex flex-col max-h-[90vh] md:max-h-[90vh]"
      >
        {(loading || !categoryItem) && !error ? (
          <div className="animate-pulse p-4">
            <div className="h-40 bg-gray-300 rounded mb-4"></div>
            <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-full"></div>
          </div>
        ) : (
          <>
            <div className="absolute top-[3px] right-[3px] z-50">
              <button
                onClick={closeModal}
                className=" text-white bg-black bg-opacity-50 rounded-full p-2.5 hover:bg-opacity-70 transition-all duration-300 !z-50 mt-1 mr-2"
              >
                <IoMdClose size={20} />
              </button>
            </div>
            <div className="overflow-y-scroll scrollbar-hide">
              {!categoryItem ? null : (
                <RenderContent
                  categoryItem={categoryItem}
                  clearModifierSelection={clearModifierSelection}
                  handleModifierChange={handleModifierChange}
                  handleModifierQuantityChange={handleModifierQuantityChange}
                  getModifierQuantity={getModifierQuantity}
                  quantity={quantity}
                  handleQuantityChange={handleQuantityChange}
                  validationErrors={validationErrors}
                  validationErrorRef={validationErrorRef}
                  specialRequest={specialRequest}
                  setSpecialRequest={setSpecialRequest}
                  totalPrice={totalPrice}
                  handleAddToCart={handleAddToCart}
                  isAvailable={isAvailable}
                  isMobile={isMobile}
                  selectedModifiers={selectedModifiers}
                  addToCartLoading={addToCartLoading}
                />
              )}
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ItemModal;
