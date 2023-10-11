// RecentDonationsSection.tsx
import React from "react";
import RecentDonationsCard from '@/components/RecentDonationsCard';

interface RecentDonationsSectionProps {
  donations: any[];
}

const RecentDonationsSection: React.FC<RecentDonationsSectionProps> = ({
  donations,
}) => {
  return (
    <section>
      <h2 className="text-3xl font-semibold mb-2">Recent Donations</h2>
      <ul className="list-disc list-inside">
        {donations.map((donation, index) => (
          <RecentDonationsCard
            key={index}
            donor={donation.donor}
            time={donation.time}
            amount={donation.amount}
          />
        ))}
      </ul>
    </section>
  );
};

export default RecentDonationsSection;
