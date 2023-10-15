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
    console.log("Done!");
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
