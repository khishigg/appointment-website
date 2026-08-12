import { create } from 'zustand';

export const useMapOverlayStore = create((set) => ({
    isMapOverlayOpen: false,
    setMapOverlayOpen: (isMapOverlayOpen) => set({ isMapOverlayOpen }),
}));
