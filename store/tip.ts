
import {create} from "zustand";


interface TipData  {
    tipData: number;
    setTipData: (data: number) => void;
}

const TipDataStore = create<TipData>((set)=>({
    tipData: 0,
    setTipData: (data) => set({ tipData: data }),
}));

export default TipDataStore;