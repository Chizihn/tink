import { getDefaultWallets, getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  argentWallet,
  trustWallet,
  ledgerWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { avalanche, avalancheFuji } from "wagmi/chains";
import "@rainbow-me/rainbowkit/styles.css";

const { wallets } = getDefaultWallets();

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set");
}

export const config = getDefaultConfig({
  appName: "Tink Protocol",
  projectId,
  wallets: [
    ...wallets,
    {
      groupName: "Other",
      wallets: [argentWallet, trustWallet, ledgerWallet],
    },
  ],
  chains: [avalancheFuji, avalanche],
  ssr: false,
});
