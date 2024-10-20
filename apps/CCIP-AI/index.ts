import { createGateway } from "@qiaoprotocol/ccip-gateway";
import {
  decodeAbiParameters,
  hexToString,
  parseAbiParameters,
  stringToHex,
  type Hex,
} from "viem";
import dotenv from "dotenv";
import { serve } from "@hono/node-server";
import Anthropic from "@anthropic-ai/sdk";

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
      const handleInput = async (input: Hex): Promise<Hex> => {
        const inputString = hexToString(input);
        console.log(inputString);
        const anthropic = new Anthropic();

        const msg = await anthropic.messages.create({
          model: "claude-3-5-sonnet-20240620",
          max_tokens: 1000,
          temperature: 0,
          system: "Respond only with short poems.",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: inputString,
                },
              ],
            },
          ],
        });
        const outPut = msg;
        return stringToHex((outPut.content[0] as any).text);
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
