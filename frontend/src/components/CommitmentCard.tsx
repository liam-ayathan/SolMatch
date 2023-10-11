import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "./ui/button";
import { suppliersStub } from "@/stubs/suppliers";

interface CommitmentCardProps {
  supplier: string;
  percentage: string;
  fulfilled?: boolean;
}

const CommitmentCard: React.FC<CommitmentCardProps> = ({
  supplier,
  percentage,
  fulfilled,
}) => {
  const bgColor = fulfilled ? "bg-[#bdf1c3]" : "bg-[#f2a4a4]";
  const borderStyle = "border-none"; // Add this to remove the border
  const opacity = fulfilled ? "opacity-100" : "opacity-80"; // Adjust opacity as needed

  for (let i = 0; i < suppliersStub.length; i++) {
    if (suppliersStub[i].value === supplier) {
      supplier = suppliersStub[i].label;
    }
  }

  return (
    <Card
      className={`m-1 w-1/2 ${bgColor} ${borderStyle} ${opacity} hover:scale-105 transform transition-transform duration-300 ease-in-out`}
    >
      <div className="flex p-4 items-center justify-between">
        <div className="text-lg font-semibold">
          {percentage} {supplier}
        </div>
        {/* <div className="text-lg font-semibold">
          {fulfilled === "true" ? "Fulfilled!" : "Not Fulfilled"}
        </div> */}
        <Button>
          {fulfilled ? "Fulfilled!" : "Fulfill Now"}
        </Button>
      </div>
    </Card>
  );
};

export default CommitmentCard;
