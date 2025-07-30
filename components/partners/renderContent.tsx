import ItemOptions from "@/components/partners/ItemOptions";
import { Env } from "@/env";
import {
  ItemOptionsEnum,
  ItemWithModifiersResponse,
  PriceTypeEnum,
} from "@/generated/graphql";
import { isContrastOkay } from "@/utils/isContrastOkay";
import Image from "next/image";
import React, { useState } from "react";
import { FiMinus, FiPlus } from "react-icons/fi";
import { IoMdAdd, IoMdRemove } from "react-icons/io";
import spicyImage from "../../assets/spicy-solid.svg";
import Leaf from "../../assets/vegan-solid.svg";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ModifierSelection {
  id: string;
  quantity: number;
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
    isMultiSelect: boolean
  ) => void;
  handleModifierQuantityChange: (
    groupId: string,
    modifierId: string,
    delta: number
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
  const MAX_PREVIEW_LENGTH = 32;
  const MAX_PREVIEW_LENGTH_DESKTOP = 160;

  // Determine if we need to show read more/less
  const needsReadMore =
    categoryItem.desc &&
    categoryItem.desc.length >
      (isMobile ? MAX_PREVIEW_LENGTH : MAX_PREVIEW_LENGTH_DESKTOP);
  const displayedText =
    needsReadMore && !isExpanded && categoryItem.desc
      ? `${categoryItem?.desc.substring(
          0,
          isMobile ? MAX_PREVIEW_LENGTH : MAX_PREVIEW_LENGTH_DESKTOP
        )}...`
      : categoryItem.desc;

  return (
    <>
      <div className="relative">
        {categoryItem.image && (
          <div className="h-[300px] max-h-[300px] w-full relative rounded-t-[30px] md:rounded-[30px]">
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
                option.type !== ItemOptionsEnum.IsVegan
            )
            .map((option) => (
              <span
                key={option._id}
                className="font-online-ordering inline-block px-2 py-1 mr-1.5 mb-1 md:mb-0 text-xs sm:text-sm rounded-full bg-bgGray border border-textGray"
              >
                {option.displayName}
              </span>
            ))}
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
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-online-ordering">
                  {categoryItem?.name}
                </h2>
                <div className="flex items-center space-x-1 w-16">
                  {categoryItem.options.some(
                    (option) =>
                      option.type === ItemOptionsEnum.IsSpicy &&
                      option.status === true
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
                      option.status === true
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
              <p className="text-base sm:text-3xl font-semibold mb-1.5 font-online-ordering">
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
                className="text-base sm:text-lg font-semibold md:mb-1.5 block font-online-ordering"
              >
                Description
              </label>
              <p className="text-base md:text-lg sm:text-xl md:leading-relaxed font-online-ordering inline">
                {displayedText}
                {needsReadMore && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="inline-flex items-center text-primary ml-1 text-sm font-medium hover:underline align-middle"
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
                <h3 className="text-xl sm:text-2xl font-semibold font-online-ordering">
                  {group.name}
                </h3>
                <p className="text-xs sm:text-sm font-online-ordering">
                  {group.minSelections !== undefined && group.minSelections > 0
                    ? group.minSelections === group.maxSelections
                      ? `Select upto ${group.maxSelections} options`
                      : `Select ${group.minSelections} to ${group.maxSelections} options`
                    : group.maxSelections
                      ? `Select up to ${group.maxSelections} options`
                      : "Optional selections"}
                </p>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <span
                  className={`text-xs sm:text-sm px-1.5 sm:px-2 py-0.5 rounded-full font-online-ordering ${
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
                    className="text-xs sm:text-sm font-online-ordering hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2 font-online-ordering px-6 sm:px-8 bg-white py-4">
              {group.modifiers.map((modifier, modifierIndex) => {
                const isSelected = selectedModifiers[group.id]?.some(
                  (s) => s.id === modifier.id
                );
                const currentQuantity = getModifierQuantity(
                  group.id,
                  modifier.id
                );
                const isDisabled =
                  group.maxSelections === 1
                    ? false
                    : !isSelected &&
                      selectedModifiers[group.id]?.length >=
                        group.maxSelections;

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
                              group.multiSelect
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
                            <span className="text-lg md:text-xl font-medium">
                              {modifier.name}
                            </span>
                            {group.pricingType ===
                            PriceTypeEnum.IndividualPrice ? (
                              <span className="text-xs sm:text-sm ml-2 font-medium">
                                +${modifier.price.toFixed(2)}
                              </span>
                            ) : group.pricingType ===
                              PriceTypeEnum.SamePrice ? (
                              <span className="text-xs sm:text-sm ml-2 font-medium">
                                +${group.price?.toFixed(2)}
                              </span>
                            ) : null}
                            {/* {modifier.price > 0 && (
                              <span className="text-xs sm:text-sm ml-2 font-medium">
                                +${modifier.price.toFixed(2)}
                              </span>
                            )} */}
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
                                -1
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
                                1
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
                      <hr className="border-[1px] border-t border-textGray my-1" />
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
              <p className="text-sm sm:text-base font-semibold mb-1.5 font-online-ordering">
                Please address the following:
              </p>
              <ul className="list-disc list-inside text-xs sm:text-sm space-y-1 font-online-ordering">
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
            className="text-base sm:text-lg font-semibold mb-1.5 block font-online-ordering"
          >
            Special Requests
          </label>
          <textarea
            id="special-request"
            value={specialRequest}
            onChange={(e) => setSpecialRequest(e.target.value)}
            maxLength={150}
            placeholder="Enter any special requests here..."
            className="w-full font-online-ordering p-2 sm:p-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-black border-gray-400 resize-none h-20 sm:h-24"
          />
          <p className="text-sm mt-1 text-right font-online-ordering">
            {specialRequest.length}/150 characters
          </p>
        </div>

        {categoryItem.upSellItems && categoryItem.upSellItems?.length > 0 && (
          <ItemOptions upsellItem={categoryItem.upSellItems} />
        )}
      </div>

      {isAvailable ? (
        <div
          className={`flex  p-4 bg-bgGray border-t sticky bottom-0 font-online-ordering ${
            isEdit ? "justify-end items-center" : "justify-between items-center"
          }`}
        >
          {handleQuantityChange && (
            <div className="flex items-center sm:gap-2 gap-1">
              <button
                onClick={() => handleQuantityChange(-1)}
                className="sm:p-1 p-[1px] hover:bg-gray-100 transition-colors duration-200 rounded-full border-[1px] border-black"
              >
                <FiMinus className="" size={isMobile ? 16 : 18} />
              </button>
              <span className="mx-1 min-w-[20px] text-base lg:text-lg text-center">
                {quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(1)}
                className="sm:p-1 p-[1px] hover:bg-gray-100 transition-colors duration-200 rounded-full border-[1px] border-black"
              >
                <FiPlus className="" size={isMobile ? 16 : 18} />
              </button>
            </div>
          )}
          <button
            onClick={handleAddToCart}
            className="bg-primary py-3 px-6 rounded-full transition duration-300 font-semibold sm:text-base shadow-md hover:shadow-lg text-sm font-online-ordering disabled:opacity-45"
            style={{
              color: isContrastOkay(
                Env.NEXT_PUBLIC_PRIMARY_COLOR,
                Env.NEXT_PUBLIC_BACKGROUND_COLOR
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
          <span className="text-lg font-semibold w-full text-center font-online-ordering">
            Item is currently unavailable
          </span>
        </div>
      )}
    </>
  );
};

export default RenderContent;
