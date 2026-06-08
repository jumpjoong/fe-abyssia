"use client";

import { useState } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import { useGameStore } from "@/store/useGameStore";
import { useBalance } from "wagmi";
import "../../styles/ShopScreen.css";

const RESOURCE_CONFIG = [
  { key: "rees", label: "REEs", icon: "/rees.png", ratio: 3, step: 3 },
  { key: "au", label: "Gold (Au)", icon: "/au.png", ratio: 5, step: 5 },
  { key: "co", label: "Cobalt (Co)", icon: "/co.png", ratio: 15, step: 15 },
  { key: "ni", label: "Nickel (Ni)", icon: "/ni.png", ratio: 15, step: 15 },
  { key: "mn", label: "Manganese (Mn)", icon: "/mn.png", ratio: 15, step: 15 },
  { key: "cu", label: "Copper (Cu)", icon: "/cu.png", ratio: 15, step: 15 },
] as const;

const MIN_EXCHANGE_TOKENS = 10000;

const fmt = (n: number) => n.toLocaleString();

type ResourceKey = "rees" | "au" | "co" | "ni" | "mn" | "cu";
type Resources = Record<ResourceKey, number>;

//어차피 abs 컨트랙트는 공유되서 환경변수로 설정x
const ABS_TOKEN_ADDRESS = "0xd33116b843C6Df745d923BF3C7351c2BC8CF1dB9" as const;

