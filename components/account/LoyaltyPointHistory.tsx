"use client";

import { TransactionType } from "@/generated/graphql";
import RestaurantStore from "@/store/restaurant";
import ToastStore from "@/store/toast";
import { convertToRestoTimezone } from "@/utils/formattedTime";
import { fetchWithAuth, sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/UtilFncs";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FiArrowDownLeft, FiArrowUpRight, FiClock, FiRefreshCw, FiRotateCcw, FiXCircle } from "react-icons/fi";
import { IoMdClose } from "react-icons/io";
import { OrderDetailsModal } from "./OrderDetailsModal";

interface LoyaltyTransaction {
  _id: string;
  transactionType: TransactionType;
  points: number;
  createdAt: string;
  expiresAt?: string;
  order?: {
    _id: string;
  } | null;
}

interface LoyaltyPointHistoryProps {
  open: boolean;
  onClose: () => void;
  pointsName?: string;
}

const isCredit = (type: TransactionType) =>
  type === TransactionType.Earn || type === TransactionType.RefundLoyalty;

const TRANSACTION_CONFIG: Record<
  TransactionType,
  { label: string; icon: React.ReactNode }
> = {
  [TransactionType.Earn]: {
    label: "Earned",
    icon: <FiArrowUpRight size={16} />,
  },
  [TransactionType.Redeem]: {
    label: "Redeemed",
    icon: <FiArrowDownLeft size={16} />,
  },
  [TransactionType.RefundLoyalty]: {
    label: "Refunded",
    icon: <FiRefreshCw size={14} />,
  },
  [TransactionType.ReversalEarn]: {
    label: "Reversed",
    icon: <FiRotateCcw size={14} />,
  },
  [TransactionType.ReversalRedeem]: {
    label: "Redemption Reversed",
    icon: <FiRotateCcw size={14} />,
  },
  [TransactionType.Expire]: {
    label: "Expired",
    icon: <FiXCircle size={14} />,
  },
};

const SkeletonRow = () => (
  <div className="flex items-center gap-3 py-3.5 border-b last:border-b-0 animate-pulse">
    <div className="w-9 h-9 rounded-full bg-bgGray shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3.5 bg-bgGray rounded w-20" />
      <div className="h-3 bg-bgGray rounded w-32" />
    </div>
    <div className="h-4 bg-bgGray rounded w-14" />
  </div>
);

const LoyaltyPointHistory: React.FC<LoyaltyPointHistoryProps> = ({
  open,
  onClose,
  pointsName = "points",
}) => {
  const { restaurantData } = RestaurantStore();
  const { setToastData } = ToastStore();
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [loading, setLoading] = useState(false);

  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const timezone = restaurantData?.timezone?.timezoneName?.split(" ")[0] ?? "";

  useEffect(() => {
    if (!open) return;
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const res = await fetchWithAuth(() =>
          sdk.fetchLoyaltyPointsTransactions(),
        );
        setTransactions(res.fetchLoyaltyPointsTransactions ?? []);
      } catch (error) {
        setToastData({ type: "error", message: extractErrorMessage(error) });
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [open, setToastData]);

  const openReceiptModal = (orderId: string) => {
    setSelectedOrderId(orderId);
    setReceiptModalOpen(true);
  };

  const headerLabel = pointsName === "points" ? "Loyalty Point" : pointsName;

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 sm:p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "tween", duration: 0.28, ease: "easeOut" }}
              className="bg-white w-full sm:max-w-lg rounded-t-lg sm:rounded-lg max-h-[85vh] overflow-hidden shadow-md border border-gray-100 flex flex-col font-body-oo"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 shrink-0">
                <div>
                  <h2 className="font-subheading-oo font-semibold text-2xl text-gray-800">
                    {headerLabel} History
                  </h2>
                  {!loading && transactions.length > 0 && (
                    <p className="text-sm text-textGrayColor mt-0.5 font-body-oo">
                      {transactions.length}{" "}
                      {transactions.length === 1 ? "transaction" : "transactions"}
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="hover:bg-bgGray rounded-lg p-1.5 transition-colors text-gray-500 hover:text-gray-800"
                  aria-label="Close"
                >
                  <IoMdClose size={22} />
                </button>
              </div>

              {/* Body */}
              <div className="overflow-y-auto px-5 py-2">
                {loading ? (
                  <>
                    {[...Array(5)].map((_, i) => (
                      <SkeletonRow key={i} />
                    ))}
                  </>
                ) : transactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-14 h-14 rounded-full bg-bgGray flex items-center justify-center mb-3">
                      <FiClock size={24} className="text-textGrayColor" />
                    </div>
                    <p className="font-semibold text-gray-800 font-subheading-oo">
                      No transactions yet
                    </p>
                    <p className="text-sm text-textGrayColor mt-1 font-body-oo">
                      Your {pointsName} activity will appear here
                    </p>
                  </div>
                ) : (
                  transactions.map((transaction) => {
                    const credit = isCredit(transaction.transactionType);
                    const config = TRANSACTION_CONFIG[transaction.transactionType];
                    const hasOrderReceipt = !!transaction.order?._id;
                    const showExpiry =
                      credit &&
                      transaction.expiresAt &&
                      !isNaN(new Date(transaction.expiresAt).getTime());

                    return (
                      <div
                        key={transaction._id}
                        className="flex items-start gap-3 py-3.5 border-b border-gray-100 last:border-b-0"
                      >
                        {/* Icon */}
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-bgGray ${
                            credit ? "text-green-700" : "text-red-500"
                          }`}
                        >
                          {config.icon}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-gray-800 font-subheading-oo">
                            {config.label}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 font-body-oo">
                            {convertToRestoTimezone(
                              timezone,
                              new Date(transaction.createdAt),
                            )}
                          </p>
                          {showExpiry && (
                            <p className="flex items-center gap-1 text-xs sm:text-sm text-gray-500 mt-0.5 font-body-oo">
                              <FiClock size={11} />
                              Expires{" "}
                              {convertToRestoTimezone(
                                timezone,
                                new Date(transaction.expiresAt!),
                              )}
                            </p>
                          )}
                          {hasOrderReceipt && (
                            <button
                              onClick={() =>
                                openReceiptModal(transaction.order!._id)
                              }
                              className="text-sm font-semibold text-gray-800 underline underline-offset-2 mt-1 hover:opacity-70 transition-opacity font-body-oo"
                            >
                              View receipt
                            </button>
                          )}
                        </div>

                        {/* Points — stacked on mobile, inline on sm+ */}
                        <div className="shrink-0 text-right">
                          <p
                            className={`text-sm font-semibold font-subheading-oo ${
                              credit ? "text-green-700" : "text-red-500"
                            }`}
                          >
                            {credit ? "+" : "−"}
                            {Math.abs(transaction.points)}
                            <span className="hidden sm:inline font-normal text-xs ml-1">
                              {pointsName}
                            </span>
                          </p>
                          <p className="text-xs text-textGrayColor font-body-oo sm:hidden">
                            {pointsName}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <OrderDetailsModal
        open={receiptModalOpen}
        onClose={() => {
          setReceiptModalOpen(false);
          setSelectedOrderId(null);
        }}
        orderId={selectedOrderId}
      />
    </>
  );
};

export default LoyaltyPointHistory;