import { Env } from "@/env";
import { ItemOptionsEnum } from "@/generated/graphql";
import { isContrastOkay } from "@/utils/isContrastOkay";
import React, { useEffect, useRef, useState } from "react";
import { FiFilter, FiX } from "react-icons/fi";

interface FilterDropdownProps {
  selectedCategories: ItemOptionsEnum[] | null;
  handleCheckboxChange: (option: ItemOptionsEnum) => void;
  onClearAll: () => void;
}

const formatItemOptionEnum = (value: ItemOptionsEnum) => {
  switch (value) {
    // case ItemOptionsEnum.HasNuts:
    //   return "No Nuts";
    case ItemOptionsEnum.PopularItem:
      return "Popular Item";
    case ItemOptionsEnum.IsGlutenFree:
      return "Gluten Free";
    case ItemOptionsEnum.IsHalal:
      return "Halal";
    case ItemOptionsEnum.IsSpicy:
      return "Spicy";
    case ItemOptionsEnum.IsVegan:
      return "Vegan";
    case ItemOptionsEnum.ContainsDairy:
      return "Dairy Free";
    case ItemOptionsEnum.HasNuts:
      return "Nuts Free";
    default:
      return "";
  }
};

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  selectedCategories,
  handleCheckboxChange,
  onClearAll,
}) => {
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  // const [filteredOptions, setFilteredOptions] = useState<
  //   { value: ItemOptionsEnum; label: string }[]
  // >(
  // );
  const filteredOptions = Object.values(ItemOptionsEnum)
    .filter((option) => ![ItemOptionsEnum.UpSellItem].includes(option))
    .map((e) => ({ value: e, label: formatItemOptionEnum(e) }))
    .sort((a, b) => a.label.localeCompare(b.label));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative ml-2 w-max" ref={dropdownRef}>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-[40px] border border-gray-300 transition-all duration-200 ${
            selectedCategories && selectedCategories?.length > 0
              ? `w-auto`
              : `w-full`
          }`}
          type="button"
        >
          <FiFilter className="text-gray-600" />
          <span className="font-medium font-online-ordering">Filter</span>
          {selectedCategories && selectedCategories.length > 0 && (
            <span
              className="ml-2 bg-primary text-white text-xs px-2 py-0.5 rounded-full"
              style={{
                color: isContrastOkay(
                  Env.NEXT_PUBLIC_PRIMARY_COLOR,
                  Env.NEXT_PUBLIC_BACKGROUND_COLOR
                )
                  ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
                  : Env.NEXT_PUBLIC_TEXT_COLOR,
              }}
            >
              {selectedCategories.length}
            </span>
          )}
        </button>

        {selectedCategories && selectedCategories.length > 0 && (
          <button
            onClick={onClearAll}
            className="px-2 py-2 text-sm text-gray-600 transition-colors whitespace-nowrap"
            type="button"
          >
            Clear All
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-50 border border-gray-200">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900 font-online-ordering">
                Filters
              </h3>
              <button
                onClick={() => setShowDropdown(false)}
                className="text-black"
                type="button"
              >
                <FiX />
              </button>
            </div>

            <div className="space-y-2">
              {filteredOptions.map((option) => (
                <label
                  key={option.label}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer group"
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={
                        selectedCategories?.includes(option.value) || false
                      }
                      onChange={() => handleCheckboxChange(option.value)}
                      className="w-5 h-5 border-2 border-gray-300 rounded focus:ring-primary focus:ring-offset-0
                      accent-primary
                      "
                    />
                    <span className="ml-3 text-gray-700 font-medium transition-colors">
                      {option.label}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;
