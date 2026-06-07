// app/context/index.tsx
"use client";

import { wagmiAdapter, projectId } from "@/config"; // 밑에 설정할 config 파일
import { createAppKit } from "@reown/appkit/react";
import { bsc, mainnet } from "@reown/appkit/networks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import React from "react";

const queryClient = new QueryClient();

createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [bsc, mainnet],
  defaultNetwork: bsc,
  // --- 수정된 부분 ---
  features: {
    email: true, // 이메일 로그인 활성화
    socials: ["google", "apple", "discord"], // 소셜 로그인 목록
    emailShowWallets: true, // 이메일 가입 시 지갑 UI 표시
  },
  // -------------------
});

export function AppKitProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
