"use client";
import { Env } from "@/env";
import ToastState from "@/store/toast";
import { isContrastOkay } from "@/utils/isContrastOkay";
import { FC, useEffect } from "react";
import { createPortal } from "react-dom";

interface ToastProps {
  message: string;
  type: "success" | "error" | "warning";
  bottom?: boolean;
}

export const Toast: FC<ToastProps> = ({ message, type, bottom }) => {
  const { setToastData } = ToastState(); // Access the setToastData function from the global store
  const whiteHasGoodContrast = isContrastOkay(
    Env.NEXT_PUBLIC_PRIMARY_COLOR,
    "#ffffff"
  );
  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return {
          container: "text-white bg-primary",
          icon: "bg-transparent",
          iconPath: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              aria-hidden="true"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`w-6 h-6 lucide lucide-circle-check-icon lucide-circle-check ${
                whiteHasGoodContrast
                  ? "stroke-black fill-white"
                  : "stroke-white fill-black"
              }`}
            >
              <circle cx="12" cy="12" r="10" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          ),
        };
      case "error":
        return {
          container: "text-white bg-red-500",
          icon: "bg-white text-red-500",
          iconPath: (
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z" />
            </svg>
          ),
        };
      case "warning":
        return {
          container: "text-white bg-primary",
          icon: "bg-white text-primary",
          iconPath: (
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM10 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-4a1 1 0 0 1-2 0V6a1 1 0 0 1 2 0v5Z" />
            </svg>
          ),
        };
      default:
        return { container: "", icon: "", iconPath: null };
    }
  };

  const { container, icon, iconPath } = getTypeStyles();

  useEffect(() => {
    const timer = setTimeout(() => {
      setToastData(null); // Clear the toast after 3000 milliseconds (3 seconds)
    }, 3000);

    return () => clearTimeout(timer);
  }, [setToastData]);

  return createPortal(
    <div
      className={`fixed  right-4 flex items-center w-full max-w-xs p-4 mb-4 rounded-lg shadow ${container} ${
        bottom ? "bottom-4 sm:bottom-20" : "top-4 sm:top-20"
      }`}
      role="alert"
      style={{ zIndex: 1000 }}
    >
      <div
        className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg ${icon}`}
      >
        {iconPath}
        <span className="sr-only">
          {type === "success"
            ? "Check"
            : type === "error"
            ? "Error"
            : "Warning"}{" "}
          icon
        </span>
      </div>
      <div
        className="ms-3 text-sm font-normal"
        style={{
          color: whiteHasGoodContrast
            ? "#ffffff"
            : type === "error"
            ? "#ffffff"
            : "#000000",
        }}
      >
        {message}
      </div>
      <button
        type="button"
        className="ms-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex items-center justify-center h-8 w-8 text-white"
        aria-label="Close"
        onClick={() => setToastData(null)}
      >
        <span className="sr-only">Close</span>
        <svg
          className={`w-3 h-3  ${
            type === "success"
              ? !whiteHasGoodContrast
                ? "text-black"
                : "text-white"
              : "text-white"
          }`}
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 14 14"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
          />
        </svg>
      </button>
    </div>,
    document.body
  );
};

export default Toast;
