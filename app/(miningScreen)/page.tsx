"use client";

import { useEffect, useRef } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import "../../styles/MiningScreen.css";
import Lottie from "lottie-react";
import bubbleAnimation from "../../public/bubbles.json";
import { useGameStore } from "@/store/useGameStore";
import confetti from "canvas-confetti";
import Gauge from "@/components/Gauge";
import { useAppKit } from "@reown/appkit/react";
import { useState } from "react";

const fmtResource = (g: number): string => {
  if (g == null || isNaN(g) || g < 0) return "0g";
  if (g >= 1_000_000) return Math.floor(g / 10_000) / 100 + "t";
  if (g >= 1_000) return Math.floor(g / 10) / 100 + "kg";
  return Math.floor(g) + "g";
};

const TREASURE_DATA = [
  {
    id: 1,
    name: "Cu",
    top: "38.5%",
    left: "21.5%",
    duration: 60,
    icon: "/cu.png",
  },
  {
    id: 2,
    name: "Ni",
    top: "38.5%",
    left: "51%",
    duration: 300,
    icon: "/ni.png",
  },
  {
    id: 3,
    name: "Co",
    top: "38.5%",
    left: "79.5%",
    duration: 900,
    icon: "/co.png",
  },
  {
    id: 4,
    name: "Mn",
    top: "67%",
    left: "22%",
    duration: 1800,
    icon: "/mn.png",
  },
  {
    id: 5,
    name: "Au",
    top: "67%",
    left: "51%",
    duration: 3600,
    icon: "/au.png",
  },
  {
    id: 6,
    name: "REEs",
    top: "67%",
    left: "79.5%",
    duration: 10800,
    icon: "/rees.png",
  },
];

const RESOURCE_ICONS: Record<string, string> = {
  rees: "/rees.png",
  au: "/au.png",
  co: "/co.png",
  ni: "/ni.png",
  mn: "/mn.png",
  cu: "/cu.png",
};

const RESOURCE_LIST = [
  { key: "rees", label: "REEs" },
  { key: "au", label: "Au" },
  { key: "co", label: "Co" },
  { key: "ni", label: "Ni" },
  { key: "mn", label: "Mn" },
  { key: "cu", label: "Cu" },
];

type Resources = {
  rees: number;
  au: number;
  co: number;
  ni: number;
  mn: number;
  cu: number;
};

