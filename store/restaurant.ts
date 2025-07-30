import { CustomerRestaurant } from "@/utils/types";
import { create } from "zustand";

interface RestaurantDetails {
  restaurantData: CustomerRestaurant | null;
  setRestaurantData: (data: CustomerRestaurant | null) => void;

  selectedItem: string | null;
  setSelectedItem: (item: string | null) => void;

  selectedCategoryId: string | null;
  setSelectedCategoryId: (item: string | null) => void;
}

const RestaurantStore = create<RestaurantDetails>((set) => ({
  restaurantData: null,
  setRestaurantData: (data) => set({ restaurantData: data }),

  selectedItem: null,
  setSelectedItem: (item) => set({ selectedItem: item }),

  selectedCategoryId: null,
  setSelectedCategoryId: (category) => set({ selectedCategoryId: category }),
}));

export default RestaurantStore;
