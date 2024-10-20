import * as dotenv from "dotenv";
import { ethers } from "ethers";
import { base58_to_binary } from "base58-js";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import pkpMetadata from "../contracts/pkp-datil.json" assert { type: "json" };
import PKPPermissionsMetadata from "../contracts/PKPPermissions-datil.json" assert { type: "json" };
dotenv.config();
import { getYellowStoneProvider } from "../utils/getProvider.mjs";
import { LitNetwork } from "@lit-protocol/constants";
const provider = getYellowStoneProvider();
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const PKP = new ethers.Contract(pkpMetadata.address, pkpMetadata.abi, wallet);
const PKPPermissions = new ethers.Contract(
  PKPPermissionsMetadata.address,
  PKPPermissionsMetadata.abi,
  wallet
);
// const ipfsId = process.env.LIT_ACTION_CODE;
const ipfsId = "QmNuocRfcNGC1TgVpyVGEUDe9LVirHiZTM3J7Hr29UXVyo";
const pkpTokenId =
  "63305605333360170899519397714650365706399014898060800477161625899342840956973";
// const addPermittedAction = await PKPPermissions.addPermittedAction(
//   PKPtokenId,
//   base58_to_binary(ipfsId),
//   [2]
// );
// console.log(addPermittedAction);
const litContracts = new LitContracts({
  signer: wallet,
  network: LitNetwork.Datil,
  debug: true,
});
await litContracts.connect();

const addPermittedAction = await litContracts.addPermittedAction({
  ipfsId,
  pkpTokenId,
  authMethodScopes: [2],
});
console.log(addPermittedAction);
