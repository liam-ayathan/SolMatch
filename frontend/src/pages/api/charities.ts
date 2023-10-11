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

const db = getFirestore(firebaseApp)

type Charity = {
  id: string; // document ID
  name: string;
  email: string;
  uen: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Charity[]>
) {
  try {
    if (req.method === "GET") {
      const charities = await getCharities();
      res.status(200).json(charities);
    } else if (req.method === "POST") {
      const newCharityData = req.body;
      const newCharity = await createCharity(newCharityData);
      res.status(201).json(newCharity);
    } else if (req.method === "PUT") {
      const { id } = req.query;
      const updatedCharityData = req.body;
      await updateCharity(id as string, updatedCharityData);
      res.status(200).json({ message: "Charity updated successfully" });
    } else if (req.method === "DELETE") {
      const { id } = req.query;
      await deleteCharity(id as string);
      res.status(200).json({ message: "Charity deleted successfully" });
    }
  } catch (error) {
    console.error("Error fetching charities:", error);
    res.status(500).json({ error: "Server error" });
  }
}

async function getCharities() {
  const charitiesCollection = collection(db, "charities");
  const charitySnapshot = await getDocs(charitiesCollection);
  const charities: Charity[] = [];
  charitySnapshot.forEach((doc) => {
    charities.push({
      id: doc.id,
      ...doc.data(),
    } as Charity);
  });

  return charities;
}

async function createCharity(newCharityData: Charity) {
    const charitiesCollection = collection(db, "charities");
    const newCharityRef = await addDoc(charitiesCollection, newCharityData);

  newCharityData.id = newCharityRef.id;

  return newCharityData;
}

async function updateCharity(id: string, updatedCharityData: Charity) {
  const charityRef = doc(db, "charities", id);

  await updateDoc(charityRef, updatedCharityData);
}

async function deleteCharity(id: string) {
    const charityRef = doc(db, "charities", id);

  await deleteDoc(charityRef);
}
