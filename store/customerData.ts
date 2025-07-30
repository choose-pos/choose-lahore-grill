import {create} from "zustand";
import { CustomerDetailsInput } from "@/generated/graphql";



interface CustomerData  {
    customerData: CustomerDetailsInput | null;
    setCustomerData: (data: CustomerDetailsInput | null) => void;
}

const CustomerDataStore = create<CustomerData>((set)=>({
    customerData: null,
    setCustomerData: (data) => set({ customerData: data }),
}));

export default CustomerDataStore;