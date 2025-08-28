"use client";

import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  button: {
    text: string;
    url: string;
  };
  image: {
    desktop: string;
    mobile?: string;
  };
  isVerticallyAligned?: boolean;
}

const backdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { y: "100%", opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
  exit: {
    y: "100%",
    opacity: 0,
    transition: { duration: 0.3, ease: "easeIn" },
  },
};

const PromoModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  button,
  image,
  isVerticallyAligned = true,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
          variants={backdrop}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
        >
          {/* Modal box with increased height */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl bg-white shadow-lg overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition shadow-sm"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            {/* Content layout */}
            {isVerticallyAligned ? (
              <div className="flex flex-col h-full">
                {image && (
                  <div className="relative h-60 md:h-80">
                    {/* Desktop Image */}
                    <Image
                      src={image.desktop}
                      alt={title}
                      fill
                      className="object-cover hidden sm:block"
                    />
                    {/* Mobile Image - fallback to desktop if mobile not provided */}
                    <Image
                      src={image.mobile || image.desktop}
                      alt={title}
                      fill
                      className="object-cover block sm:hidden"
                    />
                  </div>
                )}
                <div className="p-4 md:p-8 flex-1 overflow-y-auto">
                  <h2 className="text-3xl md:text-4xl font-secondary mb-4">
                    {title}
                  </h2>
                  <p className="text-gray-600 mb-6 text-sm md:text-lg font-primary leading-relaxed">
                    {description}
                  </p>
                  <Link
                    href={decodeURI(button.url)}
                    {...(button.url?.startsWith("http")
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    onClick={onClose}
                    className={`md:px-6 px-4 py-3 border-2 border-bg3 mt-5 uppercase bg-bg1 font-primary font-medium rounded-[10px] text-bg3 transition-opacity duration-500`}
                  >
                    {button.text}
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row h-full min-h-[500px]">
                {image && (
                  <div className="relative w-full md:w-[55%] h-52 md:h-auto">
                    {/* Desktop Image */}
                    <Image
                      src={image.desktop}
                      alt={title}
                      fill
                      className="object-cover hidden sm:block"
                    />
                    {/* Mobile Image - fallback to desktop if mobile not provided */}
                    <Image
                      src={image.mobile || image.desktop}
                      alt={title}
                      fill
                      className="object-cover block sm:hidden"
                    />
                  </div>
                )}
                <div className="p-4 md:p-6 flex flex-col justify-center items-start md:w-1/2 flex-1">
                  <h2 className="text-3xl font-secondary md:text-4xl  mb-4">
                    {title}
                  </h2>
                  <p className="text-gray-600 mb-6 text-sm font-primary md:text-base leading-relaxed">
                    {description}
                  </p>
                  <Link
                    href={decodeURI(button.url)}
                    {...(button.url?.startsWith("http")
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    onClick={onClose}
                    className={`md:px-6 px-4 py-2 border-2 border-bg3 mt-5 uppercase bg-bg1 font-primary font-medium rounded-[10px] text-bg3 transition-opacity duration-500`}
                  >
                    {button.text}
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PromoModal;
