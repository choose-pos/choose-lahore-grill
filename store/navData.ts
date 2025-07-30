
import { create } from "zustand";

interface INavProps {
    name: string;
    link: string 
  
}

type NavData = {
    NavData: INavProps[] | null;
    setNavData: (data: INavProps[] | null) => void;
}

const NavDataStore = create<NavData>((set) => ({
    NavData: null, 
    setNavData: (data: INavProps[] | null) => set({ NavData: data }),
}));
  
export default NavDataStore;