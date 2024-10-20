import ethers from "ethers";
import * as dotenv from "dotenv";
dotenv.config();
import { SiweMessage } from "siwe";
import { getProvider } from "./utils/getProvider.mjs";
const provider = getProvider("homestead");
const wallet = new ethers.Wallet(
  process.env.PRIVATE_KEY as `0x${string}`,
  provider
);

const domain = "localhost";
const origin = "http://localhost/login";

export async function generateAuthSig(nonce: string) {
  const expirationTime = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  const siweMessage = new SiweMessage({
    domain,
    address: await wallet.getAddress(),
    statement: "Sign in to localhost",
    uri: origin,
    version: "1",
    chainId: 1,
    nonce,
    expirationTime,
  });
  const messageToSign = siweMessage.prepareMessage();
  const sig = await wallet.signMessage(messageToSign);
  return {
    sig,
    derivedVia: "web3.eth.personal.sign",
    signedMessage: messageToSign,
    address: await wallet.getAddress(),
  };
}
