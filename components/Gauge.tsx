"use client";

import { memo, useEffect, useState } from "react";

const Gauge = memo(
  ({ startTime, duration }: { startTime: number; duration: number }) => {
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
      // 🔥 로그아웃 등으로 startTime이 없어지면 now를 리셋하고 종료!
      if (!startTime) {
        setNow(Date.now());
        return;
      }

      const update = () => {
        const current = Date.now();
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
    }, [startTime, duration]); // startTime이 null이나 0이 되면 이 effect가 다시 실행됩니다.

    // 렌더링 시점에서 한 번 더 방어
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
