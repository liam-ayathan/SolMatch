// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from "next";
import firebaseApp from "../../../firebaseConfig";
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

const db = getFirestore(firebaseApp);

type Supplier = {
  id: string; // document ID
  name: string;
  wid: string; // Wallet ID
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Supplier[]>
) {
  try {
    if (req.method === "GET") {
      const suppliers = await getSuppliers();
      res.status(200).json(suppliers);
    } else if (req.method === "POST") {
      const newSupplierData = req.body;
      const newSupplier = await createSupplier(newSupplierData);
      res.status(201).json(newSupplier);
    } else if (req.method === "PUT") {
      const { id } = req.query;
      const updatedSupplierData = req.body;
      await updateSupplier(id as string, updatedSupplierData);
      res.status(200).json({ message: "Supplier updated successfully" });
    } else if (req.method === "DELETE") {
      const { id } = req.query;
      await deleteSupplier(id as string);
      res.status(200).json({ message: "Supplier deleted successfully" });
    }
  } catch (error) {
    console.error("Error fetching supplier:", error);
    res.status(500).json({ error: "Server error" });
  }
}

async function getSuppliers() {
  const suppliersCollection = collection(db, "suppliers");
  const supplierSnapshot = await getDocs(suppliersCollection);
  const suppliers: Supplier[] = [];
  supplierSnapshot.forEach((doc) => {
    suppliers.push({
      id: doc.id,
      ...doc.data(),
    } as Supplier);
  });

  return suppliers;
}

async function createSupplier(newSupplierData: Supplier) {
  const suppliersCollection = collection(db, "suppliers");
  const newSupplierRef = await addDoc(suppliersCollection, newSupplierData);

  newSupplierData.id = newSupplierRef.id;

  return newSupplierData;
}

async function updateSupplier(id: string, updatedSupplierData: Supplier) {
  const supplierRef = doc(db, "suppliers", id);

  await updateDoc(supplierRef, updatedSupplierData);
}

async function deleteSupplier(id: string) {
  const supplierRef = doc(db, "suppliers", id);

  await deleteDoc(supplierRef);
}
