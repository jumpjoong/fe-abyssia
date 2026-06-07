"use client";

import { memo, useEffect, useState } from "react";
import { useGameStore } from "@/store/useGameStore";

const Gauge = memo(
  ({ startTime, duration }: { startTime: number; duration: number }) => {
    const serverTimeOffset = useGameStore(state => state.serverTimeOffset);
    const [now, setNow] = useState(() => Date.now() + serverTimeOffset);

    useEffect(() => {
      if (!startTime) {
        setNow(Date.now() + serverTimeOffset);
        return;
      }

      const update = () => {
        const current = Date.now() + serverTimeOffset;
        const passed = (current - startTime) / 1000;
        const prog = (passed / duration) * 100;

        if (prog >= 100) {
          setNow(startTime + duration * 1000);
          return false;
        }

        setNow(current);
        return true;
      };

      if (!update()) return;

      const timer = setInterval(() => {
        if (!update()) clearInterval(timer);
      }, 250);

      return () => clearInterval(timer);
    }, [startTime, duration, serverTimeOffset]);

    const passed = startTime ? Math.max(0, (now - startTime) / 1000) : 0;
    const prog = startTime ? Math.min((passed / duration) * 100, 100) : 0;

    return (
      <div className="gauge-container">
        <div className="gauge-fill" style={{ width: `${prog}%` }} />
        <span className="gauge-text">{Math.floor(prog)}%</span>
      </div>
    );
  },
);

export default Gauge;
