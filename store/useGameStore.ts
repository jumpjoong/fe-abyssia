import { create } from "zustand";

type Resources = {
  rees: number;
  au: number;
  co: number;
  ni: number;
  mn: number;
  cu: number;
};

interface GameState {
  startTimes: number[];
  resources: Resources;
  setStartTimes: (times: number[]) => void;
  updateStartTime: (idx: number, time: number) => void;
  setResources: (resources: Resources) => void;
  isDataLoaded: boolean;
  setIsDataLoaded: (loaded: boolean) => void;
  serverTimeOffset: number;
  setServerTimeOffset: (offset: number) => void;
}

export const useGameStore = create<GameState>(set => ({
  startTimes: Array(6).fill(0),
  resources: { rees: 0, au: 0, co: 0, ni: 0, mn: 0, cu: 0 },
  isDataLoaded: false,
  serverTimeOffset: 0,

  setStartTimes: times => set({ startTimes: times }),

  updateStartTime: (idx, time) =>
    set(state => {
      const newStartTimes = [...state.startTimes];
      newStartTimes[idx] = time;
      return { startTimes: newStartTimes };
    }),

  setResources: resources => set({ resources }),

  setIsDataLoaded: loaded => set({ isDataLoaded: loaded }),

  setServerTimeOffset: offset => set({ serverTimeOffset: offset }),
}));
