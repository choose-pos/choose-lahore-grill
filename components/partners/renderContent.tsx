import ItemOptions from "@/components/partners/ItemOptions";
import NestedModifierSheet from "@/components/partners/NestedModifierSheet";
import type { NestedGroupSelection } from "@/components/partners/NestedModifierSheet";
import { Env } from "@/env";
import {
  ItemOptionsEnum,
  ItemWithModifiersResponse,
  ModifierInfoResponse,
  PriceTypeEnum,
} from "@/generated/graphql";
import { isContrastOkay } from "@/utils/isContrastOkay";
import { AnimatePresence } from "framer-motion";
import Image from "next/image";
import React, { useState } from "react";
import { FiMinus, FiPlus } from "react-icons/fi";
import { IoMdAdd, IoMdRemove } from "react-icons/io";
import spicyImage from "../../assets/spicy-solid.svg";
import Leaf from "../../assets/vegan-solid.svg";
import { ChevronDown, ChevronRight, ChevronUp } from "lucide-react";

interface ModifierSelection {
  id: string;
  quantity: number;
  selectedNestedGroups?: NestedGroupSelection[];
}

interface SelectedModifiersState {
  [groupId: string]: ModifierSelection[];
}

interface RenderContentProps {
  categoryItem: ItemWithModifiersResponse;
  selectedModifiers: SelectedModifiersState;
  handleModifierChange: (
    groupId: string,
    modifierId: string,
    isMultiSelect: boolean,
  ) => void;
  handleModifierQuantityChange: (
    groupId: string,
    modifierId: string,
    delta: number,
  ) => void;
  handleNestedConfirm: (
    groupId: string,
    modifierId: string,
    nestedGroups: NestedGroupSelection[],
  ) => void;
  clearModifierSelection: (groupId: string) => void;
  getModifierQuantity: (groupId: string, modifierId: string) => number;
  quantity?: number;
  handleQuantityChange?: (delta: number) => void;
  validationErrors: string[];
  validationErrorRef?: React.RefObject<HTMLDivElement>;
  specialRequest: string;
  setSpecialRequest: (value: string) => void;
  totalPrice: number;
  handleAddToCart: () => void;
  isAvailable?: boolean;
  isMobile: boolean;
  isEdit?: boolean;
  addToCartLoading?: boolean;
}

