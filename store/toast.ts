
import { create } from "zustand";

type ToastData = {
    message: string;
    type: "success" | "error" | "warning";
    title?: string;
  };

type ToastState = {
    toastData: ToastData | null;
    setToastData: (data: ToastData | null) => void;
}

const ToastStore = create<ToastState>((set) => ({
    toastData: null, // Default toast data
    setToastData: (data: ToastData | null) => set({ toastData: data }),
}));
  
  export default ToastStore;