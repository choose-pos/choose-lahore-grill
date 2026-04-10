import { create } from "zustand";

interface GiftCardState {
  paymentIntentId: string;
  paymentIntentClientSecret: string;
  isFromMenu: boolean;
  setPaymentIntent: (
    paymentIntentId: string,
    paymentIntentClientSecret: string,
    isFromMenu: boolean,
  ) => void;
  clearPaymentIntent: () => void;
}

const useGiftCardStore = create<GiftCardState>((set) => ({
  paymentIntentId: "",
  paymentIntentClientSecret: "",
  isFromMenu: false,
  setPaymentIntent: (paymentIntentId, paymentIntentClientSecret, isFromMenu) =>
    set({
      paymentIntentId,
      paymentIntentClientSecret,
      isFromMenu,
    }),
  clearPaymentIntent: () =>
    set({
      paymentIntentId: "",
      paymentIntentClientSecret: "",
      isFromMenu: false,
    }),
}));

export default useGiftCardStore;