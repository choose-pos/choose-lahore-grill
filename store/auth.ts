
import { create } from "zustand";
import { Customer } from "@/generated/graphql";

type AuthState = {
    AuthData: Customer | null;
    setAuthData: (data: Customer | null) => void;
}

const AuthStore = create<AuthState>((set) => ({
    AuthData: null, // Default toast data
    setAuthData: (data: Customer | null) => set({ AuthData: data }),
}));
  
  export default AuthStore;