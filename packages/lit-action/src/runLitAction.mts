import * as dotenv from "dotenv";
import { ethers } from "ethers";
dotenv.config();

import { LitNodeClientNodeJs } from "@lit-protocol/lit-node-client-nodejs";
import { LitNetwork } from "@lit-protocol/constants";
import { getYellowStoneProvider } from "./utils/getProvider.mjs";
import {
  LitAbility,
  LitActionResource,
  LitPKPResource,
  createSiweMessageWithRecaps,
  generateAuthSig,
} from "@lit-protocol/auth-helpers";

const litNodeClient = new LitNodeClientNodeJs({
  litNetwork: LitNetwork.Datil,
  debug: true,
});
await litNodeClient.connect();

const provider = getYellowStoneProvider();
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const ethersSigner = wallet.connect(provider);
const capacityTokenId = "23843";

const { capacityDelegationAuthSig } =
  await litNodeClient.createCapacityDelegationAuthSig({
    dAppOwnerWallet: ethersSigner,
    capacityTokenId,
    delegateeAddresses: [ethersSigner.address, process.env.PKP_ETH_ADDRESS],
    uses: "1",
    expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
  });

const sessionSigs = await litNodeClient.getSessionSigs({
  chain: "ethereum",
  expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
  capabilityAuthSigs: [capacityDelegationAuthSig],
  resourceAbilityRequests: [
    {
      resource: new LitActionResource("*"),
      ability: LitAbility.LitActionExecution,
    },
  ],
  authNeededCallback: async ({ resourceAbilityRequests, expiration, uri }) => {
    const toSign = await createSiweMessageWithRecaps({
      uri: uri!,
      expiration: expiration!,
      resources: resourceAbilityRequests!,
      walletAddress: ethersSigner.address,
      nonce: await litNodeClient.getLatestBlockhash(),
      litNodeClient,
    });

    return await generateAuthSig({
      signer: ethersSigner,
      toSign,
    });
  },
});
const ipfsId = process.env.LIT_ACTION_CODE!;
const publicKey = process.env.PKP_PUB_KEY!;
// const JWTtoken = process.env.JWT_TOKEN!;
// const signatures = await litNodeClient.executeJs({
//   code: "",
//   ipfsId,
//   // authSig: await generateAuthSig(await nonce),
//   jsParams: {
//     JWTtoken:
//       "eyJraWQiOiJ2aFJzbiszRUZRbzJQQUdQREloWXY0dlpTMWJJbVc1N3ZFNkpUcklXbEFNPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJiYWE0OTEyMi1iYzk5LTQ1ZTYtOTAzNi0zY2JhMjNjN2Y3NTYiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV8zcmZtR3AxV0giLCJjbGllbnRfaWQiOiJhMnJqbzRjYjhqMG9kbDdpNXRkajQ0Y2JvIiwib3JpZ2luX2p0aSI6IjYyMTU0NmI5LTEzZDctNDAyZC1iMDMzLWI4ZTg2YTAzMjA3OCIsImV2ZW50X2lkIjoiYWRlZjk1ZjQtMzJjMi00YjM5LTg4MzYtMjE3NDhlZGE5MDZjIiwidG9rZW5fdXNlIjoiYWNjZXNzIiwic2NvcGUiOiJhd3MuY29nbml0by5zaWduaW4udXNlci5hZG1pbiIsImF1dGhfdGltZSI6MTcwNzM0NTE5NywiZXhwIjoxNzA3MzQ1NDk3LCJpYXQiOjE3MDczNDUxOTcsImp0aSI6ImY4NTVkMjBjLTVkMGMtNDVhMy1iZDQ1LTgwODM2ZWMyOWMzOCIsInVzZXJuYW1lIjoicGF0Y2gtdGVzdC1jbGVyayJ9.auDoF6TsChv1jsOWUuSbUe6sGvhS4rzqhMgBRHgdZxKSWuUIUNzcVtfnJWC5nQbLMj4x5OMPAV6Lj0ewSQSU72lmO2dSTXtsLY9TM83P9Qzsdfp9X8NFaC0_KNUkBBy9xLG21wwXqlE9tSEg8CRYOTcOkUXHKvWR5m965JgKnfzyGHQV_waF0Xht2Bo6LEMaGzcZzfjbRE27o-aHPQYv_UvNatWHepZ2xY8erHuJBqblpVEg6Mm3lKpgkle7zlj_KfJLwSHlQhAS5tEntVB5Oe1jIZWgDgMl-G-_8L5ijGVipHw-D2VzQUzL_x5UnaIr7XsroH176ebwlpdvxOfnHw",
//     clientId: "patch-test-clerk",
//     toSign: ethers.utils.arrayify(
//       ethers.utils.keccak256(new TextEncoder().encode("test"))
//     ),
//     publicKey,
//     sigName: "sig1",
//   },
//   debug: true,
//   authMethods: [],
// });

const sessionSignatures = await litNodeClient.getLitActionSessionSigs({
  pkpPublicKey: publicKey,
  capabilityAuthSigs: [capacityDelegationAuthSig],
  chain: "ethereum",
  resourceAbilityRequests: [
    {
      resource: new LitPKPResource("*"),
      ability: LitAbility.PKPSigning,
    },
    {
      resource: new LitActionResource("*"),
      ability: LitAbility.LitActionExecution,
    },
  ],
  litActionIpfsId: ipfsId,
  jsParams: {
    sender: "0x54C8Df2e33F43046DBD1c62da5016F1bA53b0EB3",
    validUntil: new Date(Date.now() + 1000 * 60 * 10).toISOString(),
    callData:
      "0xb23035c9000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000047465737400000000000000000000000000000000000000000000000000000000",
    result:
      "0x546869732069732061207375706572206c6f6e67206d6573736167652c2050726f636573736564206f66662d636861696e3a2074657374",
    publicKey,
    sigName: "sig1",
  },
});
// await litNodeClient.executeJs({
//   sessionSigs,
//   code: `(() => console.log("It works!"))();`,
// });

await litNodeClient.executeJs({
  sessionSigs: sessionSignatures,
});
// console.log(signatures);