export default function ShopScreen() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const { isConnected, address } = useAppKitAccount();
  const { resources } = useGameStore();

  //abs 토큰 정보
  const { data: absBalance, refetch } = useBalance({
    address: address as `0x${string}`,
    token: ABS_TOKEN_ADDRESS,
  });

  //각 자원 선택 여부
  const [selected, setSelected] = useState<Record<ResourceKey, boolean>>({
    rees: false,
    au: false,
    co: false,
    ni: false,
    mn: false,
    cu: false,
  });

  //슬라이더
  const [amounts, setAmounts] = useState<Resources>({
    rees: 0,
    au: 0,
    co: 0,
    ni: 0,
    mn: 0,
    cu: 0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    visible: boolean;
    hiding: boolean;
    amount: number;
  }>({ visible: false, hiding: false, amount: 0 });

  const toggleCard = (key: ResourceKey) => {
    setSelected(prev => {
      const next = { ...prev, [key]: !prev[key] };
      if (!next[key]) setAmounts(a => ({ ...a, [key]: 0 }));
      return next;
    });
  };

  const showToast = (amount: number) => {
    setToast({ visible: true, hiding: false, amount });
    setTimeout(() => {
      setToast(prev => ({ ...prev, hiding: true }));
      setTimeout(
        () => setToast({ visible: false, hiding: false, amount: 0 }),
        400,
      );
    }, 2000);
  };

  const handleSlider = (key: ResourceKey, val: number) => {
    setAmounts(prev => ({ ...prev, [key]: val }));
  };

  const handleMax = (key: ResourceKey) => {
    const cfg = RESOURCE_CONFIG.find(r => r.key === key)!;
    const max = Math.floor(resources[key] / cfg.ratio) * cfg.ratio;
    setAmounts(prev => ({ ...prev, [key]: max }));
  };

  const totalTokens = RESOURCE_CONFIG.reduce((sum, cfg) => {
    if (!selected[cfg.key]) return sum;
    return sum + Math.floor(amounts[cfg.key] / cfg.ratio);
  }, 0);

  const selectedCount = Object.values(selected).filter(Boolean).length;

  const handleExchange = async () => {
    if (!isConnected || totalTokens === 0) return;

    setIsLoading(true);

    try {
      const payload = RESOURCE_CONFIG.filter(
        cfg => selected[cfg.key] && amounts[cfg.key] > 0,
      ).map(cfg => ({ resource: cfg.key, amount: amounts[cfg.key] }));

      const res = await fetch(`${API_URL}/api/game/exchange`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: address, resources: payload }),
      });

      const data = await res.json();

      if (res.ok) {
        //토큰 교환 후 잔액 반영
        refetch();
        showToast(totalTokens);
        setResult(`${fmt(totalTokens)} ABYSSIA exchanged successfully!`);
        //토큰 선택 전부 해제
        setSelected({
          rees: false,
          au: false,
          co: false,
          ni: false,
          mn: false,
          cu: false,
        });
        //슬라이더 0으로 설정
        setAmounts({ au: 0, rees: 0, co: 0, ni: 0, mn: 0, cu: 0 });
      } else {
        setResult(data.message || "Exchange failed");
      }
    } catch {
      setResult("Server connection failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="shop-container">
      {toast.visible && (
        <div className="toast-overlay">
          <div className={`toast-card ${toast.hiding ? "hide" : ""}`}>
            <svg className="toast-check" viewBox="0 0 52 52">
              <circle cx="26" cy="26" r="23" />
              <path d="M14 27 L22 35 L38 19" />
            </svg>
            <div className="toast-title">Exchange Complete!</div>
            <div className="toast-amount">+{fmt(toast.amount)} ABYSSIA</div>
          </div>
        </div>
      )}

      <div className="shop-header">
        <h2>Resource Exchange</h2>
        <p>Select resources to exchange for ABYSSIA tokens</p>
      </div>

      <div className="abs-balance-card">
        <div className="abs-balance-left">
          <div className="abs-balance-icon">
            <img src="/abs-logo.svg" alt="ABS" width="100%" height="100%" />
          </div>
          <div>
            <p className="abs-balance-label">My ABS Balance</p>
            <p className="abs-balance-value">
              {absBalance
                ? (
                    Math.floor(Number(absBalance.formatted) * 10000) / 10000
                  ).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 4,
                  })
                : "0.00"}
              <span className="abs-balance-symbol">ABS</span>
            </p>
          </div>
        </div>
      </div>

      <div className="shop-body">
        <div className="resource-grid">
          {RESOURCE_CONFIG.map(cfg => {
            const key = cfg.key as ResourceKey;
            const isSelected = selected[key];
            const tokens = Math.floor(amounts[key] / cfg.ratio);
            const maxAmt = resources[key];

            return (
              <div
                key={key}
                className={`resource-card ${isSelected ? "selected" : ""}`}
                onClick={() => toggleCard(key)}
              >
                <div className="rc-top">
                  <div className="rc-name">
                    <img src={cfg.icon} alt={cfg.label} className="rc-icon" />
                    <span>{cfg.label}</span>
                  </div>
                  <div className={`rc-check ${isSelected ? "on" : ""}`}>
                    {isSelected && (
                      <svg width="10" height="10" viewBox="0 0 10 10">
                        <polyline
                          points="1.5,5 4,7.5 8.5,2.5"
                          fill="none"
                          stroke="#fff"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                </div>

                <div className="rc-hold">Available: {fmt(maxAmt)}g</div>

                <div className="rc-bar-bg">
                  <div
                    className="rc-bar-fill"
                    style={{
                      width:
                        maxAmt > 0 ? `${(amounts[key] / maxAmt) * 100}%` : "0%",
                    }}
                  />
                </div>

                <div className="rc-bottom">
                  <span className="rc-token">
                    {fmt(tokens)} Token{tokens !== 1 ? "s" : ""}
                  </span>
                  <span className="rc-ratio">{cfg.ratio} = 1 ABYSSIA</span>
                </div>

                {isSelected && (
                  <div
                    className="rc-slider-wrap"
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="rc-slider-row">
                      <input
                        type="range"
                        min={0}
                        max={maxAmt}
                        step={cfg.step}
                        value={amounts[key]}
                        onChange={e =>
                          handleSlider(key, Number(e.target.value))
                        }
                        className="rc-slider"
                      />
                      <span className="rc-val">{fmt(amounts[key])}</span>
                    </div>
                    <button
                      className="rc-max-btn"
                      onClick={e => {
                        e.stopPropagation();
                        handleMax(key);
                      }}
                    >
                      MAX
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="shop-summary">
          <div className="summary-row">
            <span>Selected Resources</span>
            <span>
              {selectedCount} type{selectedCount !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="summary-row bold">
            <span>Total Estimated Tokens</span>
            <span>{fmt(totalTokens)} ABYSSIA</span>
          </div>
        </div>

        {totalTokens > 0 && totalTokens < MIN_EXCHANGE_TOKENS && (
          <div className="min-token-notice">
            ⚠️ Minimum {fmt(MIN_EXCHANGE_TOKENS)} ABYSSIA required to exchange.
            Currently {fmt(totalTokens)} ABYSSIA selected.
          </div>
        )}

        <button
          className="exchange-btn"
          disabled={totalTokens < MIN_EXCHANGE_TOKENS || isLoading}
          onClick={handleExchange}
        >
          {isLoading
            ? "Processing..."
            : totalTokens >= MIN_EXCHANGE_TOKENS
              ? `Exchange ${fmt(totalTokens)} ABYSSIA`
              : `Minimum ${fmt(MIN_EXCHANGE_TOKENS)} ABYSSIA required`}
        </button>

        {result && <div className="exchange-result">{result}</div>}

        <div className="exchange-guide">
          <div className="guide-title">Exchange Guide</div>
          <ul className="guide-list">
            <li>
              Resources can only be exchanged in multiples of the exchange ratio
            </li>
            <li>Exchanged resources cannot be recovered</li>
            <li>Tokens will be automatically sent to your connected wallet</li>
          </ul>

          <div className="guide-ratio-title">Exchange Rate</div>
          <div className="ratio-table">
            {RESOURCE_CONFIG.map(cfg => (
              <div className="ratio-row" key={cfg.key}>
                <div className="ratio-left">
                  <img src={cfg.icon} alt={cfg.label} className="ratio-icon" />
                  <span className="ratio-label">{cfg.label}</span>
                </div>
                <div className="ratio-right">
                  <span className="ratio-amount">{cfg.ratio}g</span>
                  <span className="ratio-arrow">→</span>
                  <span className="ratio-token">1 ABYSSIA</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
