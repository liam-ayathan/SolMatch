// to be deleted
import React, { useState } from "react";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import { useSession, signIn, signOut } from "next-auth/react";
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import bs58 from "bs58";
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

  const submitDefaultTransaction = async () => {
    console.log("trying to send");
    const provider = await getProvider(true);
    try {
      await provider.connect();
      const feePayer = provider.publicKey;
      console.log(feePayer.toString());
      console.log(provider.isConnected);

      const network = "https://api.devnet.solana.com";
      const connection = new Connection(network);
      const { blockhash } = await connection.getLatestBlockhash();

      const transaction = new Transaction();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = feePayer;

      const receiverPublicKey = new PublicKey(
        "DUB9op1sZmopFQRQEi7yfpHusQK9E8gKuffhxCSfsUKu"
      ); // Replace with the receiver's public key
      const lamportsToSend = Math.floor(0.0001 * 0.001); // Replace with the amount of SOL to send (lamports per sol)

      const transferInstruction = SystemProgram.transfer({
        fromPubkey: feePayer,
        toPubkey: receiverPublicKey,
        lamports: lamportsToSend,
      });

      transaction.add(transferInstruction);

      let signedTransaction = await provider.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize()
      );
      console.log(signature);
    } catch (err) {
      console.log(err);
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
          {/* <input
            type="number"
            value={donationAmount}
            onChange={(e) => setDonationAmount(Number(e.target.value))}
            placeholder="Enter donation amount"
            className="border rounded-md p-2 w-32 mr-1"
          /> */}
          <Button onClick={submitDefaultTransaction}>Donate Now!</Button>
        </section>
      )}
    </section>
  );
};

export default CampaignProgressSection;
