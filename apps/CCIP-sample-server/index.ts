import {
  createPublicClient,
  http,
  createWalletClient,
  custom,
  encodeAbiParameters,
  decodeAbiParameters,
  parseAbiParameters,
  keccak256,
  toHex,
  concat,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mainnet } from "viem/chains";
import { Hono } from "hono";

import { cors } from "hono/cors";

// Read the private key from the .env file
const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  throw new Error("PRIVATE_KEY must be set in .env file");
}

const account = privateKeyToAccount(`0x${privateKey}`);
const walletClient = createWalletClient({
  account,
  chain: mainnet,
  transport: http(),
});

// Create Hono app
const app = new Hono();

// Add CORS middleware
app.use("*", cors());

// Helper function to encode CCIP-Read response
function encodeCCIPReadResponse(
  response: string,
  validUntil: bigint
): `0x${string}` {
  return encodeAbiParameters(parseAbiParameters("bytes, uint64"), [
    response as `0x${string}`,
    validUntil,
  ]);
}

// Helper function to sign CCIP-Read response
async function signResponse(
  sender: `0x${string}`,
  data: `0x${string}`,
  response: `0x${string}`
): Promise<`0x${string}`> {
  const validUntil = BigInt(Math.floor(Date.now() / 1000) + 3600); // 1 hour from now
  const encodedResponse = encodeCCIPReadResponse(response, validUntil);

  const messageHash = keccak256(
    concat([
      sender,
      toHex(validUntil),
      keccak256(data),
      keccak256(encodedResponse),
    ])
  );

  const signature = await account.signMessage({
    message: { raw: messageHash },
  });

  return signature;
}

// GET endpoint for CCIP-Read
app.get("/:sender/:data.json", async (c) => {
  const sender = c.req.param("sender") as `0x${string}`;
  const data = `0x${c.req.param("data")}` as `0x${string}`;

  // Decode the calldata
  // Replace this with your specific decoding logic
  const decodedData = decodeAbiParameters(parseAbiParameters("bytes"), data)[0];

  // TODO: Implement your custom logic here
  // This is where you would fetch and process the requested data
  const response = `0x${Buffer.from("Hello from CCIP-Read Gateway").toString(
    "hex"
  )}` as `0x${string}`;

  const signature = await signResponse(sender, data, response);

  return c.json({
    data: response,
    signature,
  });
});

// POST endpoint for CCIP-Read
app.post("/", async (c) => {
  const body = await c.req.json();
  const sender = body.sender as `0x${string}`;
  const data = body.data as `0x${string}`;

  // Decode the calldata
  // Replace this with your specific decoding logic
  const decodedData = decodeAbiParameters(parseAbiParameters("bytes"), data)[0];

  // TODO: Implement your custom logic here
  // This is where you would fetch and process the requested data
  const response = `0x${Buffer.from("Hello from CCIP-Read Gateway").toString(
    "hex"
  )}` as `0x${string}`;

  const signature = await signResponse(sender, data, response);

  return c.json({
    data: response,
    signature,
  });
});

// Start the server
const port = 3000;
console.log(`CCIP-Read Gateway starting on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
/*
 * To use this template:
 * 1. Install dependencies: npm install viem hono @hono/node-server dotenv
 * 2. Create a .env file in the root directory and add your private key: PRIVATE_KEY=your_private_key_here
 * 3. Customize the decoding logic in the GET and POST endpoints to match your specific needs
 * 4. Implement your custom data fetching and processing logic where indicated by the TODO comments
 * 5. Run the server: npx ts-node gateway.ts
 *
 * Note: This is a development server and should not be used in production without additional security measures.
 */
