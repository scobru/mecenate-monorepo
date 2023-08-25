import { createContext } from "react";
import create from "zustand";

/**
 * Zustand Store
 *
 * You can add global state to the app using this AppStore, to get & set
 * values from anywhere in the app.
 *
 * Think about it as a global useState.
 */

type TAppStore = {
  ethPrice: number;
  setEthPrice: (newEthPriceState: number) => void;
  sismoResponse: any;
  setSismoResponse: (newSismoResponse: any) => void;
  sismoData: any;
  setSismoData: (newSismoData: any) => void;
};

export const useAppStore = create<TAppStore>(set => ({
  ethPrice: 0,
  setEthPrice: (newValue: number): void => set(() => ({ ethPrice: newValue })),
  sismoResponse: [],
  setSismoResponse: (newValue: any): void => set(() => ({ sismoResponse: newValue })),
  sismoData: [],
  setSismoData: (newValue: any): void => set(() => ({ sismoData: newValue })),
}));
