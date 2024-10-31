import { createGateway } from "@qiaoprotocol/ccip-gateway";
import {
  decodeAbiParameters,
  parseAbiParameters,
  encodePacked,
  type Address,
  encodeAbiParameters,
} from "viem";
import dotenv from "dotenv";
import { serve } from "@hono/node-server";
import { privateKeyToAddress } from "viem/accounts";

dotenv.config();

// Create gateway with your private key
const gateway = createGateway(process.env.PRIVATE_KEY as string);

// Mock database for balances - in production, use a real database
const balances = new Map<string, bigint>();

// ERC20 balanceOf ABI
const erc20Abi = [
  {
    name: "balanceOf",
    type: "function",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
];

// Helper function to get balance
async function getBalance(address: Address): Promise<bigint> {
  // In production, replace this with your actual balance fetching logic
  return balances.get(address.toLowerCase()) || BigInt(0);
}

// Add some test balances - remove this in production
function initializeTestBalances() {
  balances.set(
    "0x1234567890123456789012345678901234567890".toLowerCase(),
    BigInt("1000000000000000000")
  ); // 1 token
  balances.set(
    "0x2234567890123456789012345678901234567890".toLowerCase(),
    BigInt("2000000000000000000")
  ); // 2 tokens
  balances.set(
    privateKeyToAddress(`0x${process.env.PRIVATE_KEY}`).toLowerCase(),
    BigInt("3000000000000000000")
  );
}

initializeTestBalances();

gateway.add(erc20Abi, [
  {
    type: "balanceOf",
    func: async (args, call) => {
      // Decode the input address from the calldata
      const [account] = decodeAbiParameters(
        parseAbiParameters("address"),
        ("0x" + args) as `0x${string}`
      );

      // Get the balance for the address
      const balance = await getBalance(account);

      // Encode the balance as bytes
      const result = encodeAbiParameters(parseAbiParameters("uint256"), [
        balance,
      ]);

      return result;
    },
  },
]);

// Start the server
serve({
  fetch: gateway.app.fetch,
  port: 3002,
});

console.log(`ERC20 Gateway is running on port 3002`);
