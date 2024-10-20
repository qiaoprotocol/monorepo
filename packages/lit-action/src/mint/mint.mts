import * as fs from "fs";
import { ethers } from "ethers";
import { base58_to_binary } from "base58-js";
import pkpMetadata from "../contracts/pkp-metadata.json" assert { type: "json" };
// import PKPPermissionsMetadata from "../contracts/PKPPermissions-metadata.json" assert { type: "json" };
import * as dotenv from "dotenv";
dotenv.config();
const env = fs.readFileSync("./.env", "utf8");
import { getPubKey, getEthAddress } from "../utils/pkpRouter.mjs";
import { getChronicalProvider } from "../utils/getProvider.mjs";
const provider = getChronicalProvider();
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const PKP = new ethers.Contract(pkpMetadata.address, pkpMetadata.abi, wallet);
const blockNumber = await provider.getBlockNumber();
const balance = await provider.getBalance(wallet.address);
console.log(
  "BlockNumber: " + blockNumber,
  "Balance for " + wallet.address + ":" + balance
);
// const PKPPermissions = new ethers.Contract(
//   await PKP.pkpPermissions(),
//   PKPPermissionsMetadata.abi,
//   wallet
// );

// const ipfsId = "QmZZxk8hQDdRgepQVPacuXqwfj48sVc68JxaEo9jFX2csu";
// const ipfsHashBytes = base58_to_binary(ipfsId);

// console.log("Getting ready to mint a new PKP");

// const checkHashForPubKey = async (txHash: string | Promise<string>) => {
//   const receipt = await provider.getTransactionReceipt(txHash);
//   const tokenId = ethers.BigNumber.from(receipt.logs[0].topics[3]).toString();
//   console.log("TokenID" + tokenId);
//   const pubKey = await getPubKey(tokenId);
//   console.log("PubKey" + pubKey);
//   const EthAddress = await getEthAddress(tokenId);
//   console.log("EthAddress" + EthAddress);
//   return [pubKey, tokenId, EthAddress];
// };

// const mintCost = Number(await PKP.mintCost());

// let overrides = {
//   value: mintCost,
// };

// const mintGrantAndBurnNext = await PKP.mintGrantAndBurnNext(
//   2,
//   ipfsHashBytes,
//   overrides
// );

// const mintNext = await PKP.mintNext(2, overrides);

// const mintNextAndAddAuthMethods = await PKPHelper.mintNextAndAddAuthMethods(
//   2, //keyType 2 = ECDSA
//   [1, 2], //authMethodType ADDRESS, // 1 ACTION, // 2 WEBAUTHN, // 3 DISCORD, // 4 GOOGLE, // 5 GOOGLE_JWT // 6
//   [wallet.address, new TextEncoder().encode(ipfsId)], //permittedAuthMethodIds,
//   [,], //permittedAuthMethodPubKeys,
//   [,], //permittedAuthMethodScopes,
//   true, //addPkpEthAddressAsPermittedAddress,
//   true, //sendPkpToItself
//   overrides
// );
// const mintNextAndAddAuthMethods = await PKPHelper.mintNextAndAddAuthMethods(
//   2,
//   [1, 2],
//   [wallet.address, new TextEncoder().encode(ipfsId)],
//   [,],
//   [,],
//   true,
//   true,
//   overrides
// );

// if (env.includes("PKP_PUB_KEY")) {
//   console.log(
//     "there is already a minted PKP, please remove it first to mint a new one"
//   );
//   process.exit(1);
// } else {
//   console.log("Getting ready to mint a new PKP");
//   mintGrantAndBurnNext.wait().then(async (receipt) => {
//     console.log(receipt);
//     const txHash = await mintGrantAndBurnNext.hash;
//     const [PKPpubKey, PKPtokenId, PKPEthAddress] = await checkHashForPubKey(
//       txHash
//     );
//     fs.appendFileSync(
//       "./.env",
//       `\nPKP_PUB_KEY=${PKPpubKey}\nPKP_TOKEN_ID=${PKPtokenId}\nPKP_ETH_ADDRESS=${PKPEthAddress}\n`
//     );
//     console.log(`successfully minted a new PKP with pubkey ${PKPpubKey}`);
//     process.exit(1);
//   });
// }

// mintNext.wait().then(async (receipt) => {
//   console.log(receipt);
//   const txHash = await mintNext.hash;
//   const [PKPpubKey, PKPtokenId, PKPEthAddress] = await checkHashForPubKey(
//     txHash
//   );
//   // fs.appendFileSync(
//   //   "./.env",
//   //   `\nPKP_PUB_KEY=${PKPpubKey}\nPKP_TOKEN_ID=${PKPtokenId}\nPKP_ETH_ADDRESS=${PKPEthAddress}\n`
//   // );
//   console.log(
//     `successfully minted a new PKP with pubkey ${
//       PKPpubKey + PKPtokenId + PKPEthAddress + txHash
//     }`
//   );
//   process.exit(1);
// });
