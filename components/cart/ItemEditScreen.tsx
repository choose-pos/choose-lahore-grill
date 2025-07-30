import {
  ItemWithModifiersResponse,
  PriceTypeEnum,
  UpdateCartItemInput,
} from "@/generated/graphql";
import { useCartStore } from "@/store/cart";
import ToastStore from "@/store/toast";
import { sdk } from "@/utils/graphqlClient";
import { fadeIn } from "@/utils/motion";
import { GroupedCartItem } from "@/utils/types";
import { extractErrorMessage } from "@/utils/UtilFncs";
import { motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { IoMdClose } from "react-icons/io";
import RenderContent from "../partners/renderContent";

// New interface for modifier selection with quantity
interface ModifierSelection {
  id: string;
  quantity: number;
}

interface SelectedModifiersState {
  [groupId: string]: ModifierSelection[];
}

interface ItemEditScreenProps {
  item: GroupedCartItem;
  onClose: () => void;
  refreshData: () => void;
}

const ItemEditScreen: React.FC<ItemEditScreenProps> = ({
  item,
  onClose,
  refreshData,
}) => {
  const [categoryItem, setCategoryItem] =
    useState<ItemWithModifiersResponse | null>(null);
  const [selectedModifiers, setSelectedModifiers] =
    useState<SelectedModifiersState>({});
  const [specialRequest, setSpecialRequest] = useState<string>(item.remarks);
  const [isMobile, setIsMobile] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [addToCartLoading, setAddToCartLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const { setCartData, cartData } = useCartStore();
  const { setToastData } = ToastStore();
  const validationErrorsRef = useRef<HTMLDivElement>(null);

  // [Previous useEffects remain the same]

  useEffect(() => {
    if (validationErrors.length > 0 && validationErrorsRef.current) {
      validationErrorsRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [validationErrors]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    calculateTotalPrice();
  }, [categoryItem, selectedModifiers]);

  const calculateTotalPrice = () => {
    if (!categoryItem) return;
    const cartItem = cartData.find((item) => item.itemId === categoryItem.id);
    const quantity = cartItem ? cartItem.qty : 1; // Default to 0 if not found
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

  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        if (!item.itemId) return;
        const customerItemDetails = await sdk.getCustomerItem({
          id: item.itemId,
        });

        if (customerItemDetails?.getCustomerItem) {
          setCategoryItem(customerItemDetails.getCustomerItem);
          initializeSelectedModifiers(customerItemDetails.getCustomerItem);
        }
      } catch (error) {
        console.error("Failed to fetch Item Details", error);
        setToastData({ message: extractErrorMessage(error), type: "error" });
      }
    };
    fetchItemDetails();
  }, [item.itemId]);

  const initializeSelectedModifiers = (
    categoryItem: ItemWithModifiersResponse
  ) => {
    const initialModifiers: SelectedModifiersState = {};
    categoryItem.modifierGroups?.forEach((group) => {
      const selectedModsInGroup = item.modifierGroups?.find(
        (g) => g.name === group.name
      )?.selectedModifiers;
      initialModifiers[group.id] = group.modifiers
        .filter((mod) =>
          selectedModsInGroup?.some(
            (selectedMod) => selectedMod.mid.name === mod.name
          )
        )
        .map((mod) => {
          // Find the matching modifier in the cart to get its quantity
          const cartModifier = selectedModsInGroup?.find(
            (selectedMod) => selectedMod.mid._id === mod.id
          );
          return {
            id: mod.id,
            quantity: cartModifier?.qty || 1,
          };
        });
    });
    setSelectedModifiers(initialModifiers);
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
    categoryItem?.modifierGroups?.forEach((group) => {
      const selections = selectedModifiers[group.id] || [];

      if (!group.optional && selections.length < (group.minSelections || 1)) {
        errors.push(
          `Please select at least ${group.minSelections || 1} option(s) for ${
            group.name
          }`
        );
      }

      if (group.maxSelections && selections.length > group.maxSelections) {
        errors.push(
          `You can only select up to ${group.maxSelections} option(s) for ${group.name}`
        );
      }
    });
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const refreshCart = async () => {
    try {
      const res = await sdk.FetchCartItems();
      if (res.fetchCartItems) {
        const items = res.fetchCartItems.cartData;
        const groupedCart: GroupedCartItem[] = items.map((item) => ({
          _id: item._id,
          itemName: item.itemId.name,
          itemId: item.itemId._id,
          itemImage: item.itemId.image,
          itemPrice: item.itemId.price,
          qty: item.qty,
          remarks: item.remarks || "",
          modifierGroups:
            item.modifierGroups?.map((modg) => ({
              name: modg.mgId.name,
              price: modg.mgId.price,
              _id: modg.mgId._id,
              pricingType: modg.mgId.pricingType,
              selectedModifiers: modg.selectedModifiers?.map((mod) => ({
                qty: mod.qty,
                mid: {
                  name: mod.mid.name,
                  _id: mod.mid._id,
                  price: mod.mid.price,
                },
              })),
            })) || [],
        }));
        setCartData(groupedCart);
        if (res.fetchCartItems.message) {
          setToastData({
            message: res.fetchCartItems.message,
            type: "error",
          });
        }
      }
    } catch (error) {
      console.error("Error refreshing cart:", error);
    }
  };

  const handleUpdateCart = async () => {
    if (!categoryItem) return;
    if (validateSelection()) {
      const updateCartItemInput: UpdateCartItemInput = {
        _id: item._id,
        remarks: specialRequest,
        modifierGroups:
          categoryItem.modifierGroups?.map((group) => ({
            mgId: group.id,
            selectedModifiers: (selectedModifiers[group.id] || []).map(
              (selection) => ({
                mid: selection.id,
                qty: selection.quantity,
              })
            ),
          })) || [],
      };

      try {
        setAddToCartLoading(true);
        const res = await sdk.UpdateCartItem({ input: updateCartItemInput });
        if (res.updateCartItem) {
          refreshCart();
          onClose();
          refreshData();
        }
      } catch (error) {
        console.error("Error updating cart item:", error);
        setToastData({
          message: extractErrorMessage(error),
          type: "error",
        });
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

  if (!categoryItem) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-end md:items-center p-4"
    >
      <motion.div
        variants={fadeIn("up", "tween", 0, 0.3)}
        initial="hidden"
        animate="show"
        exit="hidden"
        className="relative bg-bgGray rounded-[30px] shadow-xl w-full max-w-3xl overflow-auto scrollbar-hide flex flex-col max-h-[90vh] md:max-h-[90vh]"
      >
        <div className="absolute top-[3px] right-[3px] z-50">
          <button
            onClick={onClose}
            className=" text-white bg-black bg-opacity-50 rounded-full p-2.5 hover:bg-opacity-70 transition-all duration-300 !z-50 mt-1 mr-2"
          >
            <IoMdClose size={20} />
          </button>
        </div>
        <div className="overflow-y-scroll scrollbar-hide">
          <RenderContent
            categoryItem={categoryItem}
            clearModifierSelection={clearModifierSelection}
            handleModifierChange={handleModifierChange}
            handleModifierQuantityChange={handleModifierQuantityChange}
            getModifierQuantity={getModifierQuantity}
            validationErrors={validationErrors}
            specialRequest={specialRequest}
            setSpecialRequest={setSpecialRequest}
            totalPrice={totalPrice}
            handleAddToCart={handleUpdateCart}
            isMobile={isMobile}
            isAvailable={true}
            selectedModifiers={selectedModifiers}
            isEdit={true}
            addToCartLoading={addToCartLoading}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ItemEditScreen;
