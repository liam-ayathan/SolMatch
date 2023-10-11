// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from "next";
import firebaseApp from "../../../firebaseConfig"
import {
  collection,
  getDocs,
  Timestamp,
  DocumentReference,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getFirestore,
} from "firebase/firestore";
import { calculateCampaignAddress } from "./donate"

const db = getFirestore(firebaseApp)

type Campaign = {
  id: string; // document ID
  title: string;
  description: string;
  category: string;
  start: Timestamp;
  end: Timestamp;
  targetAmount: Number;
  currentAmount: Number;
  commitment: Object[];
  charity: DocumentReference;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Campaign[]>
) {
  try {
    if (req.method === "GET") {
      const campaigns = await getCampaigns();
      res.status(200).json(campaigns);
    } else if (req.method === "POST") {
      const newCampaignData = req.body;
      const newCampaign = await createCampaign(newCampaignData);
      res.status(201).json(newCampaign);
    } else if (req.method === "PUT") {
      const { id } = req.query;
      const updatedCampaignData = req.body;
      await updateCampaign(id as string, updatedCampaignData);
      res.status(200).json({ message: "Campaign updated successfully" });
    } else if (req.method === "DELETE") {
      const { id } = req.query;
      await deleteCampaign(id as string);
      res.status(200).json({ message: "Campaign deleted successfully" });
    }
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    res.status(500).json({ error: "Server error" });
  }
}

async function getCampaigns() {
  const campaignsCollection = collection(db, "campaigns");
  const campaignSnapshot = await getDocs(campaignsCollection);
  const campaigns: Campaign[] = [];
  campaignSnapshot.forEach((doc) => {
    campaigns.push({
      id: doc.id,
      ...doc.data(),
    } as Campaign);
  });

  // console.log(campaigns)

  return campaigns;
}

async function createCampaign(newCampaignData: Campaign) {
  const campaignsCollection = collection(db, "campaigns");
  const newCampaignRef = await addDoc(campaignsCollection, newCampaignData);

  newCampaignData.id = newCampaignRef.id;
  // console.log(newCampaignData.id);

  await insertCampaignAddressIntoFirebase(newCampaignData.id);
  return newCampaignData;
}

async function insertCampaignAddressIntoFirebase(id: string) {
  const campaignAddress = await calculateCampaignAddress(id);

  const campaignRef = doc(db, "campaigns", id);
  const updatedField = { "campaignAddress": campaignAddress };

  await updateDoc(campaignRef, updatedField);
}

async function updateCampaign(id: string, updatedCampaignData: Campaign) {
  const campaignRef = doc(db, "campaigns", id);

  await updateDoc(campaignRef, updatedCampaignData);
}

async function deleteCampaign(id: string) {
  const campaignRef = doc(db, "campaigns", id);

  await deleteDoc(campaignRef);
}
