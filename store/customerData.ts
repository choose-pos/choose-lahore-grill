import { create } from "zustand";
import { CustomerDetailsInput } from "@/generated/graphql";

interface CustomerData {
  customerData: CustomerDetailsInput | null;
  setCustomerData: (data: CustomerDetailsInput | null) => void;
  signUpToggle: boolean;
  setSignUpToggle: (value: boolean) => void;
}

const CustomerDataStore = create<CustomerData>((set) => ({
  customerData: null,
  setCustomerData: (data) => set({ customerData: data }),
  signUpToggle: true,
  setSignUpToggle: (value) => set({ signUpToggle: value }),
}));

export default CustomerDataStore;