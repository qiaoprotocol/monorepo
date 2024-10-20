import { ethers } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();
import baseAccountMetadata from "../contracts/baseAccount-metadata.json" assert { type: "json" };
const PKPEthAddress = process.env.PKP_ETH_ADDRESS;
const baseAccountAddress = process.env.BASE_ACCOUNT_ADDRESS;
import { getProvider } from "../utils/getProvider.mjs";
const provider = getProvider("goerli");
const baseAccount = new ethers.Contract(
  baseAccountAddress,
  baseAccountMetadata.abi,
  provider
);