const RenderContent: React.FC<RenderContentProps> = ({
  categoryItem,
  selectedModifiers,
  handleModifierChange,
  handleModifierQuantityChange,
  handleNestedConfirm,
  clearModifierSelection,
  getModifierQuantity,
  quantity,
  handleQuantityChange,
  validationErrors,
  validationErrorRef,
  specialRequest,
  setSpecialRequest,
  totalPrice,
  handleAddToCart,
  isAvailable,
  isMobile,
  isEdit,
  addToCartLoading,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [nestedSheetState, setNestedSheetState] = useState<{
    groupId: string;
    modifier: ModifierInfoResponse;
  } | null>(null);

  const MAX_PREVIEW_LENGTH = 32;
  const MAX_PREVIEW_LENGTH_DESKTOP = 160;

  const needsReadMore =
    categoryItem.desc &&
    categoryItem.desc.length >
      (isMobile ? MAX_PREVIEW_LENGTH : MAX_PREVIEW_LENGTH_DESKTOP);
  const displayedText =
    needsReadMore && !isExpanded && categoryItem.desc
      ? `${categoryItem?.desc.substring(
          0,
          isMobile ? MAX_PREVIEW_LENGTH : MAX_PREVIEW_LENGTH_DESKTOP,
        )}...`
      : categoryItem.desc;

  const isNestedModifierValidlySelected = (
    groupId: string,
    modifier: ModifierInfoResponse,
  ): boolean => {
    const selection = selectedModifiers[groupId]?.find(
      (s) => s.id === modifier.id,
    );
    if (!selection) return false;
    if (!modifier.nestedModifierGroups?.length) return true;
    return modifier.nestedModifierGroups.every((nmg) => {
      if (nmg.optional) return true;
      const nmgSel = selection.selectedNestedGroups?.find(
        (s) => s.nmgId === nmg.id,
      );
      return (
        (nmgSel?.selectedNestedModifiers.length ?? 0) >=
        (nmg.minSelections || 1)
      );
    });
  };

  const getNestedPriceTotal = (
    groupId: string,
    modifier: ModifierInfoResponse,
  ): number => {
    const selection = selectedModifiers[groupId]?.find(
      (s) => s.id === modifier.id,
    );
    if (!selection?.selectedNestedGroups?.length) return 0;
    return selection.selectedNestedGroups.reduce((total, nmgSel) => {
      const nmg = modifier.nestedModifierGroups?.find(
        (nmg) => nmg.id === nmgSel.nmgId,
      );
      if (!nmg) return total;
      switch (nmg.pricingType) {
        case PriceTypeEnum.SamePrice:
          return (
            total +
            (nmg.price ?? 0) *
              nmgSel.selectedNestedModifiers.reduce(
                (t, nm) => t + nm.quantity,
                0,
              )
          );
        case PriceTypeEnum.IndividualPrice:
          return (
            total +
            nmgSel.selectedNestedModifiers.reduce((t, nmSel) => {
              const nm = nmg.nestedModifiers.find((nm) => nm.id === nmSel.id);
              return t + (nm?.price ?? 0) * nmSel.quantity;
            }, 0)
          );
        default:
          return total;
      }
    }, 0);
  };

  const getNestedSelectionSummary = (
    groupId: string,
    modifier: ModifierInfoResponse,
  ): string => {
    const selection = selectedModifiers[groupId]?.find(
      (s) => s.id === modifier.id,
    );
    if (!selection?.selectedNestedGroups?.length) return "";
    const names: string[] = [];
    selection.selectedNestedGroups.forEach((nmgSel) => {
      const nmg = modifier.nestedModifierGroups?.find(
        (nmg) => nmg.id === nmgSel.nmgId,
      );
      if (nmg) {
        nmgSel.selectedNestedModifiers.forEach((nmSel) => {
          const nm = nmg.nestedModifiers.find((nm) => nm.id === nmSel.id);
          if (nm) names.push(nmSel.quantity > 1 ? `${nm.name} x${nmSel.quantity}` : nm.name);
        });
      }
    });
    return names.join(", ");
  };

  return (
    <>
      <div className="relative">
        {categoryItem.image && (
          <div className="h-[300px] max-h-[300px] w-full relative rounded-t-md sm:rounded-md overflow-hidden">
            <Image
              src={categoryItem.image || "/placeholder.svg"}
              alt={categoryItem.name}
              fill
              sizes=""
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex flex-wrap max-w-full px-4 sm:px-6 pt-3 pb-1 bg-white">
          {categoryItem.options
            .filter(
              (option) =>
                option.status === true &&
                option.type !== ItemOptionsEnum.IsSpicy &&
                option.type !== ItemOptionsEnum.UpSellItem &&
                option.type !== ItemOptionsEnum.IsVegan,
            )
            .map((option) => {
              if (option.type === ItemOptionsEnum.PopularItem) {
                return (
                  <span
                    key={option._id}
                    className="font-body-oo font-medium inline-block px-2 py-1 mr-1.5 mb-1 md:mb-0 text-xs sm:text-sm rounded-md bg-green-600 text-white border border-textGray"
                  >
                    Best Seller
                  </span>
                );
              }
              return (
                <span
                  key={option._id}
                  className="font-body-oo font-medium inline-block px-2 py-1 mr-1.5 mb-1 md:mb-0 text-xs sm:text-sm rounded-md bg-bgGray border border-textGray"
                >
                  {option.displayName}
                </span>
              );
            })}
        </div>
      </div>

      <div
        className={`${
          categoryItem.options.filter((option) => option.status === true)
            .length === 0
            ? "md:pt-6"
            : ""
        } flex-grow bg-white`}
      >
        <div className="px-6 sm:px-8 py-2 mb-2 sticky top-0 border-b border-b-gray-200 z-10 bg-white">
          <div className="flex flex-col md:flex-row md:items-center items-start justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold font-subheading-oo">
                  {categoryItem?.name}
                </h2>
                <div className="flex items-center space-x-1 w-16">
                  {categoryItem.options.some(
                    (option) =>
                      option.type === ItemOptionsEnum.IsSpicy &&
                      option.status === true,
                  ) && (
                    <Image
                      src={spicyImage || "/placeholder.svg"}
                      alt="Spicy"
                      width={16}
                      height={16}
                    />
                  )}
                  {categoryItem.options.some(
                    (option) =>
                      option.type === ItemOptionsEnum.IsVegan &&
                      option.status === true,
                  ) && (
                    <Image
                      src={Leaf || "/placeholder.svg"}
                      alt="Vegan"
                      width={16}
                      height={16}
                    />
                  )}
                </div>
              </div>
            </div>
            <div>
              <p className="text-base sm:text-3xl font-medium mb-1.5 font-body-oo">
                ${categoryItem.price.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {displayedText ? (
          <div className="px-6 sm:px-8 py-2 mb-2">
            <div className="relative">
              <label
                htmlFor="item-desc"
                className="text-base sm:text-lg font-medium md:mb-1.5 block font-subheading-oo"
              >
                Description
              </label>
              <p className="text-base md:text-base sm:text-lg md:leading-relaxed font-body-oo inline">
                {displayedText}
                {needsReadMore && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="inline-flex items-center text-black ml-1 text-sm font-medium hover:underline align-middle"
                  >
                    {isExpanded ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>
                )}
              </p>
            </div>
          </div>
        ) : null}

        {categoryItem.modifierGroups?.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-3 sm:mb-4 rounded-lg">
            <div className="flex items-center justify-between px-6 sm:px-8 py-2">
              <div className="space-y-0.5">
                <h3 className="text-xl sm:text-2xl font-semibold font-subheading-oo">
                  {group.name}
                </h3>
                {!group.modifiers.some(
                  (m) => (m.nestedModifierGroups?.length ?? 0) > 0,
                ) && (
                  <p className="text-xs sm:text-sm font-body-oo">
                    {group.minSelections !== undefined &&
                    group.minSelections > 0
                      ? group.minSelections === group.maxSelections
                        ? `Select upto ${group.maxSelections} options`
                        : `Select ${group.minSelections} to ${group.maxSelections} options`
                      : group.maxSelections
                        ? `Select up to ${group.maxSelections} options`
                        : "Optional selections"}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <span
                  className={`text-xs sm:text-sm px-1.5 sm:px-2 py-0.5 rounded-md font-subheading-oo ${
                    !group.optional
                      ? selectedModifiers[group.id]?.length >=
                        (group.minSelections || 1)
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {!group.optional ? "Required" : "Optional"}
                </span>
                {selectedModifiers[group.id]?.length > 0 && (
                  <button
                    onClick={() => clearModifierSelection(group.id)}
                    className="text-xs sm:text-sm font-heading-oo hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2 font-subheading-oo px-6 sm:px-8 bg-white py-4">
              {group.modifiers.map((modifier, modifierIndex) => {
                const hasNested =
                  (modifier.nestedModifierGroups?.length ?? 0) > 0;
                const isSelected = selectedModifiers[group.id]?.some(
                  (s) => s.id === modifier.id,
                );
                const currentQuantity = getModifierQuantity(
                  group.id,
                  modifier.id,
                );
                const isDisabled =
                  group.maxSelections === 1
                    ? false
                    : !isSelected &&
                      selectedModifiers[group.id]?.length >=
                        group.maxSelections;

                if (hasNested) {
                  const isValidlySelected = isNestedModifierValidlySelected(
                    group.id,
                    modifier,
                  );
                  const summary = getNestedSelectionSummary(group.id, modifier);

                  const nestedPriceTotal = getNestedPriceTotal(
                    group.id,
                    modifier,
                  );

                  return (
                    <React.Fragment key={modifierIndex}>
                      <div
                        className="flex items-center justify-between p-1 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50"
                        onClick={() =>
                          setNestedSheetState({ groupId: group.id, modifier })
                        }
                      >
                        <div className="flex items-center flex-grow gap-1.5 sm:gap-2">
                          <input
                            type="checkbox"
                            checked={isValidlySelected}
                            onChange={() => {}}
                            className="accent-primary border-gray-300 w-3.5 h-3.5 sm:w-4 sm:h-4 pointer-events-none"
                          />
                          <span className="text-base md:text-lg font-body-oo font-normal">
                            {modifier.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {nestedPriceTotal > 0 && (
                            <span className="text-xs sm:text-sm font-body-oo font-medium text-gray-500">
                              +${nestedPriceTotal.toFixed(2)}
                            </span>
                          )}
                          <ChevronRight className="text-gray-400" size={18} />
                        </div>
                      </div>
                      {summary && (
                        <div className="ml-6 mt-0.5 mb-1 px-2.5 py-1.5 bg-gray-50 rounded-md text-xs font-body-oo text-gray-500 leading-relaxed">
                          {summary}
                        </div>
                      )}
                      {modifierIndex < group.modifiers.length - 1 && (
                        <hr className="border border-t border-gray-100 my-1" />
                      )}
                    </React.Fragment>
                  );
                }

                return (
                  <React.Fragment key={modifierIndex}>
                    <div
                      className={`flex items-center justify-between p-1 rounded-lg transition-all duration-200 ${
                        isDisabled ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <div className="flex items-center flex-grow gap-1.5 sm:gap-2">
                        <input
                          type={
                            group.maxSelections === 1 ? "radio" : "checkbox"
                          }
                          id={`modifier-${groupIndex}-${modifierIndex}`}
                          name={`group-${groupIndex}`}
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleModifierChange(
                              group.id,
                              modifier.id,
                              group.multiSelect,
                            );
                          }}
                          className="accent-primary focus:ring-primary border-gray-300 w-3.5 h-3.5 sm:w-4 sm:h-4 cursor-pointer"
                          disabled={isDisabled}
                        />
                        <div className="flex flex-col">
                          <label
                            htmlFor={`modifier-${groupIndex}-${modifierIndex}`}
                            className="flex items-center gap-1 cursor-pointer"
                          >
                            <span className="text-base md:text-lg font-body-oo font-normal">
                              {modifier.name}
                            </span>
                            {group.pricingType ===
                            PriceTypeEnum.IndividualPrice ? (
                              <span className="text-xs sm:text-sm ml-2 font-body-oo font-medium">
                                +${modifier.price.toFixed(2)}
                              </span>
                            ) : group.pricingType ===
                              PriceTypeEnum.SamePrice ? (
                              <span className="text-xs sm:text-sm ml-2 font-body-oo font-medium">
                                +${group.price?.toFixed(2)}
                              </span>
                            ) : null}
                          </label>
                        </div>
                      </div>

                      {isSelected && group.allowMultiSelctSingleModsInGroup && (
                        <div className="flex items-center gap-1 ml-1 sm:ml-2 bg-white">
                          <button
                            onClick={() =>
                              handleModifierQuantityChange(
                                group.id,
                                modifier.id,
                                -1,
                              )
                            }
                            className="p-[1px] hover:bg-gray-100 transition-colors duration-200 rounded-full border-[1px] border-black"
                            disabled={currentQuantity <= 1}
                          >
                            <IoMdRemove size={16} />
                          </button>
                          <span className="mx-[1px] min-w-[20px] text-base text-center">
                            {currentQuantity}
                          </span>
                          <button
                            onClick={() =>
                              handleModifierQuantityChange(
                                group.id,
                                modifier.id,
                                1,
                              )
                            }
                            disabled={
                              !group.isMaxSelctSingleModsInGroupUnlimited &&
                              currentQuantity >= group.maxSelctSingleModsInGroup
                            }
                            className="p-[1px] hover:bg-gray-100 transition-colors duration-200 rounded-full border-[1px] border-black disabled:bg-gray-200 disabled:cursor-not-allowed"
                          >
                            <IoMdAdd size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                    {modifierIndex < group.modifiers.length - 1 && (
                      <hr className="border border-t border-gray-100 my-1" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        ))}

        {validationErrors.length > 0 && (
          <div ref={validationErrorRef} className="px-6 sm:px-8">
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 sm:p-4 mb-4 sm:mb-6 rounded-lg">
              <p className="text-sm sm:text-base font-semibold mb-1.5 font-subheading-oo">
                Please address the following:
              </p>
              <ul className="list-disc list-inside text-xs sm:text-sm space-y-1 font-body-oo">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="mb-4 sm:mb-6 px-6 sm:px-8">
          <label
            htmlFor="special-request"
            className="text-base sm:text-lg font-medium mb-1.5 block font-subheading"
          >
            Special Requests
          </label>
          <textarea
            id="special-request"
            value={specialRequest}
            onChange={(e) => setSpecialRequest(e.target.value)}
            maxLength={150}
            placeholder="Enter any special requests here..."
            className="w-full p-2 sm:p-3 text-sm sm:text-base font-body-oo border rounded-md focus:outline-none border-gray-400 resize-none h-20 sm:h-24"
          />
          <p className="text-sm mt-1 text-right font-body-oo">
            {specialRequest.length}/150 characters
          </p>
        </div>

        {categoryItem.upSellItems && categoryItem.upSellItems?.length > 0 && (
          <ItemOptions upsellItem={categoryItem.upSellItems} />
        )}
        <div className="h-4 sm:h-6"></div>
      </div>

      {isAvailable ? (
        <div
          className={`flex p-4 bg-white border-t sticky bottom-0 font-subheading-oo ${
            isEdit ? "justify-end items-center" : "justify-between items-center"
          }`}
        >
          {handleQuantityChange && (
            <div className="flex items-center sm:gap-2 gap-1">
              <button
                onClick={() => handleQuantityChange(-1)}
                className="sm:p-2 ml-3 p-[2px] hover:bg-gray-100 transition-colors duration-200 rounded-full border-[1px] border-black"
              >
                <FiMinus size={isMobile ? 16 : 18} />
              </button>
              <span className="mx-2 min-w-[20px] text-base lg:text-lg text-center">
                {quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(1)}
                className="sm:p-2 p-[2px] hover:bg-gray-100 transition-colors duration-200 rounded-full border-[1px] border-black"
              >
                <FiPlus size={isMobile ? 16 : 18} />
              </button>
            </div>
          )}
          <button
            onClick={handleAddToCart}
            className="bg-primary py-4 px-8 rounded-md font-semibold font-subheading-oo transition duration-300 sm:text-base shadow-md hover:shadow-lg text-sm disabled:opacity-45"
            style={{
              color: isContrastOkay(
                Env.NEXT_PUBLIC_PRIMARY_COLOR,
                Env.NEXT_PUBLIC_BACKGROUND_COLOR,
              )
                ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
                : Env.NEXT_PUBLIC_TEXT_COLOR,
            }}
            disabled={addToCartLoading}
          >
            {addToCartLoading ? (
              <>{isEdit ? `Updating item...` : `Adding item...`}</>
            ) : (
              <>
                {isEdit
                  ? `Update Cart - $${totalPrice.toFixed(2)}`
                  : `Add to Cart - $${totalPrice.toFixed(2)}`}
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="flex justify-between items-center p-4 bg-gray-50 border-t text-center">
          <span className="text-lg font-semibold w-full text-center font-heading-oo">
            Item is currently unavailable
          </span>
        </div>
      )}

      <AnimatePresence>
        {nestedSheetState && (
          <NestedModifierSheet
            key="nested-sheet"
            modifierName={nestedSheetState.modifier.name}
            nestedModifierGroups={nestedSheetState.modifier.nestedModifierGroups ?? []}
            initialSelections={
              selectedModifiers[nestedSheetState.groupId]?.find(
                (s) => s.id === nestedSheetState.modifier.id,
              )?.selectedNestedGroups ?? []
            }
            onConfirm={(confirmedSelections) => {
              const allEmpty = confirmedSelections.every(
                (gs) => gs.selectedNestedModifiers.length === 0,
              );
              if (allEmpty) {
                const isCurrentlySelected = selectedModifiers[
                  nestedSheetState.groupId
                ]?.some((s) => s.id === nestedSheetState.modifier.id);
                if (isCurrentlySelected) {
                  // Always pass true so handleModifierChange takes the filter-out
                  // path, regardless of the group's multiSelect setting
                  handleModifierChange(
                    nestedSheetState.groupId,
                    nestedSheetState.modifier.id,
                    true,
                  );
                }
              } else {
                handleNestedConfirm(
                  nestedSheetState.groupId,
                  nestedSheetState.modifier.id,
                  confirmedSelections,
                );
              }
              setNestedSheetState(null);
            }}
            onCancel={() => setNestedSheetState(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default RenderContent;
