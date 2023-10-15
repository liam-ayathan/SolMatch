// to be deleted
import React, { useState } from "react";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import Web3 from "web3";
import { useSession, signIn, signOut } from "next-auth/react";

interface CamPaignProgressSectionProps {
  progressValue: number;
  currentAmount: number;
  targetAmount: number;
  daysRemaining: number;
  charity: string;
}

const CampaignProgressSection: React.FC<CamPaignProgressSectionProps> = ({
  progressValue,
  currentAmount,
  targetAmount,
  daysRemaining,
  charity,
}) => {
  const [donationAmount, setDonationAmount] = useState<number>(0);
  const { data: session } = useSession();
  const submitDefaultTransaction = async () => {
    try {
      const web3 = new Web3(window.ethereum);
      if (window.ethereum) {
        await window.ethereum.request({ method: "eth_requestAccounts" });

        // Get the user's Ethereum account
        const accounts = await web3.eth.getAccounts();
        const senderAddress = accounts[0];
        console.log("Sender Address:", senderAddress);

        // Recipient's address (null address)
        const response = await fetch("/api/donate?id=5XUCEe0GNc1rxTNAtNCP");
        const recipientAddress = await response.json();
        console.log("Recipient Address:", recipientAddress);

        // Convert donationAmount to Wei
        const amountInWei = web3.utils.toWei(
          donationAmount.toString(),
          "ether"
        );

        const senderBalance = await web3.eth.getBalance(senderAddress);
        const balanceInWei = web3.utils.fromWei(senderBalance, "ether");
        console.log("Sender's Balance: ", balanceInWei);

        const networkId = await web3.eth.getChainId();
        console.log("Chain ID: ", networkId);

        const gasLimit = 100000;

        // Create a transaction object
        const transactionObject = {
          from: senderAddress,
          to: recipientAddress,
          value: amountInWei,
          chainId: 80001,
          gas: gasLimit,
        };

        console.log("Transaction Object:", transactionObject);

        // Sign and send the transaction
        const txReceipt = await web3.eth.sendTransaction(transactionObject);
        console.log("Transaction Hash:", txReceipt.transactionHash);
      } else {
        console.error("Ethereum provider (MetaMask) not found.");
      }
    } catch (error) {
      console.error("Error sending transaction:", error);
    }
  };

  return (
    <section>
      <Progress value={progressValue} className="mb-4" />

      <div className="mb-4">
        <h2 className="text-2xl font-bold">${currentAmount}</h2>
        <p>Pledged out of ${targetAmount} goal</p>
      </div>
      <div className="mb-4">
        <h2 className="text-2xl font-bold">{daysRemaining}</h2>
        <p className="text-gray-600">Days Remaining</p>
      </div>
      <section className="mb-4">
        <h2 className="text-3xl font-semibold mb-2">Charity</h2>
        <p className="text-gray-600">{charity}</p>
      </section>

      {!session && (
        <section className="mb-4">
          <input
            type="number"
            value={donationAmount}
            onChange={(e) => setDonationAmount(Number(e.target.value))}
            placeholder="Enter donation amount"
            className="border rounded-md p-2 w-32 mr-1"
          />
          <Button onClick={submitDefaultTransaction}>Donate Now!</Button>
        </section>
      )}
    </section>
  );
};

export default CampaignProgressSection;
