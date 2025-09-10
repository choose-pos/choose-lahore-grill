import { Env } from "@/env";
import { PriceTypeEnum } from "@/generated/graphql";
import { useCartStore } from "@/store/cart";
import { isContrastOkay } from "@/utils/isContrastOkay";
import Link from "next/link";
import { useEffect, useState } from "react";

const FloatingCartButton = ({ count }: { count: number }) => {
  const [showButton, setShowButton] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { cartData, cartDetails } = useCartStore();

  useEffect(() => {
    const total = cartData.reduce((total, item) => {
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

      const itemTotal = (item.itemPrice + modifierPrice) * item.qty;
      return total + itemTotal;
    }, 0);
  }, [cartData, cartDetails]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkMobile();

    // Check on resize
    window.addEventListener("resize", checkMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.pageYOffset;
      const viewportHeight = window.innerHeight * 0.1; // 10vh
      setShowButton(scrollPosition > viewportHeight);
    };

    // Only add scroll listener for desktop devices
    if (!isMobile) {
      window.addEventListener("scroll", handleScroll);
      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    }
  }, [isMobile]);

  // Show button logic: always show on mobile, use scroll position on desktop
  const shouldShow = isMobile || showButton;

  return (
    <Link href={`/menu/cart`}>
      <button
        className={`bg-primary font-online-ordering text-white px-4 py-3 rounded-full flex items-center justify-center text-base fixed bottom-6 z-40 shadow-lg
        ${
          isMobile
            ? "left-6 right-6" // Full width with margins on mobile
            : shouldShow
            ? "right-5 hidden"
            : "hidden" // Hide on desktop based on scroll position
        }`}
        style={{
          color: isContrastOkay(
            Env.NEXT_PUBLIC_PRIMARY_COLOR,
            Env.NEXT_PUBLIC_BACKGROUND_COLOR
          )
            ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
            : Env.NEXT_PUBLIC_TEXT_COLOR,
        }}
      >
         {count > 0
          ? `${
              isMobile
                ? cartDetails?.amounts?.subTotalAmount &&
                  cartDetails?.amounts?.subTotalAmount > 0
                  ? `VIEW CART - $${(
                      cartDetails?.amounts?.subTotalAmount ?? 0
                    ).toFixed(2)}`
                  : "Proceed to checkout"
                : `VIEW CART (${count})`
            }`
          : "VIEW CART"}

      </button>
    </Link>
  );
};

export default FloatingCartButton;
