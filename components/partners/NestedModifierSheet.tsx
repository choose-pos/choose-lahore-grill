"use client";
import { Env } from "@/env";
import {
  NestedModifierGroupResponse,
  PriceTypeEnum,
} from "@/generated/graphql";
import { isContrastOkay } from "@/utils/isContrastOkay";
import { motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { IoMdAdd, IoMdRemove } from "react-icons/io";

interface NestedModifierSelection {
  id: string;
  quantity: number;
}

export interface NestedGroupSelection {
  nmgId: string;
  selectedNestedModifiers: NestedModifierSelection[];
}

interface NestedModifierSheetProps {
  modifierName: string;
  nestedModifierGroups: NestedModifierGroupResponse[];
  initialSelections: NestedGroupSelection[];
  onConfirm: (selections: NestedGroupSelection[]) => void;
  onCancel: () => void;
}

const NestedModifierSheet: React.FC<NestedModifierSheetProps> = ({
  modifierName,
  nestedModifierGroups,
  initialSelections,
  onConfirm,
  onCancel,
}) => {
  const [localSelections, setLocalSelections] = useState<NestedGroupSelection[]>(() =>
    nestedModifierGroups.map((nmg) => {
      const existing = initialSelections.find((s) => s.nmgId === nmg.id);
      return existing ?? { nmgId: nmg.id, selectedNestedModifiers: [] };
    })
  );
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const validationErrorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (validationErrors.length > 0 && validationErrorRef.current) {
      validationErrorRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [validationErrors]);

  const getGroupSelection = (nmgId: string): NestedGroupSelection =>
    localSelections.find((s) => s.nmgId === nmgId) ?? {
      nmgId,
      selectedNestedModifiers: [],
    };

  const isNestedModSelected = (nmgId: string, nmId: string): boolean =>
    getGroupSelection(nmgId).selectedNestedModifiers.some((s) => s.id === nmId);

  const getNestedModQty = (nmgId: string, nmId: string): number =>
    getGroupSelection(nmgId).selectedNestedModifiers.find((s) => s.id === nmId)
      ?.quantity ?? 0;

  const handleToggle = (nmg: NestedModifierGroupResponse, nmId: string) => {
    setLocalSelections((prev) =>
      prev.map((gs) => {
        if (gs.nmgId !== nmg.id) return gs;
        const alreadySelected = gs.selectedNestedModifiers.some((s) => s.id === nmId);

        if (nmg.maxSelections === 1) {
          return {
            ...gs,
            selectedNestedModifiers: alreadySelected ? [] : [{ id: nmId, quantity: 1 }],
          };
        } else {
          if (alreadySelected) {
            return {
              ...gs,
              selectedNestedModifiers: gs.selectedNestedModifiers.filter(
                (s) => s.id !== nmId
              ),
            };
          } else {
            if (nmg.maxSelections && gs.selectedNestedModifiers.length >= nmg.maxSelections) {
              return gs;
            }
            return {
              ...gs,
              selectedNestedModifiers: [
                ...gs.selectedNestedModifiers,
                { id: nmId, quantity: 1 },
              ],
            };
          }
        }
      })
    );
  };

  const handleQtyChange = (
    nmgId: string,
    nmId: string,
    delta: number,
    max: number,
    unlimited: boolean
  ) => {
    setLocalSelections((prev) =>
      prev.map((gs) => {
        if (gs.nmgId !== nmgId) return gs;
        return {
          ...gs,
          selectedNestedModifiers: gs.selectedNestedModifiers.map((s) => {
            if (s.id !== nmId) return s;
            const next = s.quantity + delta;
            return {
              ...s,
              quantity: Math.max(1, unlimited ? next : Math.min(next, max)),
            };
          }),
        };
      })
    );
  };

  const validate = (): string[] => {
    const errors: string[] = [];
    nestedModifierGroups.forEach((nmg) => {
      const gs = getGroupSelection(nmg.id);
      if (!nmg.optional && gs.selectedNestedModifiers.length < (nmg.minSelections || 1)) {
        errors.push(
          `Please select at least ${nmg.minSelections || 1} option(s) for ${nmg.name}`
        );
      }
    });
    return errors;
  };

  const handleClearGroup = (nmgId: string) => {
    setLocalSelections((prev) =>
      prev.map((gs) =>
        gs.nmgId === nmgId ? { ...gs, selectedNestedModifiers: [] } : gs
      )
    );
  };

  const handleConfirm = () => {
    const errors = validate();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    onConfirm(localSelections);
  };

  return (
    <div
      className="fixed inset-0 flex justify-center items-end sm:items-center z-[60]"
      onClick={onCancel}
    >
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
        className="bg-white rounded-t-md sm:rounded-md w-full max-w-3xl flex flex-col h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 sm:px-8 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold font-subheading-oo truncate pr-4">
            {modifierName}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-500 font-medium font-body-oo text-sm hover:underline shrink-0"
          >
            Cancel
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {nestedModifierGroups.map((nmg, nmgIndex) => {
            const gs = getGroupSelection(nmg.id);
            const isSatisfied =
              nmg.optional ||
              gs.selectedNestedModifiers.length >= (nmg.minSelections || 1);

            return (
              <div key={nmgIndex} className="mb-3 sm:mb-4 rounded-lg">
                <div className="flex items-center justify-between px-6 sm:px-8 py-2">
                  <div className="space-y-0.5">
                    <h3 className="text-xl sm:text-2xl font-semibold font-subheading-oo">
                      {nmg.name}
                    </h3>
                    {nmg.desc && (
                      <p className="text-xs font-body-oo text-gray-500">
                        {nmg.desc}
                      </p>
                    )}
                    <p className="text-xs sm:text-sm font-body-oo">
                      {nmg.minSelections > 0
                        ? nmg.minSelections === nmg.maxSelections
                          ? `Select up to ${nmg.maxSelections} options`
                          : `Select ${nmg.minSelections} to ${nmg.maxSelections} options`
                        : nmg.maxSelections
                          ? `Select up to ${nmg.maxSelections} options`
                          : "Optional selections"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-xs sm:text-sm px-1.5 sm:px-2 py-0.5 rounded-md font-subheading-oo ${
                        !nmg.optional
                          ? isSatisfied
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {!nmg.optional ? "Required" : "Optional"}
                    </span>
                    {gs.selectedNestedModifiers.length > 0 && (
                      <button
                        onClick={() => handleClearGroup(nmg.id)}
                        className="text-xs sm:text-sm font-heading-oo hover:underline"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2 font-subheading-oo px-6 sm:px-8 bg-white py-4">
                  {nmg.nestedModifiers.map((nm, nmIndex) => {
                    const isSelected = isNestedModSelected(nmg.id, nm.id);
                    const currentQty = getNestedModQty(nmg.id, nm.id);
                    const isDisabled =
                      nmg.maxSelections > 1 &&
                      !isSelected &&
                      gs.selectedNestedModifiers.length >= nmg.maxSelections;

                    return (
                      <React.Fragment key={nmIndex}>
                        <div
                          className={`flex items-center justify-between p-1 rounded-lg transition-all duration-200 ${
                            isDisabled
                              ? "opacity-50 cursor-not-allowed"
                              : "cursor-pointer"
                          }`}
                          onClick={() =>
                            !isDisabled && handleToggle(nmg, nm.id)
                          }
                        >
                          <div className="flex items-center flex-grow gap-1.5 sm:gap-2">
                            <input
                              type={
                                nmg.maxSelections === 1 ? "radio" : "checkbox"
                              }
                              checked={isSelected}
                              onChange={() => {}}
                              className="accent-primary border-gray-300 w-3.5 h-3.5 sm:w-4 sm:h-4 cursor-pointer pointer-events-none"
                              disabled={isDisabled}
                            />
                            <div className="flex flex-col">
                              <label className="flex items-center gap-1 cursor-pointer pointer-events-none">
                                <span className="text-base md:text-lg font-body-oo font-normal">
                                  {nm.name}
                                </span>
                                {nmg.pricingType ===
                                  PriceTypeEnum.IndividualPrice &&
                                  nm.price > 0 && (
                                    <span className="text-xs sm:text-sm ml-2 font-body-oo font-medium">
                                      +${nm.price.toFixed(2)}
                                    </span>
                                  )}
                                {nmg.pricingType === PriceTypeEnum.SamePrice &&
                                  nmg.price != null &&
                                  nmg.price > 0 && (
                                    <span className="text-xs sm:text-sm ml-2 font-body-oo font-medium">
                                      +${nmg.price.toFixed(2)}
                                    </span>
                                  )}
                              </label>
                            </div>
                          </div>

                          {isSelected &&
                            nmg.allowMultiSelctSingleModsInGroup && (
                              <div
                                className="flex items-center gap-1 ml-1 sm:ml-2 bg-white"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() =>
                                    handleQtyChange(
                                      nmg.id,
                                      nm.id,
                                      -1,
                                      nmg.maxSelctSingleModsInGroup,
                                      nmg.isMaxSelctSingleModsInGroupUnlimited,
                                    )
                                  }
                                  className="p-[1px] hover:bg-gray-100 transition-colors duration-200 rounded-full border border-black"
                                  disabled={currentQty <= 1}
                                >
                                  <IoMdRemove size={16} />
                                </button>
                                <span className="mx-[1px] min-w-[20px] text-base text-center">
                                  {currentQty}
                                </span>
                                <button
                                  onClick={() =>
                                    handleQtyChange(
                                      nmg.id,
                                      nm.id,
                                      1,
                                      nmg.maxSelctSingleModsInGroup,
                                      nmg.isMaxSelctSingleModsInGroupUnlimited,
                                    )
                                  }
                                  className="p-[1px] hover:bg-gray-100 transition-colors duration-200 rounded-full border border-black disabled:bg-gray-200 disabled:cursor-not-allowed"
                                  disabled={
                                    !nmg.isMaxSelctSingleModsInGroupUnlimited &&
                                    currentQty >= nmg.maxSelctSingleModsInGroup
                                  }
                                >
                                  <IoMdAdd size={16} />
                                </button>
                              </div>
                            )}
                        </div>
                        {nmIndex < nmg.nestedModifiers.length - 1 && (
                          <hr className="border border-t border-gray-100 my-1" />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {validationErrors.length > 0 && (
            <div ref={validationErrorRef} className="px-6 sm:px-8 pb-4">
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-lg">
                <ul className="list-disc list-inside text-xs sm:text-sm space-y-1 font-body-oo">
                  {validationErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-white sticky bottom-0">
          <button
            onClick={handleConfirm}
            className="w-full bg-primary py-4 rounded-md font-semibold font-subheading-oo text-sm sm:text-base shadow-md hover:shadow-lg transition duration-300"
            style={{
              color: isContrastOkay(
                Env.NEXT_PUBLIC_PRIMARY_COLOR,
                Env.NEXT_PUBLIC_BACKGROUND_COLOR,
              )
                ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
                : Env.NEXT_PUBLIC_TEXT_COLOR,
            }}
          >
            Confirm selection
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default NestedModifierSheet;
