import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Web3 from "web3";
import { useRouter } from "next/router";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { RxAvatar } from "react-icons/rx";

import { getUser } from "@/lib/api";

const Navbar: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();

  // web3
  const [web3, setWeb3] = useState<any>(null); // Web3 instance
  const [account, setAccount] = useState<string | null>(null); // User's Ethereum account

  // Dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleNavigateToProfile = (e: React.MouseEvent) => {
    router.push("/profile");
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    signOut();
  };

  const handleNavigateToCreateCampaign = () => {
    router.push("/campaign");
  };

  const initWeb3 = async () => {
    if (window.ethereum) {
      try {
        // Request access to MetaMask wallet
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        console.log("Web3 instance initialized.");

        // Get the user's Ethereum account
        const accounts = await web3Instance.eth.getAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
      }
    } else {
      console.error("MetaMask extension not detected.");
    }
  };

  useEffect(() => {
    const fetchUser = async (email: string) => {
      const user = await getUser(email);
      console.log("FETCHED USER!!!!!!!!!!");
      console.log(user);

      if (!user.isKyc) {
        router.push({
          pathname: "kyc",
          query: { email },
        });
      }
    };

    if (session && session.user && session.user.email) {
      fetchUser(session.user.email);
    }
  }, [session]);

  // Handle MetaMask connection
  const handleConnectMetaMask = async () => {
    if (!web3) {
      console.error("Web3 instance not initialized.");
      initWeb3();
      return;
    }

    try {
      // Request access to MetaMask wallet
      await window.ethereum.request({ method: "eth_requestAccounts" });

      // Get the user's Ethereum account
      const accounts = await web3.eth.getAccounts();
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      }
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
    }
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Handle disconnecting MetaMask
  const handleDisconnectMetaMask = () => {
    // Disconnect logic here (e.g., reset account and web3)
    setAccount(null);
    setWeb3(null);
    setIsDropdownOpen(false);
  };

  return (
    <div className="flex justify-between w-full">
      <div className="font-black">
        <Link href="/">Solmatch</Link>
      </div>
      <div className="flex space-x-2">
        {account ? ( // removed && !session
          <div className="relative">
            <Button variant="outline" onClick={toggleDropdown}>
              Connected: {account.substring(0, 5)}...
            </Button>
            {isDropdownOpen && (
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <div
                    className="absolute inset-0 bg-transparent z-10"
                    onClick={() => setIsDropdownOpen(false)}
                  ></div>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={handleDisconnectMetaMask}>
                      Disconnect Wallet
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenuTrigger>
              </DropdownMenu>
            )}
          </div>
        ) : (
          !session && (
            <Button variant="outline" onClick={handleConnectMetaMask}>
              Connect Wallet
            </Button>
          )
        )}
        {session ? ( // can delete or augment this since it is not needed anymore -> no charity login
          <div className="flex items-center gap-2">
            <Button onClick={handleNavigateToCreateCampaign}>
              Create a Campaign
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="outline" size="icon">
                  <RxAvatar className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleNavigateToProfile}>
                  Campaigns
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <p></p>
        )}
      </div>
    </div>
  );
};

export default Navbar;
