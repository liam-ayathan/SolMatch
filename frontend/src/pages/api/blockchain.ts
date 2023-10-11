import { BigNumber, ethers } from "ethers";
import { campaignAccountFactoryABI, campaignAccountABI, erc20ABI } from "../../abis/abi"
import { getFirestore } from "firebase/firestore";
import firebaseApp from "../../../firebaseConfig"
import { NextApiRequest, NextApiResponse } from "next";
require('dotenv').config();

const db = getFirestore(firebaseApp)

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    try {
        if (req.method === "GET") {
          const response = await buildAndSignOp("1","0x6cEc6CF0f543dfE6376E6628C785d40f8e80F4B7","0x567dcbCC0Ded4Bd654485ba4675D5c27BfEB6F36","0x9c34Da6D6B50D1f0271699798a1DD1C053Db30d1","0x9999f7Fea5938fD3b1E26A12c3f2fb024e194f97", BigNumber.from(0),BigNumber.from(0),["0x567dcbCC0Ded4Bd654485ba4675D5c27BfEB6F36"]);
          res.status(200).json(response);
      } 
    }catch (error) {
        console.error("Error fetching campaigns:", error);
        res.status(500).json({ error: "Server error" });
      }
    }


/** ERC4337 METHODS **/
interface UserOperation {
  Sender: string;
  Nonce: BigNumber;
  InitCode: Uint8Array;
  CallData: string;
  CallGasLimit: BigNumber;
  VerificationGasLimit: BigNumber;
  PreVerificationGas: BigNumber;
  MaxFeePerGas: BigNumber;
  MaxPriorityFeePerGas: BigNumber;
  PaymasterAndData: Uint8Array;
  Signature: string;
}

// BuildAndSignOp needs to have BuildOp method, getUserOpHash and Sign
// then Append the signature to the Op
async function buildAndSignOp(
  salt: string,
  sender: string,
  owner: string,
  factory: string,
  target: string,
  value: BigNumber,
  nonce: BigNumber,
  suppliers: string[],
): Promise<UserOperation> {
  const erc20Interface = new ethers.utils.Interface(erc20ABI);
  const targetData = buildCallData(erc20Interface, "transfer",sender,1)

  const op = buildOp(
    stringToBigInt(salt),
    sender,
    factory,
    owner,
    target,
    value,
    nonce,
    targetData,
    suppliers
  );
  const opHash = getUserOpHash(op, "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789", BigNumber.from(80001));
  console.log("Op Hash:", opHash.toString());

  const signingPkey = process.env.SIGNING_PKEY;
  const signature = await signEIP191(opHash, signingPkey);

  const opSigned: UserOperation = {
    ...op,
    Signature: signature,
  };

  return opSigned;
}

function stringToBigInt(str: string): BigNumber {
  return BigNumber.from(str);
}

async function signEIP191(inputData: string, signingKey: any): Promise<string> {
  const privateKey = Buffer.from(signingKey.replace("0x", ""), "hex");
  let wallet = new ethers.Wallet(privateKey);
  const hashBytes = ethers.utils.arrayify(inputData);
  const signature = await wallet.signMessage(hashBytes);

  return signature;
}

function getUserOpHash(op: UserOperation, entryPoint: string, chainId: BigNumber) {
  const packed = ethers.utils.defaultAbiCoder.encode(
    [
      "address",
      "uint256",
      "bytes32",
      "bytes32",
      "uint256",
      "uint256",
      "uint256",
      "uint256",
      "uint256",
      "bytes32",
    ],
    [
      op.Sender,
      op.Nonce,
      ethers.utils.keccak256(op.InitCode),
      ethers.utils.keccak256(op.CallData),
      op.CallGasLimit,
      op.VerificationGasLimit,
      op.PreVerificationGas,
      op.MaxFeePerGas,
      op.MaxPriorityFeePerGas,
      ethers.utils.keccak256(op.PaymasterAndData),
    ]
  );

  const enc = ethers.utils.defaultAbiCoder.encode(
    ["bytes32", "address", "uint256"],
    [ethers.utils.keccak256(packed), entryPoint, chainId]
  );

  return ethers.utils.keccak256(enc);
}


// BuildOp needs to generate the Generate4337Initcode, and BuilcOpCallData
function buildOp(
  salt: BigNumber,
  sender: string,
  factory: string,
  owner: string,
  target: string,
  value: BigNumber,
  nonce: BigNumber,
  targetData: string,
  suppliers: string[]
): UserOperation {
  let initCode: Uint8Array = new Uint8Array();
  if (nonce.eq(BigNumber.from(0))) {
    initCode = generate4337Initcode(factory, owner, salt, suppliers );
  }
  const campaignAccountInterface = new ethers.utils.Interface(campaignAccountABI);
  const callData: string = buildCallData(campaignAccountInterface, "execute", target, 0, targetData);

  const op: UserOperation = {
    Sender: sender,
    Nonce: nonce,
    InitCode: initCode,
    CallData: callData,
    CallGasLimit: BigNumber.from(200000),
    VerificationGasLimit: BigNumber.from(1000000),
    PreVerificationGas: BigNumber.from(50000),
    MaxFeePerGas: BigNumber.from(100000000000),
    MaxPriorityFeePerGas: BigNumber.from(1000000000),
    PaymasterAndData: new Uint8Array(), // Replace with the appropriate value
    Signature: ""
  };

  return op;
}
// BuildCallData
function buildCallData(contractInterface: ethers.utils.Interface, functionName: string, ...args: any[]): string {
  try {
    // Encode the function data
    const data = contractInterface.encodeFunctionData(functionName, args);

    return data;
  } catch (error) {
    console.error(`Failed to encode function data: ${error}`);
    throw error;
  }
}

// GenerateInitCode
function generate4337Initcode(factory: string, owner: string, salt: BigNumber, suppliers: string[]): Uint8Array {
    const parsedABI = new ethers.utils.Interface(campaignAccountFactoryABI);

    // Encode the function data
    const data = parsedABI.encodeFunctionData("createAccount", [owner, salt, suppliers]);

    // Convert factory address and data to bytes
    const factoryAddressBytes = ethers.utils.arrayify(factory);
    const concatBytes = ethers.utils.concat([factoryAddressBytes, data]);

    console.log("InitCode:", ethers.utils.hexlify(concatBytes));
    return concatBytes;
}

function encodeStringArray(array: string[]): string {
    return array.join(";");
}

/* Contract Methods*/

// This method should call our factory to get a counterfactual address
export async function getAddress(
  factoryAddress: any,
  owner: any,
  salt: bigint,
  suppliers: string[]
): Promise<string> {
  // Connect to an Ethereum provider
  const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDERURL);

  // Create an instance of your smart contract
  const factoryContract = new ethers.Contract(factoryAddress, campaignAccountFactoryABI, provider);

  try {
    // Call the getAddress function on the smart contract
    const address = await factoryContract.getAddress(
      owner,
      salt,
      suppliers
    );

    // Convert the address to a string
    return ethers.utils.getAddress(address);
  } catch (error) {
    // Handle any errors here
    console.error("Error calling getAddress:", error);
    throw error;
  }
}