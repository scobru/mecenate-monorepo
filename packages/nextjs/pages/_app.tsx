import "~~/styles/globals.css";
import "~~/styles/carousel.css";

import type { AppProps } from "next/app";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiConfig } from "wagmi";
import { Toaster } from "react-hot-toast";
import "@rainbow-me/rainbowkit/styles.css";
import { appChains } from "~~/services/web3/wagmiConnectors";
import { wagmiClient } from "~~/services/web3/wagmiClient";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import Header from "~~/components/Header";
import Footer from "~~/components/Footer";
import { useEffect } from "react";
import { useAppStore } from "~~/services/store/store";
import { useEthPrice } from "~~/hooks/scaffold-eth";
import NextNProgress from "nextjs-progressbar";
import "url-polyfill";
import { Analytics } from "@vercel/analytics/react";

const ScaffoldEthApp = ({ Component, pageProps }: AppProps) => {
  const price = useEthPrice();
  const setEthPrice = useAppStore(state => state.setEthPrice);

  useEffect(() => {
    if (price > 0) {
      setEthPrice(price);
    }
  }, [setEthPrice, price]);

  return (
    <WagmiConfig client={wagmiClient}>
      <NextNProgress />
      <RainbowKitProvider chains={appChains.chains} avatar={BlockieAvatar}>
        <div className="flex flex-col min-h-screen min-w-fit bg-base-100 font-opensans">
          <div className="text-center bg-gradient-to-r from-blue-100 to-yellow-200 p-2 w-screen">
            Live on <strong>Base Goerli</strong> 🎉
          </div>{" "}
          <Header />
          <main className="relative flex flex-col flex-1 min-w-fit bg-secondary bg-opacity-90">
            <Component {...pageProps} />
            <Analytics />
          </main>
          <Footer />
        </div>
        <Toaster />
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

export default ScaffoldEthApp;