export default function MiningScreen() {
  const { isConnected, address } = useAppKitAccount();
  const {
    startTimes,
    setStartTimes,
    updateStartTime,
    resources,
    setResources,
    setServerTimeOffset,
    serverTimeOffset,
  } = useGameStore();

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [isLoading, setIsLoading] = useState(true);
  const [showClaimModal, setShowClaimModal] = useState({
    isOpen: false,
    name: "",
    amount: 0,
  });

  const startTimesRef = useRef(startTimes);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const setIsDataLoaded = useGameStore(state => state.setIsDataLoaded);

  const { open } = useAppKit();

  useEffect(() => {
    startTimesRef.current = startTimes;
  }, [startTimes]);

  // 로그인 처리 및 데이터 로드
  useEffect(() => {
    if (isConnected && address) {
      if (startTimes && startTimes.some(t => t > 0)) {
        setIsLoading(false);
        setIsDataLoaded(true);
        return;
      }

      setIsLoading(true);
      fetch(`${API_URL}/api/game/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: address }),
      })
        .then(res => res.json())
        .then(data => {
          // 서버 시간과 클라이언트 시간 오차 보정
          const offset = data.serverNow - Date.now();
          setServerTimeOffset(offset);
          setStartTimes(data.startTimes);
          setResources(data.resources);
          setIsLoading(false);
          requestAnimationFrame(() => {
            setIsDataLoaded(true);
          });
        })
        .catch(() => {
          setIsLoading(false);
          setIsDataLoaded(true);
        });
    } else {
      setStartTimes([]);
      setResources({ rees: 0, au: 0, co: 0, ni: 0, mn: 0, cu: 0 });
      setServerTimeOffset(0);
      setIsLoading(false);
      setIsDataLoaded(true);
    }
  }, [isConnected, address, setStartTimes, setResources, setServerTimeOffset]);

  // 브라우저 닫기/새로고침 시 sendBeacon
  useEffect(() => {
    if (!isConnected || !address) return;

    const handleBeforeUnload = () => {
      const now = Date.now();
      const progresses = TREASURE_DATA.map((item, index) => {
        const sTime = startTimesRef.current[index];
        if (!sTime) return 0;
        const passed = (now - sTime) / 1000;
        return Math.min((passed / item.duration) * 100, 100);
      });

      navigator.sendBeacon(
        `${API_URL}/api/game/stop`,
        new Blob(
          [JSON.stringify({ wallet: address, lastProgresses: progresses })],
          { type: "application/json" },
        ),
      );
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isConnected, address]);

  // 폭죽 이벤트
  const triggerJackpotEffect = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const myConfetti = confetti.create(canvas, {
      resize: true,
      useWorker: false,
    });
    const duration = 2.5 * 1000;
    const animationEnd = Date.now() + duration;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        clearInterval(interval);
        myConfetti.reset();
        return;
      }
      myConfetti({
        startVelocity: 45,
        spread: 360,
        ticks: 100,
        gravity: 1.2,
        zIndex: 1000,
        shapes: ["circle"],
        scalar: 1.2,
        particleCount: 50 * (timeLeft / duration),
        origin: { x: Math.random() * 0.4 + 0.3, y: Math.random() * 0.2 + 0.4 },
        colors: ["#FFE400", "#FFBD00", "#00d2ff", "#ffffff", "#FDFFB8"],
      });
    }, 250);
  };

  const handleReward = async (idx: number) => {
    if (!isConnected) return alert("Please log in first!");

    const sTime = startTimes[idx];
    if (sTime) {
      const serverNow = Date.now() + serverTimeOffset;
      const passed = (serverNow - sTime) / 1000;
      const prog = (passed / TREASURE_DATA[idx].duration) * 100;
      if (prog < 100) return alert("Mining...");
    }

    try {
      const res = await fetch(`${API_URL}/api/game/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: address, boxIndex: idx }),
      });

      const data = await res.json();
      if (!res.ok) return alert(data.message || "Failed to claim reward!");

      setShowClaimModal({
        isOpen: true,
        name: data.reward.type,
        amount: data.reward.amount,
      });
      triggerJackpotEffect();
      setResources(data.resources);
      updateStartTime(idx, data.nextStartTime);
    } catch {
      alert("Failed to connect to server");
    }
  };

  const resourceIcon =
    TREASURE_DATA.find(t => t.name === showClaimModal.name)?.icon ?? "";

  if (isConnected && isLoading) {
    return <div className="loading-screen">Syncing data...</div>;
  }

  return (
    <div className="mining-container" style={{ position: "relative" }}>
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 1000,
        }}
      />

      <div className="header-auth">
        <div className="resource-bar">
          {RESOURCE_LIST.map(({ key, label }) => (
            <span key={key} className="resource-item">
              <img
                src={RESOURCE_ICONS[key]}
                alt={label}
                className="resource-icon"
              />
              <span className="resource-label">{label}:</span>
              <span className="resource-value">
                {fmtResource(resources[key as keyof Resources])}
              </span>
            </span>
          ))}
        </div>
        <button className="wallet-btn" onClick={() => open()}>
          {isConnected ? "My Wallet" : "Connect Wallet"}
        </button>
      </div>

      <img src="/deep-sea-final.png" className="bg-image" alt="background" />
      <Lottie
        animationData={bubbleAnimation}
        loop={true}
        autoplay={true}
        className="full-screen-bubbles"
      />

      <div className="content">
        {TREASURE_DATA.map((item, index) => (
          <div
            key={item.id}
            className="treasure-spot"
            onClick={() => handleReward(index)}
            style={{ top: item.top, left: item.left }}
          >
            <Gauge startTime={startTimes[index]} duration={item.duration} />
          </div>
        ))}
      </div>

      {showClaimModal.isOpen && (
        <div className="claim-modal-overlay">
          <div className="claim-modal">
            <h2>Congratulations!</h2>
            <p
              style={{
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                lineHeight: 1,
              }}
            >
              Claimed {showClaimModal.amount}g
              <img
                src={resourceIcon}
                width={20}
                height={20}
                alt={showClaimModal.name}
                style={{ display: "block" }}
              />
              {showClaimModal.name}!
            </p>
            <button
              onClick={() =>
                setShowClaimModal({ ...showClaimModal, isOpen: false })
              }
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
