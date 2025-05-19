// src/store/useStringStore.ts
import { create } from "zustand";

type StringStore = {
  value: string;
  setValue: (newValue: string) => void;
};

export const useTabsListStore = create<StringStore>((set) => ({
  value: "manage_books", // initial string
  setValue: (newValue) => set({ value: newValue }),
}));
