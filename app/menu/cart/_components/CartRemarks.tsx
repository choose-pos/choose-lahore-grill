"use client";

import { Env } from "@/env";
import { useCartStore } from "@/store/cart";
import { isContrastOkay } from "@/utils/isContrastOkay";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { FiEdit2, FiFileText } from "react-icons/fi";
import { IoClose } from "react-icons/io5";

const CartRemarks = () => {
  const { specialRemarks, setSpecialRemarks } = useCartStore();
  const [showSheet, setShowSheet] = useState(false);
  const [draft, setDraft] = useState(specialRemarks);

  const openSheet = () => {
    setDraft(specialRemarks);
    setShowSheet(true);
  };

  const handleSave = () => {
    setSpecialRemarks(draft);
    setShowSheet(false);
  };

  const hasRemark = specialRemarks.length > 0;

  const modalContent = (
    <>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold font-subheading-oo">
          Order Level Remark
        </h3>
        <button
          type="button"
          onClick={() => setShowSheet(false)}
          className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
          aria-label="Close"
        >
          <IoClose size={20} />
        </button>
      </div>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        maxLength={150}
        placeholder="E.g. No onions, extra napkins, ring the doorbell..."
        className="w-full p-3 border border-gray-200 rounded-md font-body-oo text-sm focus:outline-none focus:border-gray-400 resize-none h-24 bg-gray-50 placeholder:text-gray-400 transition-colors"
        autoFocus
      />
      <p className="text-xs text-gray-500 font-body-oo text-right mt-1">
        {draft.length}/150
      </p>
      <button
        type="button"
        onClick={handleSave}
        className="w-full mt-3 py-2.5 rounded-md font-subheading-oo font-semibold text-sm hover:opacity-90 transition-all active:scale-[0.99]"
        style={{
          backgroundColor: Env.NEXT_PUBLIC_PRIMARY_COLOR,
          color: isContrastOkay(
            Env.NEXT_PUBLIC_PRIMARY_COLOR,
            Env.NEXT_PUBLIC_BACKGROUND_COLOR,
          )
            ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
            : Env.NEXT_PUBLIC_TEXT_COLOR,
        }}
      >
        {hasRemark ? "Update Remark" : "Save Remark"}
      </button>
    </>
  );

  return (
    <div className="w-full px-6">
      {hasRemark ? (
        <button
          type="button"
          onClick={openSheet}
          className="flex items-center gap-2 w-full p-3 bg-gray-50 rounded-md border border-gray-100 hover:bg-gray-100 transition-colors text-left"
        >
          <FiFileText
            size={18}
            className="text-gray-400 mt-0.5 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 font-online-ordering mb-0.5">
              Order remark
            </p>
            <p className="text-sm text-gray-700 font-online-ordering leading-snug break-words">
              {specialRemarks}
            </p>
          </div>
          <FiEdit2 size={15} className="text-gray-500 flex-shrink-0" />
        </button>
      ) : (
        <button
          type="button"
          onClick={openSheet}
          className="flex items-center justify-between w-full gap-2 p-3 rounded-md border border-dashed border-gray-300 text-gray-500 font-medium font-subheading-oo text-sm hover:bg-gray-50 hover:border-gray-400 transition-colors"
        >
          <div className="flex items-center gap-2">
            <FiFileText size={16} />
            Add order level remark
          </div>
          <span className="text-lg leading-none">+</span>
        </button>
      )}

      <AnimatePresence>
        {showSheet && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black z-50"
              onClick={() => setShowSheet(false)}
            />

            {/* Mobile: bottom sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 350 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-md z-50 shadow-2xl"
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-gray-300 rounded-md" />
              </div>
              <div className="px-4 pb-5 pt-2">{modalContent}</div>
            </motion.div>

            {/* Desktop: centered dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="hidden lg:flex fixed inset-0 z-50 items-center justify-center pointer-events-none"
            >
              <div className="bg-white rounded-md shadow-2xl w-full max-w-md p-6 pointer-events-auto">
                {modalContent}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CartRemarks;
