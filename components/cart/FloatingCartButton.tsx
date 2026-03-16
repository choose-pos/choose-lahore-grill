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
    cartData.reduce((total, item) => {
      const modifierPrice =
        item.modifierGroups?.reduce((modAcc, mod) => {
          let groupTotal = 0;
          switch (mod.pricingType) {
            case PriceTypeEnum.SamePrice:
              const totalQuantity =
                mod.selectedModifiers?.reduce(
                  (qtyAcc, selectedMod) => qtyAcc + selectedMod.qty,
                  0,
                ) ?? 0;
              groupTotal = (mod.price ?? 0) * totalQuantity;
              break;
            case PriceTypeEnum.IndividualPrice:
              groupTotal =
                mod.selectedModifiers?.reduce(
                  (selectedAcc, selectedMod) =>
                    selectedAcc + selectedMod.mid.price * selectedMod.qty,
                  0,
                ) ?? 0;
              break;
            case PriceTypeEnum.FreeOfCharge:
            default:
              groupTotal = 0;
          }
          return modAcc + groupTotal;
        }, 0) ?? 0;
      return total + (item.itemPrice + modifierPrice) * item.qty;
    }, 0);
  }, [cartData, cartDetails]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.pageYOffset;
      const viewportHeight = window.innerHeight * 0.1;
      setShowButton(scrollPosition > viewportHeight);
    };
    if (!isMobile) {
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [isMobile]);

  const shouldShow = isMobile || showButton;

  const textColor = isContrastOkay(
    Env.NEXT_PUBLIC_PRIMARY_COLOR,
    Env.NEXT_PUBLIC_BACKGROUND_COLOR,
  )
    ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
    : Env.NEXT_PUBLIC_TEXT_COLOR;

  return (
    <>
      <Link
        href={`/menu/cart`}
        className={`pointer-events-auto flex-1 md:w-[90%] md:flex-none md:hidden ${!shouldShow ? "hidden" : "block"}`}
      >
        <button
          className="bg-primary font-subheading-oo px-4 py-3 rounded-md flex items-center justify-center text-base shadow-lg w-full"
          style={{ color: textColor }}
        >
          {count > 0 ? (
            <div className="flex justify-between items-center w-full px-1">
              <div className="flex flex-col items-start justify-center">
                {cartDetails?.amounts?.subTotalAmount &&
                cartDetails.amounts.subTotalAmount > 0 ? (
                  <span className="font-bold text-base md:text-lg leading-tight mb-0.5">
                    ${cartDetails.amounts.subTotalAmount.toFixed(2)}
                  </span>
                ) : (
                  <span className="font-bold text-sm md:text-base leading-tight mb-0.5">
                    Proceed to checkout
                  </span>
                )}
                <span className="font-semibold text-xs md:text-sm leading-tight tracking-wide">
                  View Added Items
                </span>
              </div>
              <div className="px-3 py-1.5 md:px-4 md:py-2 rounded-md font-bold text-sm md:text-base border border-current">
                {count} ITEM{count > 1 ? "S" : ""}
              </div>
            </div>
          ) : (
            <span className="font-semibold py-2">VIEW CART</span>
          )}
        </button>
      </Link>
    </>
  );
};

export default FloatingCartButton;
