import { create } from 'zustand';

interface EngineState {
  isProcessing: boolean;
  setProcessing: (status: boolean) => void;
}

export const useEngineStore = create<EngineState>((set) => ({
  isProcessing: false,
  setProcessing: (status) => set({ isProcessing: status }),
}));
