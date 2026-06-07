// config/index.tsx
import { cookieStorage, createStorage } from "wagmi";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { bsc, mainnet } from "@reown/appkit/networks";

export const projectId = process.env.NEXT_PUBLIC_REOWN_ID as string;

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  projectId,
  networks: [bsc, mainnet],
});
