import { NextApiRequest, NextApiResponse } from 'next';
import firebaseApp from '../../../firebaseConfig';
import {
  collection,
  getDoc,
  setDoc,
  updateDoc,
  doc,
  getFirestore,
} from 'firebase/firestore';

const db = getFirestore(firebaseApp);

type User = {
  email: string; // document ID
  isKyc: boolean;
  uen: string;
  name: string;
  category: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<User | any>
) {
  try {
    if (req.method === 'GET') {
      const { email } = req.query;
      const user = await getUser(email as string);
      res.status(200).json(user);
    } else if (req.method === 'POST') {
      const newUserData = req.body;
      const newUser = await createUser(newUserData);
      res.status(201).json(newUser);
    } else if (req.method === 'PUT') {
      const { email, uen, name, category } = req.body;
      await updateUserKycStatus(
        email as string,
        name as string,
        uen as string,
        category as string
      );
      res.status(200).json({ message: 'User KYC status updated successfully' });
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

async function getUser(email: string) {
  const userRef = doc(db, 'users', email);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return { email: userSnap.id, ...userSnap.data() } as User;
  } else {
    // Create new user with default values
    const newUser: User = {
      email,
      isKyc: false,
      uen: '', // You might want to pass a meaningful value here
      name: '', // You might want to pass a meaningful value here
      category: '', // You might want to pass a meaningful value here
    };

    // Add new user to the database
    await setDoc(userRef, newUser);

    // Return the new user
    return newUser;
  }
}

async function createUser(newUserData: User) {
  const usersCollection = collection(db, 'users');
  const newUserRef = doc(usersCollection, newUserData.email); // Using email as the document ID
  await setDoc(newUserRef, newUserData);

  return newUserData;
}

async function updateUserKycStatus(
  email: string,
  uen: string,
  name: string,
  category: string
) {
  console.log('from backend', email, uen, name, category);
  const userRef = doc(db, 'users', email);
  await updateDoc(userRef, { isKyc: true, uen, name, category });
}
