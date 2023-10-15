import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Navbar: React.FC = () => {
  // web3
  const [web3, setWeb3] = useState<any>(null); // Web3 instance
  const [account, setAccount] = useState<string | null>(null); // User's Ethereum account

  // Dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [pubKey, setPubKey] = useState<string | null>(null);

  const getProvider = (isConnected: boolean) => {
    if ("phantom" in window) {
      const provider = window.phantom?.solana;
      if (isConnected) {
        provider.on("connect", () => console.log("Wallet is connected!"));
        if (provider?.isPhantom) {
          return provider;
        }
      } else {
        provider.on("disconnect", () => console.log("Wallet is disconnected!"));
        if (provider?.isPhantom) {
          return provider;
        }
      }
    }

    window.open("https://phantom.app/", "_blank");
  };

  const establishConnection = async () => {
    const provider = getProvider(true); // see "Detecting the Provider", adding in true for connected
    try {
      const resp = await provider.connect({ onlyIfTrusted: true });
      console.log(`I connected my wallet ${resp.publicKey.toString()}`);
      // 26qv4GCcx98RihuK3c4T6ozB3J7L6VwCuFVc7Ta2A3Uo
      console.log(provider.isConnected);
      setPubKey(resp.publicKey.toString());
    } catch (err) {
      // { code: 4001, message: 'User rejected the request.' }
      console.log(err);
    }
  };

  const handleDisconnect = async () => {
    const provider = getProvider(false); // see "Detecting the Provider"
    try {
      const resp = await provider.disconnect();
      console.log(`I disconnected my wallet`);
      // 26qv4GCcx98RihuK3c4T6ozB3J7L6VwCuFVc7Ta2A3Uo
      console.log(provider.isConnected);
      setPubKey(null);
    } catch (err) {
      // { code: 4001, message: 'User rejected the request.' }
      console.log(err);
    }
  };

  return (
    <div className="flex justify-between w-full">
      <div className="font-black">
        <Link href="/">Solmatch</Link>
      </div>
      <div className="flex space-x-2">
        {pubKey ? (
          <div className="relative">
            <Button variant="outline">
              Connected: {pubKey.substring(0, 5)}...
            </Button>{" "}
            <Button variant="outline" onClick={handleDisconnect}>
              Disconnect
            </Button>
          </div>
        ) : (
          <Button variant="outline" onClick={establishConnection}>
            Connect Wallet
          </Button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
