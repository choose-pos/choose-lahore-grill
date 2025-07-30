
import {create} from "zustand";

interface CodeData {
    code: string;
    type: string;
    amount: number;
}

interface Code  {
    codeData: CodeData | null;
    setCodeData: (data: CodeData | null) => void;
}

const CodeDataStore = create<Code>((set)=>({
    codeData: null,
    setCodeData: (data) => set({ codeData: data }),
}));

export default CodeDataStore;