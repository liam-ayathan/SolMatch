import React from 'react';
import { useRouter } from 'next/router'; // Import useRouter from Next.js
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Progress } from './ui/progress';

interface CharityCardProps {
  title: string;
  description: string;
  currentAmount: number;
  targetAmount: number;
}

const CharityCard: React.FC<CharityCardProps> = ({
  title,
  description,
  currentAmount,
  targetAmount,
}) => {
  const progressValue = (currentAmount / targetAmount) * 100;
  
  const router = useRouter(); // Initialize the useRouter hook
  const slug = title.replace(/\s+/g, "-").toLowerCase()

  const handleCardClick = () => {
    // Programmatically navigate to the donor page
    router.push(`/donate/${slug}`);
  };

  return (
    // Add an onClick event to the Card div to handle the click event
    <div onClick={handleCardClick} style={{ cursor: "pointer" }}>
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 font-semibold text-xs">
            {currentAmount} / {targetAmount} funded
          </p>
        </CardContent>
        <CardFooter>
          <Progress value={progressValue} />
        </CardFooter>
      </Card>
    </div>
  );
};

export default CharityCard;
