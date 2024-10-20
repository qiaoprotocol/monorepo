import { createGateway } from "@repo/ccip-gateway";
import {
  decodeAbiParameters,
  hexToString,
  parseAbiParameters,
  stringToHex,
  type Hex,
} from "viem";
import dotenv from "dotenv";
import { serve } from "@hono/node-server";

dotenv.config();

const gateway = createGateway(process.env.PRIVATE_KEY as string);

const qiaoAbi = [
  {
    name: "callOffchain",
    type: "function",
    inputs: [{ name: "input", type: "bytes" }],
    outputs: [{ name: "", type: "bytes" }],
  },
];

gateway.add(qiaoAbi, [
  {
    type: "callOffchain",
    func: async (args, call) => {
      const [input] = decodeAbiParameters(
        parseAbiParameters("bytes"),
        ("0x" + args) as `0x${string}`
      );

      // Here you would implement your actual off-chain logic
      const handleInput = (input: Hex): Hex => {
        const inputString = hexToString(input);
        const outPut = `Hello from CCIP-Read Gateway: ${inputString}`;
        return stringToHex(outPut);
      };
      const result = handleInput(input);

      return result;
    },
  },
]);

serve({
  fetch: gateway.app.fetch,
  port: 3002,
});
console.log(`CCIP-AI is running on 3002`);
