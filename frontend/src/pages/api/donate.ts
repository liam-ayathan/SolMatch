import { BigNumber, ethers } from "ethers";
import { createHash } from "crypto";
import {
  campaignAccountFactoryABI,
  campaignAccountABI,
  erc20ABI,
} from "../../abis/abi";
import {
  DocumentReference,
  Timestamp,
  doc,
  getDoc,
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import firebaseApp from "../../../firebaseConfig";
import { NextApiRequest, NextApiResponse } from "next";
import { getAddress } from "./blockchain";
import { json } from "stream/consumers";
require("dotenv").config();

const db = getFirestore(firebaseApp);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === "GET") {
      const { id } = req.query;
      const response = await getCampaignInfo(id);
      res.status(200).json(response);
    }
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    res.status(500).json({ error: "Server error" });
  }
}

type Campaign = {
  id: string; // document ID
  title: string;
  description: string;
  category: string;
  start: Timestamp;
  end: Timestamp;
  targetAmount: number;
  currentAmount: number;
  commitment: Commitment[];
  charity: DocumentReference;
};

type Commitment = {
  supplier: string;
  percentage: number;
}

export async function calculateCampaignAddress(id: any) {
  // convert string to bigInt
  const hash = createHash("sha256").update(id).digest("hex");

  // Convert the hexadecimal hash to a decimal number
  const decimalNumber = parseInt(hash, 16);

  // Create a BigInt from the decimal number
  const salt = BigInt(decimalNumber);
  // fetch owner and factory address
  const owner = process.env.OWNER_ADDRESS;
  const factory = process.env.CAMPAIGN_ACCOUNT_FACTORY_ADDRESS;

  // fetch suppliers based on id
  const campaignRef = doc(db, "campaigns", id);
  const campaignDoc = await getDoc(campaignRef);

  if (campaignDoc.exists()) {
    // console.log("Document data:", campaignDoc.data())
    const campaignData = campaignDoc.data() as Campaign;
    console.log(campaignData);
    const commitmentArray = campaignData.commitment;

    const supplierDetails = [];

    for (const commitment of commitmentArray) {
      const supplierName = commitment.supplier;

      // Create a reference to the "suppliers" collection and query by "name"
      const suppliersCollectionRef = collection(db, "suppliers");
      const q = query(suppliersCollectionRef, where("name", "==", supplierName));

      // Execute the query to get the matching documents
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Get the first matching document (assuming there's only one)
        console.log(querySnapshot.docs[0].data());
        const supplierDoc = querySnapshot.docs[0];
        const supplierData = supplierDoc.data();
        supplierDetails.push(supplierData.wid);
      }
      // return supplierDetails;
    }


    const campaignAddress = await getAddress(
      factory,
      owner,
      salt,
      supplierDetails
    );
    return campaignAddress;
  }
}

async function getCampaignInfo(id: string) {
  const campaignRef = doc(db, "campaigns", id);
  const campaignDoc = await getDoc(campaignRef);
  console.log(campaignDoc)
  if (campaignDoc.exists()) {
    return campaignDoc.data().campaignAddress;
  }
}
