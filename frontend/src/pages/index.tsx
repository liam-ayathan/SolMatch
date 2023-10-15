import Image from "next/image";
import { Inter } from "next/font/google";
import Layout from "@/components/Layout";
import CampaignCard from "@/components/CampaignCard";
import { Timestamp, DocumentReference } from "@firebase/firestore-types";
import { Campaign, Commitment } from "@/types/charities";
const inter = Inter({ subsets: ["latin"] });
import { campaignsStub } from "@/stubs/campaignCard";

interface ExploreCampaignsSegmentProps {
  campaigns: Campaign[];
}

const ExploreCampaignsSegment = ({
  campaigns,
}: ExploreCampaignsSegmentProps) => {
  return (
    <div className="flex flex-col space-y-3">
      <h1 className="font-bold text-4xl">Explore Campaigns</h1>
      <div className="flex space-x-4">
        {campaigns.map(
          ({ title, description, currentAmount, targetAmount }, index) => (
            <CampaignCard
              key={index}
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

export default function Home({ campaigns }: ExploreCampaignsSegmentProps) {
  return (
    <Layout>
      <div className="relative w-full">
        {/* Hero Image */}
        {/* <div
          className="bg-center bg-no-repeat h-[300px]"
          style={{ backgroundImage: 'url(/flowers.png)' }}
        ></div> */}
        <div className="flex items-center">
          <ExploreCampaignsSegment campaigns={campaigns} />
        </div>
      </div>
    </Layout>
  );
}

export async function getStaticProps() {
  let campaigns;

  const response = await fetch("http://localhost:3000/api/campaigns", {
    method: "GET",
  });

  campaigns = await response.json();
  console.log("campaigns", campaigns);

  return {
    props: {
      campaigns,
    },
  };
}

// export async function getStaticProps() {
//   // Use the campaignsStub data instead of fetching from an API
//   const campaigns = campaignsStub;

//   let test;

//   const response = await fetch("http://localhost:3000/api/campaigns", {
//     method: "GET",
//   });

//   test = await response.json();
//   console.log("campaigns from firebase", test);

//   return {
//     props: {
//       campaigns,
//     },
//   };
// }
