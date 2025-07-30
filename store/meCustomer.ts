import { Customer } from "@/generated/graphql";
import { create } from "zustand";

export type CustomerNew = Omit<Customer, "loyaltyWallet"> & {
  loyaltyWallet?: {
    balance: number;
  } | null;
};

interface CustomerData {
  meCustomerData: CustomerNew | null;
  setMeCustomerData: (data: CustomerNew | null) => void;
}

const meCustomerStore = create<CustomerData>((set) => ({
  meCustomerData: null,
  setMeCustomerData: (data) => set({ meCustomerData: data }),
}));

export default meCustomerStore;
