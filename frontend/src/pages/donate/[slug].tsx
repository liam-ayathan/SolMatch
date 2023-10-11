// pages/donate/[slug].tsx
import React from "react";
import { useRouter } from "next/router";
// import { campaignsStub } from "../../stubs/campaignCard"; // Import your campaign data here
import Layout from "@/components/Layout";
import RecentDonationsSection from "@/components/RecentDonationsSection";
import CommitmentsSection from "@/components/CommitmentsSection";
import CharityProgressSection from "@/components/CharityProgressSection";
import { DocumentReference, Timestamp } from "@firebase/firestore-types";
import { Campaign, Commitment } from "@/types/charities";
import { campaignsStub } from "@/stubs/campaignCard";

interface CampaignProps {
  campaign: {
    title: string;
    description: string;
    currentAmount: number;
    targetAmount: number;
    commitment: Commitment[];
    charity: string;
    start: string;
    end: string;
    image: string;
  };
}


const CampaignPage: React.FC<CampaignProps> = ({ campaign }) => {
  const router = useRouter();

  const start = new Date(campaign.start)
  const end = new Date(campaign.end)
  
  const timeDifference = end.getTime() - start.getTime();
  const daysRemaining = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

  const progressValue = (campaign.currentAmount / campaign.targetAmount) * 100;

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <div className="w-2/3 p-6 mt-8">
        <h1 className="text-4xl font-bold mb-4">{campaign.title}</h1>
        <div className="mb-4">
          <img
            src={campaign.image} // Replace with the actual image path
            alt="Campaign Image"
            className="w-2/3 h-auto rounded-md"
          />
        </div>
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Description</h2>
          <p className="text-gray-600">{campaign.description}</p>
        </div>
        <CommitmentsSection commitment={campaign.commitment} />
      </div>

      <div className="w-1/3 p-6 mt-8">
        <CharityProgressSection
          progressValue={progressValue}
          currentAmount={campaign.currentAmount}
          targetAmount={campaign.targetAmount}
          daysRemaining={daysRemaining}
          charity={campaign.charity}
        />
        <RecentDonationsSection donations={[{"donor":"0x..111", "time":"5 Hours Ago", "amount":"1 MATIC"}, {"donor":"0x..354", "time":"1 Day Ago", "amount":"58.2 MATIC"}, {"donor":"0x..259", "time":"5 Days Ago", "amount":"0.001 MATIC"}]} />
      </div>
    </Layout>
  );
};

export async function getStaticPaths() {
  let campaigns;

  // const response = await fetch('http://localhost:3000/api/campaigns', {
  //   method: 'GET'
  // });

  // campaigns = await response.json();
  // console.log("campaigns",campaigns)

  campaigns = campaignsStub;

  for (let i = 0; i < campaigns.length; i++) {
    const campaign = campaigns[i];
    console.log(campaign.commitment)
  }



  const paths = campaigns.map((campaign: Campaign) => ({
    params: { slug: campaign.title.replace(/\s+/g, "-").toLowerCase() },
  }));

  return { paths, fallback: true };
}

export async function getStaticProps({ params }: { params: { slug: string } }) {

  let campaigns;

  // const response = await fetch('http://localhost:3000/api/campaigns', {
  //   method: 'GET'
  // });

  // campaigns = await response.json();
  // console.log("campaigns",campaigns)

  campaigns = campaignsStub;
  
  const slug = params.slug;
  const campaign = campaigns.find(
    (campaign: Campaign) =>
      campaign.title.replace(/\s+/g, "-").toLowerCase() === slug
  );

  if (!campaign) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      campaign,
    },
  };
}

export default CampaignPage;
