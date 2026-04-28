import { create } from "zustand";

interface SidebarStore {
  isSignInOpen: boolean;
  isCartOpen: boolean;
  isSignUpOpen: boolean;
  isMenuOpen: boolean;
  redirectAfterAuth: string | null;
  setSignInOpen: (isOpen: boolean) => void;
  setCartOpen: (isOpen: boolean) => void;
  setIsSignUpOpen: (isOpen: boolean) => void;
  setIsMenuOpen: (isOpen: boolean) => void;
  setRedirectAfterAuth: (url: string | null) => void;
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  isSignInOpen: false,
  isCartOpen: false,
  isSignUpOpen: false,
  isMenuOpen: false,
  redirectAfterAuth: null,
  setSignInOpen: (isOpen) => set({ isSignInOpen: isOpen }),
  setCartOpen: (isOpen) => set({ isCartOpen: isOpen }),
  setIsSignUpOpen: (isOpen) => set({ isSignUpOpen: isOpen }),
  setIsMenuOpen: (isOpen) => set({ isMenuOpen: isOpen }),
  setRedirectAfterAuth: (url) => set({ redirectAfterAuth: url }),
}));
