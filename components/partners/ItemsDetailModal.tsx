import { Env } from "@/env";
import { isContrastOkay } from "@/utils/isContrastOkay";
import React from "react";
import { IoMdClose } from "react-icons/io";

interface ItemDetailsModalProps {
  item: {
    name: string;
    desc: string;
    price: number;
    modifierGroups?: Array<{ name: string }>;
  } | null;
  onClose: () => void;
}

const ItemDetailsModal: React.FC<ItemDetailsModalProps> = ({
  item,
  onClose,
}) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="relative">
          <img
            src="/api/placeholder/400/200"
            alt="Item"
            className="w-full h-48 object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-1"
          >
            <IoMdClose size={24} />
          </button>
        </div>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2">{item.name}</h2>
          <p className="text-gray-600 mb-4">{item.desc}</p>
          <p className="text-xl font-semibold ">${item.price.toFixed(2)}</p>
          {item.modifierGroups && item.modifierGroups.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Modifiers</h3>
              <ul className="list-disc list-inside">
                {item.modifierGroups.map((group, index) => (
                  <li key={index}>{group.name}</li>
                ))}
              </ul>
            </div>
          )}
          <button
            className="mt-6 w-full bg-primary py-2 rounded-lg hover:bg-primary-dark transition duration-300"
            style={{
              color: isContrastOkay(
                Env.NEXT_PUBLIC_PRIMARY_COLOR,
                Env.NEXT_PUBLIC_BACKGROUND_COLOR
              )
                ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
                : Env.NEXT_PUBLIC_TEXT_COLOR,
            }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailsModal;
