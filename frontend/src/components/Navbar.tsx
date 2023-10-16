import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Cookies from "js-cookie"; // Import the 'js-cookie' library

const Navbar: React.FC = () => {
  const [pubKey, setPubKey] = useState<string | boolean>(false);

  useEffect(() => {
    const fetchCookies = async () => {
      let initialPubKey = Cookies.get("public_key"); // doing this so that I can retain the session for this even when the page rebuilds
      console.log(`the pubkey key is ${initialPubKey}`);
      if (
        initialPubKey === undefined ||
        initialPubKey === "null" ||
        initialPubKey === null ||
        initialPubKey === "false"
      ) {
        setPubKey(false);
        console.log("if executed");
      } else {
        setPubKey(initialPubKey);
        console.log("else executed");
      }
    };
    fetchCookies();
  }, []);

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
      const resp = await provider.connect();
      console.log(`I connected my wallet ${resp.publicKey.toString()}`);
      // 26qv4GCcx98RihuK3c4T6ozB3J7L6VwCuFVc7Ta2A3Uo
      console.log(provider.isConnected);
      Cookies.set("public_key", resp.publicKey.toString());
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
      Cookies.set("public_key", false);
      setPubKey(false);
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
        {pubKey !== false ? (
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
