import { create } from "zustand";

type ModalStore = {
  showMenu: boolean;
  setShowMenu: (value: boolean) => void;
  isAsap: boolean;
  setIsAsap: (value: boolean) => void;

  daysList: { value: Date; label: string }[];
  setDaysList: (data: { value: Date; label: string }[]) => void;

  timesList: string[];
  setTimesList: (data: string[]) => void;

  clickState: {
    type: "view" | "add";
    id: string;
  } | null;
  setClickState: (data: { type: "view" | "add"; id: string } | null) => void;
  loadingItem: string | null;
  setLoadingItem: (data: string | null) => void;
};

export const useModalStore = create<ModalStore>()((set) => ({
  showMenu: true,
  setShowMenu: (value) => set({ showMenu: value }),
  clickState: null,
  setClickState: (value) => set({ clickState: value }),
  loadingItem: null,
  setLoadingItem: (value) => set({ loadingItem: value }),
  isAsap: false,
  setIsAsap: (value) => set({ isAsap: value }),

  daysList: [],
  setDaysList: (value) => set({ daysList: value }),

  timesList: [],
  setTimesList: (value) => set({ timesList: value }),
}));
