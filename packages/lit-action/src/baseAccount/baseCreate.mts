import { ethers } from "ethers";
import { getProvider } from "../utils/getProvider.mjs";
import baseAccountFactoryMetadata from "../contracts/baseAccountFactory-metadata.json" assert { type: "json" };
import * as dotenv from "dotenv";
dotenv.config();
const provider = getProvider("goerli");
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const baseAccountFactory = new ethers.Contract(
  baseAccountFactoryMetadata.address,
  baseAccountFactoryMetadata.abi,
  wallet
);
const PKPEthAddress = process.env.PKP_ETH_ADDRESS;
export const getSalt = (userId: string): string => {
  return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(userId + ":lit"));
};
const salt = getSalt("github:mikelxc");
const createAccount = await baseAccountFactory.createAccount(
  PKPEthAddress,
  salt
);
console.log(createAccount);
