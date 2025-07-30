
import { PromoDiscountType } from "@/generated/graphql";
import {create} from "zustand";

export interface PromoCode {
    code: string;
    type: string;
    promoCodeDiscountType?: PromoDiscountType;
    uptoAmount?:number | null;
    discountValue?: number | null;
    discountItem?:{
        name?: string;
        price?: number;
        image?: string | null;
    }
}

interface Promo {
    promo: PromoCode | null;
    setPromo: (data: PromoCode | null) => void;
}

const PromoCodeStore = create<Promo>((set)=>({
    promo: null,
    setPromo: (data) => set({ promo: data }),
}));

export default PromoCodeStore;