"use client";

import { useState, useEffect } from "react";
import MiningScreen from "./(miningScreen)/page";
import ShopScreen from "./shopScreen/page";
import { useGameStore } from "@/store/useGameStore";
import "../styles/main.css";

export default function App() {
  const [currentTab, setCurrentTab] = useState("HOME");
  const [showIntro, setShowIntro] = useState(true);
  const [isFading, setIsFading] = useState(false);

  const isDataLoaded = useGameStore(state => state.isDataLoaded);

  // 유저가 인트로 화면을 클릭(터치)했을 때 실행되는 함수
  const handleEnterGame = () => {
    // 백엔드 데이터가 모바일 뒤편에 완벽히 로드되어 그리기까지 끝났을 때만 입장 허용
    if (!isDataLoaded) return;

    setIsFading(true);

    // 0.5초 페이드아웃 애니메이션 후 인트로 컴포넌트 완전 제거
    setTimeout(() => {
      localStorage.setItem("abyssia_visited", "true");
      setShowIntro(false);
    }, 500);
  };

  return (
    <div className="root">
      {/* 1. 뒤편 게임 본체: 데이터가 오면 알아서 미리 완벽하게 화면을 그려두고 대기함 */}
      <div className="game-container">
        <div className="game-board">
          {currentTab === "HOME" ? <MiningScreen /> : <ShopScreen />}
        </div>
        <div className="tab-bar">
          <div
            className={`tab-item ${currentTab === "HOME" ? "active" : ""}`}
            onClick={() => setCurrentTab("HOME")}
          >
            ⛏️ Mining
          </div>
          <div className="tab-divider" />
          <div
            className={`tab-item ${currentTab === "SHOP" ? "active" : ""}`}
            onClick={() => setCurrentTab("SHOP")}
          >
            🛒 Resource Shop
          </div>
        </div>
      </div>

      {/* 클릭 입장 인트로 */}
      {showIntro && (
        <div
          onClick={handleEnterGame} // 👈 화면 아무 데나 누르면 입장 시도
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100dvh",
            zIndex: 9999,
            background: "#000",
            cursor: isDataLoaded ? "pointer" : "wait",
            opacity: isFading ? 0 : 1,
            transition: "opacity 0.5s ease-in-out",
            pointerEvents: isFading ? "none" : "auto",
          }}
        >
          {/*  인트로  */}
          <video
            src="/intro.mp4"
            autoPlay
            muted
            playsInline
            loop
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
            ref={el => {
              if (el) {
                el.muted = true; // ← React muted 버그 우회
                el.play().catch(() => {}); // ← 자동재생 실패 시 에러 무시
              }
            }}
          />

          {/* 💡 유저 유도용 "CLICK TO ENTER" 텍스트 배너 안내 레이어 */}
          <div
            style={{
              position: "absolute",
              bottom: "10%",
              left: "50%",
              transform: "translateX(-50%)",
              color: isDataLoaded ? "#00FFC5" : "#64748b", // 데이터 로드 완료 시 네온 컬러 활성화
              fontSize: "1.2rem",
              fontWeight: "bold",
              letterSpacing: "4px",
              textAlign: "center",
              textShadow: isDataLoaded
                ? "0 0 10px rgba(0,255,197,0.6)"
                : "none",
              animation: isDataLoaded ? "pulse 1.5s infinite" : "none",
            }}
          >
            {isDataLoaded ? "▶ CLICK TO ENTER ◀" : "LOADING DATA..."}
          </div>
        </div>
      )}
    </div>
  );
}
