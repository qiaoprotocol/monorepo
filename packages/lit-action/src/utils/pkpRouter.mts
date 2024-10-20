import { ethers } from "ethers";
import routerMetadata from "../contracts/router-metadata.json" assert { type: "json" };
import pkpMetadata from "../contracts/pkp-metadata.json" assert { type: "json" };
import { getChronicalProvider } from "../utils/getProvider.mjs";
const provider = getChronicalProvider();
// const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const PKP = new ethers.Contract(pkpMetadata.address, pkpMetadata.abi, provider);
const router = new ethers.Contract(
  await PKP.router(),
  routerMetadata.abi,
  provider
);

export const getPubKey = async (tokenId: string): Promise<string> => {
  const pubKey = await router.getPubkey(tokenId);
  return pubKey;
};

export const getEthAddress = async (tokenId: string): Promise<string> => {
  const ethAddress = await router.getEthAddress(tokenId);
  return ethAddress;
};
