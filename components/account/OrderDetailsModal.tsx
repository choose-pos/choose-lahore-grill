"use client";

import React, { useEffect, useState } from "react";
import {
  DiscountType,
  OrderDiscountType,
  OrderType,
  PromoDiscountType,
  TransactionType,
} from "@/generated/graphql";
import { FiX } from "react-icons/fi";
import { FaSpinner } from "react-icons/fa";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  calculateTotalModifiersPrice,
  formattedNumber,
  extractErrorMessage,
} from "@/utils/UtilFncs";
import { convertToRestoTimezone } from "@/utils/formattedTime";
import { fetchWithAuth, sdk } from "@/utils/graphqlClient";
import RestaurantStore from "@/store/restaurant";
import ToastStore from "@/store/toast";
import type { OrderById } from "./TabBar";

interface OrderDetailsModalProps {
  open: boolean;
  onClose: () => void;
  orderId: string | null;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  open,
  onClose,
  orderId,
}) => {
  const [selectedOrder, setSelectedOrder] = useState<OrderById | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const { restaurantData } = RestaurantStore();
  const { setToastData } = ToastStore();

  const timezone = restaurantData?.timezone?.timezoneName?.split(" ")[0] ?? "";

  useEffect(() => {
    if (!open || !orderId) {
      if (!open) {
        setSelectedOrder(null);
      }
      return;
    }

    const fetchOrder = async () => {
      try {
        setModalLoading(true);
        const res = await fetchWithAuth(() =>
          sdk.fetchOrderById({ id: orderId }),
        );
        setSelectedOrder(res.fetchCustomerOrderById);
      } catch (error) {
        console.error("Error fetching order details:", error);
        setToastData({ message: extractErrorMessage(error), type: "error" });
      } finally {
        setModalLoading(false);
      }
    };

    fetchOrder();
  }, [open, orderId, setToastData]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const calcDiscountAmt = (): number => {
    if (!selectedOrder) {
      return 0;
    }
    if (selectedOrder.discountAmount && selectedOrder.discountAmount !== 0) {
      return selectedOrder.discountAmount;
    }
    return 0;
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-[60]"
      onClick={handleOverlayClick}
    >
      <div className="bg-white p-8 rounded-lg shadow-lg w-[90%] mx-auto md:w-full max-w-lg relative max-h-[90vh] overflow-y-scroll text-black">
        <button
          className="absolute top-4 right-2 text-gray-600 hover:text-gray-900 border rounded-full p-1 bg-gray-200"
          onClick={onClose}
        >
          <FiX size={16} />
        </button>
        {modalLoading ? (
          <div className="w-full flex justify-center items-center h-64">
            <FaSpinner className="animate-spin text-3xl text-gray-600" />
          </div>
        ) : selectedOrder ? (
          <div className="font-body-oo text-sm">
            <div className="text-center mb-4">
              <h3 className="text-xl md:text-2xl font-semibold font-subheading-oo">
                {selectedOrder.restaurantInfo.name}
              </h3>
              <p className="text-sm text-gray-700">
                {selectedOrder.restaurantInfo.address.addressLine1}
              </p>
              <p className="text-sm text-gray-700">
                Phone: +1 {formattedNumber(selectedOrder.restaurantInfo.phone)}
              </p>

              <hr className="my-4" />

              <div className="flex flex-row justify-between items-center">
                <p className="text-gray-500">Order ID:</p>
                <p className="text-gray-500">{selectedOrder.orderId}</p>
              </div>
              <div className="flex flex-row justify-between items-center">
                <p className="text-gray-500 text-left">Order Time:</p>
                <p className="text-gray-500 text-right">
                  {convertToRestoTimezone(
                    timezone,
                    new Date(selectedOrder.createdAt),
                  )}
                </p>
              </div>
              <div className="flex flex-row justify-between items-center">
                <p className="text-gray-500 text-left">
                  {selectedOrder.orderType === OrderType.Pickup
                    ? "Pickup Time"
                    : "Delivery Time"}
                  :
                </p>
                <p className="text-gray-500 text-right">
                  {convertToRestoTimezone(
                    timezone,
                    selectedOrder.orderType === OrderType.Pickup &&
                      selectedOrder.pickUpDateAndTime
                      ? new Date(selectedOrder.pickUpDateAndTime)
                      : new Date(selectedOrder.deliveryDateAndTime ?? ""),
                  )}
                </p>
              </div>
              <div className="flex flex-row justify-between items-center">
                <p className="text-gray-500 text-left">Payment Method:</p>
                <p className="text-gray-500 text-right capitalize">
                  {selectedOrder.paymentMethod ?? "N/A"}
                </p>
              </div>
            </div>

            <div className="border-t border-b py-2 mb-4">
              <div className="grid grid-cols-12 font-semibold font-subheading-oo">
                <span className="col-span-9">Item</span>
                <span className="col-span-3 text-right">Total</span>
              </div>
            </div>

            <ul className="space-y-4">
              {selectedOrder.appliedDiscount?.loyaltyData?.redeemItem ? (
                <li>
                  <div className="grid grid-cols-12">
                    <span className="col-span-9">
                      {
                        selectedOrder.appliedDiscount?.loyaltyData?.redeemItem
                          ?.itemName
                      }{" "}
                      x 1
                    </span>
                    <span className="col-span-3 text-right">
                      $
                      {selectedOrder.appliedDiscount?.loyaltyData?.redeemItem?.itemPrice?.toFixed(
                        2,
                      )}
                    </span>
                  </div>
                </li>
              ) : null}

              {selectedOrder.appliedDiscount?.promoData?.discountItemName ? (
                <li>
                  <div className="grid grid-cols-12">
                    <span className="col-span-9">
                      {
                        selectedOrder.appliedDiscount?.promoData
                          ?.discountItemName
                      }{" "}
                      x 1
                    </span>
                    <span className="col-span-3 text-right">
                      $
                      {selectedOrder.appliedDiscount?.promoData?.discountValue?.toFixed(
                        2,
                      ) || "0.00"}
                    </span>
                  </div>
                </li>
              ) : null}

              {selectedOrder.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <div className="grid grid-cols-12">
                    <span className="col-span-9">
                      {item.itemName} x {item.qty}
                    </span>
                    <span className="col-span-3 text-right">
                      $
                      {(
                        (item.itemPrice +
                          calculateTotalModifiersPrice(item.modifierGroups)) *
                        item.qty
                      ).toFixed(2)}
                    </span>
                  </div>
                  {(() => {
                    const PORTION_RE = /^---(.+?)---(.*)/i;
                    const normalizePortionLabel = (raw: string) => {
                      const s = raw.trim().toLowerCase();
                      if (s === 'whole') return 'whole';
                      if (s === '1st half') return '1half';
                      if (s === '2nd half') return '2half';
                      return s.replace(/\s+/g, '');
                    };
                    const portionMap: Record<string, string[]> = {};
                    const normalMods: { name: string; qty: number; nestedNames: string[] }[] = [];
                    item.modifierGroups.forEach((group) => {
                      group.selectedModifiers.forEach((modifier) => {
                        const nestedNames = (modifier.selectedNestedGroups ?? [])
                          .flatMap((nmgSel) =>
                            nmgSel.selectedNestedModifiers.map((nm) =>
                              nm.qty > 1 ? `${nm.nestedModifierName} x${nm.qty}` : nm.nestedModifierName
                            )
                          );
                        const portionMatch = modifier.modifierName.match(PORTION_RE);
                        if (portionMatch) {
                          const label = normalizePortionLabel(portionMatch[1]);
                          const inlineName = portionMatch[2].trim();
                          const toppings = inlineName
                            ? [inlineName + (modifier.qty > 1 ? ` x${modifier.qty}` : "")]
                            : nestedNames;
                          portionMap[label] = [...(portionMap[label] ?? []), ...toppings];
                        } else {
                          normalMods.push({ name: modifier.modifierName, qty: modifier.qty, nestedNames });
                        }
                      });
                    });
                    const portionOrder = ["whole", "1half", "2half"];
                    const portionDisplayLabel: Record<string, string> = { whole: "Whole", "1half": "1st Half", "2half": "2nd Half" };
                    const filteredPortions = portionOrder.filter((k) => portionMap[k]?.length);
                    return (
                      <div className="ml-2 text-xs text-gray-600">
                        {normalMods.map((mod, i) => (
                          <div key={i} className="grid grid-cols-12">
                            <span className="col-span-6">
                              {mod.qty > 1 ? `${mod.name} x ${mod.qty}` : mod.name}
                              {mod.nestedNames.length > 0 && (
                                <span className="text-gray-400 ml-1">({mod.nestedNames.join(", ")})</span>
                              )}
                            </span>
                          </div>
                        ))}
                        {filteredPortions.length > 0 && (
                          <div className={normalMods.length > 0 ? "mt-1" : undefined}>
                            {filteredPortions.map((k) => (
                              <div key={k} className="grid grid-cols-12">
                                <span className="col-span-6">
                                  {portionDisplayLabel[k] ?? k}
                                  <span className="text-gray-400 ml-1">({portionMap[k].join(", ")})</span>
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  {item.itemRemarks && (
                    <p className="text-gray-600 text-[12px] max-w-[300px]">
                      Remarks: {item.itemRemarks}
                    </p>
                  )}
                </li>
              ))}
            </ul>

            <div className="border-t mt-4 pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Gross Amount</span>
                <span>${selectedOrder.subTotalAmount?.toFixed(2)}</span>
              </div>
              {selectedOrder.discountAmount &&
              selectedOrder.discountAmount !== 0 ? (
                <div className="flex justify-between">
                  <span>Discount</span>
                  <span>-${selectedOrder.discountAmount.toFixed(2)}</span>
                </div>
              ) : null}

              {calcDiscountAmt() > 0 ? (
                <div className="flex justify-between">
                  <span>Net Amount</span>
                  <span>
                    $
                    {(
                      (selectedOrder.subTotalAmount ?? 0) - calcDiscountAmt()
                    ).toFixed(2)}
                  </span>
                </div>
              ) : null}

              {selectedOrder.taxAmount &&
              (selectedOrder.platformFees !== null ||
                selectedOrder.platformFees !== undefined) ? (
                <div className="flex justify-between">
                  <span>Taxes & Fees</span>
                  <span>
                    $
                    {(
                      parseFloat((selectedOrder.taxAmount ?? 0).toFixed(2)) +
                      parseFloat((selectedOrder.platformFees ?? 0).toFixed(2))
                    ).toFixed(2)}
                  </span>
                </div>
              ) : null}

              {selectedOrder.tipAmount !== null ||
              selectedOrder.tipAmount !== undefined ? (
                <div className="flex justify-between">
                  <span>{`Tip`}</span>
                  <span>
                    $
                    {selectedOrder.tipAmount !== null &&
                    selectedOrder.tipAmount !== undefined
                      ? selectedOrder.tipAmount.toFixed(2)
                      : Number(0).toFixed(2)}
                  </span>
                </div>
              ) : null}

              {(selectedOrder.deliveryAmount ?? 0) > 0 ? (
                <div className="flex justify-between">
                  <span>Delivery Fees</span>
                  <span>
                    ${(selectedOrder.deliveryAmount ?? 0).toFixed(2)}
                  </span>
                </div>
              ) : null}

              {selectedOrder.appliedGiftCard?.amountUsed ? (
                <>
                  <div className="flex justify-between font-semibold font-subheading-oo text-lg border-t pt-2">
                    <span>Subtotal</span>
                    <span>
                      $
                      {(
                        (selectedOrder.subTotalAmount ?? 0) -
                        calcDiscountAmt() +
                        (selectedOrder.taxAmount ?? 0) +
                        (selectedOrder.platformFees ?? 0) +
                        (selectedOrder.tipAmount ?? 0) +
                        (selectedOrder.deliveryAmount ?? 0)
                      ).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>
                      Gift Card ({selectedOrder.appliedGiftCard.giftCardCode})
                    </span>
                    <span>
                      -${selectedOrder.appliedGiftCard.amountUsed.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold font-subheading-oo text-lg">
                    <span>Total</span>
                    <span>
                      $
                      {(
                        (selectedOrder?.finalAmount ?? 0) -
                        (selectedOrder?.appliedGiftCard.amountUsed ?? 0)
                      )?.toFixed(2)}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between font-semibold font-subheading-oo text-lg">
                  <span>Total</span>
                  <span>${selectedOrder?.finalAmount?.toFixed(2)}</span>
                </div>
              )}

              {(selectedOrder?.refundAmount ?? 0) > 0 ? (
                <div className="flex justify-between text-green-600">
                  <span>Refund</span>
                  <span>${selectedOrder?.refundAmount?.toFixed(2)}</span>
                </div>
              ) : null}
            </div>

            {selectedOrder.appliedDiscount &&
              selectedOrder.appliedDiscount.discountType ===
                OrderDiscountType.Promo && (
                <div className="mt-4 bg-blue-50 p-4 rounded-md">
                  <p>
                    You used code {selectedOrder.appliedDiscount.promoData?.code}{" "}
                    for{" "}
                    {selectedOrder.appliedDiscount.promoData?.discountValue &&
                    selectedOrder.appliedDiscount.promoData.discountType ===
                      PromoDiscountType.Free
                      ? `$${selectedOrder.appliedDiscount?.promoData?.discountValue} off`
                      : selectedOrder.appliedDiscount.promoData?.discountValue &&
                          selectedOrder.appliedDiscount.promoData.discountType ===
                            PromoDiscountType.FreeDelivery
                        ? "free delivery"
                        : selectedOrder.appliedDiscount.promoData?.discountValue &&
                            selectedOrder.appliedDiscount.promoData.discountType ===
                              PromoDiscountType.FixedAmount
                          ? `Discount: $${selectedOrder.appliedDiscount.promoData.discountValue.toFixed(
                              2,
                            )} off`
                          : selectedOrder.appliedDiscount.promoData?.discountValue &&
                              selectedOrder.appliedDiscount.promoData.discountType ===
                                PromoDiscountType.Percentage
                            ? `$${selectedOrder.appliedDiscount.discountAmount?.toFixed(
                                2,
                              )} off`
                            : selectedOrder.appliedDiscount.promoData
                                ?.discountItemName &&
                              `Item: ${selectedOrder.appliedDiscount.promoData.discountItemName}`}
                  </p>
                </div>
              )}

            {selectedOrder.appliedDiscount &&
              selectedOrder.appliedDiscount.discountType ===
                OrderDiscountType.Loyalty && (
                <div className="mt-4 bg-blue-50 p-4 rounded-md">
                  <p>
                    You used your{" "}
                    {
                      selectedOrder.appliedDiscount.loyaltyData
                        ?.loyaltyPointsRedeemed
                    }{" "}
                    points for{" "}
                    {selectedOrder.appliedDiscount.loyaltyData?.redeemItem && (
                      <>
                        Item:{" "}
                        {
                          selectedOrder.appliedDiscount.loyaltyData?.redeemItem
                            .itemName
                        }{" "}
                        (Value: $
                        {selectedOrder.appliedDiscount.loyaltyData?.redeemItem.itemPrice.toFixed(
                          2,
                        )}
                        )
                      </>
                    )}
                    {selectedOrder.appliedDiscount.loyaltyData?.redeemDiscount
                      ?.discountValue &&
                      (selectedOrder.appliedDiscount.loyaltyData?.redeemDiscount
                        .discountType === DiscountType.FixedAmount ||
                        selectedOrder.appliedDiscount.loyaltyData?.redeemDiscount
                          .discountType === DiscountType.Percentage) && (
                        <>
                          Discount: $
                          {selectedOrder.appliedDiscount.loyaltyData?.redeemDiscount.discountValue.toFixed(
                            2,
                          )}{" "}
                          off
                        </>
                      )}
                  </p>
                </div>
              )}

            {selectedOrder?.loyaltyTransactions &&
              selectedOrder.loyaltyTransactions.length > 0 && (
                <div>
                  {selectedOrder.loyaltyTransactions.map(
                    (transaction, index) => (
                      <div key={index}>
                        {transaction.transactionType === TransactionType.Earn && (
                          <p className="mt-4 bg-green-50 p-4 rounded-md">
                            You earned {transaction.points} points for this order
                          </p>
                        )}
                      </div>
                    ),
                  )}
                </div>
              )}

            {selectedOrder.specialRemark && (
              <div className="mt-4 bg-yellow-50 p-4 rounded-md">
                <h4 className="font-semibold font-subheading-oo mb-2">
                  Restaurant Remarks
                </h4>
                <p>{selectedOrder.specialRemark}</p>
              </div>
            )}

            <div className="mt-6 text-center text-gray-500 text-xs">
              <p>Thank you for your order!</p>
            </div>
          </div>
        ) : (
          <p className="text-red-500 text-center">Failed to load order details.</p>
        )}
      </div>
    </div>
  );
};