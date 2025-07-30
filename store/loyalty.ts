import { create } from "zustand";
import { DiscountInput, LoyaltyRedeemType } from "@/generated/graphql";

export type offer = {
  type: LoyaltyRedeemType;
  pointsRequired: number;
  discountType?: "FixedAmount" | "Percentage";
  discountValue?: number;
  uptoAmount?: number | null;
  name: string;
};

type LoyaltyState = {
  programName: string | null;
  setProgramName: (data: string | null) => void;
  earnPoints: number | null;
  setEarnPoints: (data: number | null) => void;
  customerBalance: number | null;
  setCustomerBalance: (data: number | null) => void;
  redeemState: DiscountInput | null;
  setRedeemState: (data: DiscountInput | null) => void;
  offerSelected: offer | null;
  setOfferSelected: (data: offer | null) => void;
};

const LoyaltyStore = create<LoyaltyState>((set) => ({
  programName: null, // Default toast data
  setProgramName: (data: string | null) => set({ programName: data }),
  earnPoints: null, // Default toast data
  setEarnPoints: (data: number | null) => set({ earnPoints: data }),
  customerBalance: null, // Default toast data
  setCustomerBalance: (data: number | null) => set({ customerBalance: data }),
  redeemState: null,
  setRedeemState: (data: DiscountInput | null) => set({ redeemState: data }),
  offerSelected: null,
  setOfferSelected: (data: offer | null) => set({ offerSelected: data }),
}));

export default LoyaltyStore;
