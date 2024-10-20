import { LitContracts } from "@lit-protocol/contracts-sdk";
import { BigNumber, Wallet } from "ethers";
import { getChronicalProvider } from "../utils/getProvider.mjs";
const provider = getChronicalProvider();
const wallet = new Wallet(process.env.PRIVATE_KEY, provider);

let contractClient = new LitContracts({
  signer: wallet,
  network: "habanero",
});

await contractClient.connect();

const { capacityTokenIdStr } = await contractClient.mintCapacityCreditsNFT({
  requestsPerDay: 86400, // 10 request per minute
  daysUntilUTCMidnightExpiration: 30,
});

console.log(capacityTokenIdStr);
