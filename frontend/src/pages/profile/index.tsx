import Image from "next/image";
import { Inter } from "next/font/google";
import Layout from "@/components/Layout";
import CharityCard from "@/components/CharityCard";
import { campaignsStub } from "@/stubs/campaignCard";
import { Button } from "@/components/ui/button";
import CharityAvatar from "@/components/CharityAvatar";
import Link from "next/link";

// const inter = Inter({ subsets: ["latin"] });

const ViewCampaignSegment = () => {
  return (
    <div className="flex flex-col space-y-3">
      <div className="flex justify-between w-full">
        <h1 className="font-bold text-4xl">View Campaigns</h1>
        <Link href="/campaign">
          <Button variant="greyBlack">Create Campaign</Button>
        </Link>
      </div>
      <div className="flex space-x-4">
        {campaignsStub.map(
          ({ title, description, currentAmount, targetAmount }) => (
            <CharityCard
              title={title}
              description={description}
              currentAmount={currentAmount}
              targetAmount={targetAmount}
            />
          )
        )}
      </div>
    </div>
  );
};

export default function CharityProfile() {
  return (
    <Layout>
      <div>
        <CharityAvatar
          name="Charity XX"
          imageUrl="https://th.bing.com/th/id/OIP.IWkbOf-SXGMxFfACHnLX9QHaHa?pid=ImgDet&rs=1"
        />
        <div className="flex min-h-[40vh] items-center">
          <ViewCampaignSegment />
        </div>
      </div>
    </Layout>
  );
}
